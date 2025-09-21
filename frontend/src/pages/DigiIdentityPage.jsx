"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader2, ShieldCheck } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { File_manager } from "declarations/File_manager";
import { Identity_backend } from 'declarations/Identity_backend';
import { createActor as createRegistryActor } from "declarations/Registry_backend"; 
import { canisterId as registryCanisterId } from "declarations/Registry_backend";
import { useAuth } from '../lib/AuthContext';
import { motion } from 'framer-motion';

export default function DigiIdentity() {
    const { isAuthenticated, principal, authClient } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        passportNumber: '',
        nationality: '',
        dob: '',
        gender: '',
        dateOfExpiry: '',
        passportImageName: '',
        isVerified: false,
    });
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [passportImage, setPassportImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- All your existing functions remain unchanged ---
    const loadIdentity = async () => {
        if (!principal) return;
        setIsLoading(true);
        try {
            const existingIdentityOpt = await Identity_backend.getIdentity(principal);
            if (existingIdentityOpt.length > 0) {
                const identityData = existingIdentityOpt[0];
                setFormData(prevState => ({
                    ...prevState,
                    ...identityData,
                }));
                if (identityData.passportImageName) {
                    await loadFile(identityData.passportImageName);
                }
            }
        } catch (error) {
            console.error("Failed to load identity:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadFile = async (fileName) => {
        try {
            if (!fileName) return;
            const totalChunks = await File_manager.getTotalChunks(fileName);
            if (totalChunks === 0) return;
            const chunkPromises = [];
            for (let i = 0; i < totalChunks; i++) {
                chunkPromises.push(File_manager.getFileChunk(fileName, i));
            }
            const chunkResults = await Promise.all(chunkPromises);
            const fileTypeOpt = await File_manager.getFileType(fileName);
            const chunks = chunkResults
                .map(chunkOpt => chunkOpt.length > 0 ? new Uint8Array(chunkOpt[0]) : null)
                .filter(Boolean);
            const fileBlob = new Blob(chunks, { type: fileTypeOpt[0] || 'image/jpeg' });
            setImagePreview(URL.createObjectURL(fileBlob));
        } catch (error) {
            console.error("Failed to load image:", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadIdentity();
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated, principal]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setPassportImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadFile = async (file, fileName) => {
        const chunkSize = 1024 * 1024; // 1MB
        const buffer = await file.arrayBuffer();
        const totalChunks = Math.ceil(buffer.byteLength / chunkSize);
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = start + chunkSize;
            const chunk = new Uint8Array(buffer.slice(start, end));
            await File_manager.uploadFileChunk(fileName, Array.from(chunk), i, file.type);
        }
    };

    const handleUploadBoxClick = () => {
        fileInputRef.current.click();
    };

    const startScan = async () => {
        if (!passportImage) {
            alert('Please insert a Passport Image first.');
            return;
        }
        setIsScanning(true);
        let worker;
        try {
            worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(passportImage);
            parseOcrResultAndFillForm(text);
        } catch (error) {
            console.error("OCR Error:", error);
            alert("Failed to scan the image. Please check the image quality and try again.");
        } finally {
            if (worker) {
                await worker.terminate();
            }
            setIsScanning(false);
        }
    };

    const parseOcrResultAndFillForm = (text) => {
        const mrzRegex = /[A-Z0-9<]{44}/g;
        const mrzLines = text.match(mrzRegex);

        if (!mrzLines || mrzLines.length < 2) {
            alert("Could not detect the Machine-Readable Zone (MRZ). Please use a clearer image.");
            return;
        }

        const potentialLines = mrzLines.slice(-2);
        let line1 = potentialLines.find(line => line.startsWith('P<'));
        let line2 = potentialLines.find(line => line !== line1);

        if (!line1 || !line2) {
            alert("Failed to parse MRZ lines. Please ensure the bottom two lines of the passport are clear.");
            return;
        }

        const nameField = line1.substring(5).split('<<');
        const surname = nameField[0].replace(/</g, ' ').trim();
        const givenName = (nameField[1] || '').replace(/</g, ' ').trim();
        const fullName = `${givenName} ${surname}`.trim();

        const passportNumber = line2.substring(0, 9).replace(/</g, '');
        const nationality = line2.substring(10, 13).replace(/</g, '');
        const dobRaw = line2.substring(13, 19);
        const gender = line2.substring(20, 21);
        const expiryDateRaw = line2.substring(21, 27);

        const formatYYMMDD = (yymmdd) => {
            if (!yymmdd || yymmdd.length !== 6) return '';
            let year = parseInt(yymmdd.substring(0, 2), 10);
            const month = yymmdd.substring(2, 4);
            const day = yymmdd.substring(4, 6);
            year = (year < (new Date().getFullYear() % 100 + 5)) ? 2000 + year : 1900 + year;
            return `${year}-${month}-${day}`;
        };

        const formattedDob = formatYYMMDD(dobRaw);
        const formattedExpiry = formatYYMMDD(expiryDateRaw);
        const finalGender = gender === 'M' ? 'Male' : (gender === 'F' ? 'Female' : 'Other');

        setFormData(prev => ({
            ...prev,
            name: fullName,
            passportNumber,
            nationality,
            dob: formattedDob,
            gender: finalGender,
            dateOfExpiry: formattedExpiry,
        }));
    };

    const handleIdentitySubmit = async (e) => {
        e.preventDefault();
        const identity = authClient?.getIdentity();
        if (!principal) {
            alert("User principal not found. Cannot save.");
            return;
        }
        if (!passportImage && !imagePreview) {
            alert("Please upload a passport image.");
            return;
        }
        setIsSaving(true);
        try {
            let finalImageName = formData.passportImageName;
            if (passportImage) {
                finalImageName = `passport_${principal.toText()}_${Date.now()}`;
                await uploadFile(passportImage, finalImageName);
            }
            const dataToSave = {
                ...formData,
                passportImageName: finalImageName,
                isVerified: true,
            };
            await Identity_backend.saveIdentity(principal, dataToSave);
            setFormData(dataToSave);
            setShowModal(true);

            const registryActor = createRegistryActor(registryCanisterId, {
                agentOptions: { identity },
            });
            await registryActor.recordActivity(
                principal,
                { IdentityVerified: null },
                "Identity profile successfully verified."
            );
        } catch (error) {
            console.error("Save identity failed:", error);
            alert("Failed to save identity. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const formFields = [
        { id: 'name', label: 'Full Name', type: 'text' },
        { id: 'passportNumber', label: 'Passport Number', type: 'text' },
        { id: 'nationality', label: 'Nationality', type: 'text' },
        { id: 'dob', label: 'Date Of Birth', type: 'date' },
        { id: 'gender', label: 'Sex/Gender', type: 'text' },
        { id: 'dateOfExpiry', label: 'Date Of Expiry', type: 'date' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
        );
    }

    return (
        // --- MODIFIED: Applied consistent page wrapper style ---
        <div className="min-h-screen w-full bg-black text-white px-4 sm:px-6 lg:px-8 pt-28 pb-12
                        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                        from-purple-900/40 via-fuchsia-900/10 to-black">
            <div className="container mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                            {formData.isVerified ? "Your Verified Identity" : "Verify Your Identity"}
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-purple-200/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                            {formData.isVerified 
                                ? "This information is stored securely on the blockchain." 
                                : "Complete your profile to securely manage your identity for event verification."
                            }
                        </p>
                    </div>
                    
                    {formData.isVerified ? (
                        // --- MODIFIED: Redesigned the "Verified" display card ---
                        <div className="max-w-4xl mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                            <div className="flex items-center justify-center sm:justify-start gap-4 mb-6 pb-6 border-b border-white/10">
                                <ShieldCheck className="h-10 w-10 text-green-400" />
                                <div>
                                    <h2 className="text-2xl font-bold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>Identity Verified</h2>
                                    <p className="text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Your information is confirmed and active.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-lg">
                                {formFields.map(field => (
                                    <div key={field.id}>
                                        <p className="text-purple-400/80 block text-sm font-semibold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>{field.label}</p> 
                                        <p className="mt-1" style={{ fontFamily: 'AeonikLight, sans-serif' }}>{formData[field.id]}</p>
                                    </div>
                                ))}
                            </div>
                            {imagePreview && (
                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <p className="text-purple-400/80 block text-sm font-semibold mb-4 text-center" style={{ fontFamily: 'AeonikBold, sans-serif' }}>Passport Image</p>
                                    <img src={imagePreview} alt="Passport" className="rounded-md max-h-80 object-contain mx-auto" />
                                </div>
                            )}
                        </div>
                    ) : (
                        // --- MODIFIED: Wrapped the form in a consistent "glass" card ---
                        <form onSubmit={handleIdentitySubmit} className="max-w-6xl mx-auto bg-black/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                    {formFields.map(field => (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor={field.id} className="font-medium text-purple-300" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                                {field.label}
                                            </Label>
                                            <Input id={field.id} type={field.type} value={formData[field.id]} onChange={handleInputChange} className="bg-black/20 border-purple-400/30 focus:border-purple-400 focus:ring-purple-400 placeholder:text-gray-500" required style={{ fontFamily: 'AeonikLight, sans-serif' }} />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <Label className="font-medium text-purple-300" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                        Passport Image
                                    </Label>
                                    <div onClick={handleUploadBoxClick} className="w-full aspect-video rounded-lg border-2 border-dashed border-purple-400/30 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-black/20 transition-all duration-300 bg-black/10">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Passport Preview" className="w-full h-full object-contain rounded-md p-1" />
                                        ) : (
                                            <div className="text-center text-purple-200/80 p-4">
                                                <PlusCircle className="mx-auto h-12 w-12 text-purple-300/80 mb-4" />
                                                <p className="font-semibold" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Click to upload Passport Image</p>
                                                <p className="text-xs mt-1">PNG, JPG, or JPEG</p>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg, image/jpg" />
                                    {imagePreview && (
                                        <Button type="button" onClick={startScan} disabled={isScanning} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                            {isScanning ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                                            {isScanning ? 'Scanning...' : 'Scan Image to Autofill'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-12 text-center">
                                <Button type="submit" size="lg" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto px-16 py-6 text-lg font-semibold disabled:opacity-50" disabled={isSaving} style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                                    {isSaving ? 'Saving...' : 'Save & Verify Identity'}
                                </Button>
                            </div>
                        </form>
                    )}
    
                    {showModal && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-[#1e1033] p-8 rounded-2xl shadow-2xl shadow-purple-900/50 border border-purple-400/30 text-center max-w-sm w-full">
                                <ShieldCheck className="mx-auto h-16 w-16 text-green-400 mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                    Identity Verified!
                                </h2>
                                <p className="text-purple-200/80 mb-6" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                    Your DigiIdentity profile has been created and securely saved.
                                </p>
                                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setShowModal(false)} style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>    
    );  
}