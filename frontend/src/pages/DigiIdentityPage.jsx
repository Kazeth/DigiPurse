import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, ScanLine, Loader2 } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { File_manager } from "declarations/File_manager";
import { Identity_backend } from 'declarations/Identity_backend';
import { useAuth } from '../lib/AuthContext';

export default function DigiIdentity() {
    const { isAuthenticated, principal } = useAuth();
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

    const [isSaving, setIsSaving] = useState(false);
    const [passportImage, setPassportImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadIdentity = async () => {
        if (!principal) return;
        setIsLoading(true);
        try {
            const existingIdentityOpt = await Identity_backend.getIdentity(principal);
            if (existingIdentityOpt.length > 0) {
                const identityData = existingIdentityOpt[0];

                // PERBAIKAN: Gabungkan state sebelumnya dengan data dari backend
                // Ini mencegah error "controlled to uncontrolled"
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
            if (!fileName) return; // Jangan lakukan apa-apa jika tidak ada nama file

            // 1. Dapatkan jumlah total potongan file
            const totalChunks = await File_manager.getTotalChunks(fileName);
            if (totalChunks === 0) return;

            // 2. Siapkan semua promise untuk mengambil setiap potongan
            const chunkPromises = [];
            for (let i = 0; i < totalChunks; i++) {
                chunkPromises.push(File_manager.getFileChunk(fileName, i));
            }

            // 3. Ambil semua potongan secara paralel
            const chunkResults = await Promise.all(chunkPromises);
            const fileTypeOpt = await File_manager.getFileType(fileName);

            // 4. Proses dan gabungkan semua potongan menjadi satu file
            const chunks = chunkResults
                .map(chunkOpt => chunkOpt.length > 0 ? new Uint8Array(chunkOpt[0]) : null)
                .filter(Boolean);

            const fileBlob = new Blob(chunks, { type: fileTypeOpt[0] || 'image/jpeg' });

            // 5. Buat URL dari file tersebut dan tampilkan
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
        const totalChunks = Math.ceil(file.size / chunkSize);

        const buffer = await file.arrayBuffer();

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const chunk = new Uint8Array(buffer.slice(start, end));

            await File_manager.uploadFileChunk(fileName, Array.from(chunk), i, file.type);
        }
    };

    const handleUploadBoxClick = () => {
        fileInputRef.current.click();
    };

    const startScan = async () => {
        if (!passportImage) {
            alert('Insert Passport Image.');
            return;
        }

        setIsScanning(true);

        let worker;
        try {
            worker = await createWorker('eng');

            const { data: { text } } = await worker.recognize(passportImage);

            console.log("OCR Result:", text);

            parseOcrResultAndFillForm(text);

        } catch (error) {
            console.error("OCR Error:", error);
            alert("Failed To Scan Image.");
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
            alert("Unable to detect two complete MRZ lines.");
            return;
        }

        const potentialLines = mrzLines.slice(-2);
        let line1 = potentialLines.find(line => line.startsWith('P<'));
        let line2 = potentialLines.find(line => line !== line1);

        if (!line1 || !line2) { /* ... logika fallback ... */ }
        if (!line1 || !line2) {
            alert("Failed to differentiate MRZ lines.");
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
            // Logika tahun ini sudah tepat
            year = (year < 50) ? 2000 + year : 1900 + year;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!principal) {
            alert("User principal not found. Cannot save.");
            return;
        }
        if (!passportImage && !imagePreview) {
            alert('Please upload a passport image.');
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
                name: formData.name,
                passportNumber: formData.passportNumber,
                nationality: formData.nationality,
                dob: formData.dob,
                gender: formData.gender,
                passportImageName: finalImageName,
                isVerified: true,
                dateOfExpiry: formData.dateOfExpiry,
            };

            // PERBAIKAN: Kirim 'principal' sebagai argumen pertama
            await Identity_backend.saveIdentity(principal, dataToSave);
            alert('Identity information saved successfully!');
            setFormData(dataToSave); // Update state lokal
        } catch (error) {
            console.error("Failed to save identity:", error);
            alert('An error occurred while saving.');
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
            <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-[#11071F] text-white min-h-[calc(100vh-10rem)] p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        {formData.isVerified ? "Your Verified Identity" : "Verify Your Identity"}
                    </h1>
                    {!formData.isVerified && (
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-purple-200/70">
                            To ensure platform security, you must complete your DigiIdentity profile before you can host an event.
                        </p>
                    )}
                </div>

                {/* PERBAIKAN FINAL: Gunakan 'formData.isVerified' untuk kondisi dan nama field yang benar untuk data */}
                {formData.isVerified ? (
                    <div className="max-w-4xl mx-auto bg-white/5 p-8 rounded-lg border border-purple-300/30 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <p className="mt-2"><strong className="text-purple-400/80 block text-sm">Full Name:</strong> {formData.name}</p>
                                <p className="mt-2"><strong className="text-purple-400/80 block text-sm">Passport Number:</strong> {formData.passportNumber}</p>
                                <p className="mt-2"><strong className="text-purple-400/80 block text-sm">Nationality:</strong> {formData.nationality}</p>
                            </div>
                            <div>
                                <p className="mt-2"><strong className="text-purple-400/80 block text-sm">Date of Birth:</strong> {formData.dob}</p>
                                <p className="mt-2"><strong className="text-purple-400/80 block text-sm">Gender:</strong> {formData.gender}</p>
                                <p className="mt-2"><strong className="text-purple-400/80 block text-sm">Expiry Date:</strong> {formData.dateOfExpiry}</p>
                            </div>
                        </div>
                        <div className="flex justify-center items-center pt-4 border-t border-white/10">
                            <img
                                src={imagePreview}
                                alt="Passport"
                                className="rounded-md max-h-64 object-contain"
                            />
                        </div>
                    </div>
                ) : (
                    // Jika tidak terverifikasi, tampilkan form
                    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                {formFields.map(field => (
                                    <div key={field.id} className="space-y-2">
                                        <Label htmlFor={field.id} className="font-medium text-purple-300">{field.label}</Label>
                                        <Input
                                            id={field.id}
                                            type={field.type}
                                            value={formData[field.id]}
                                            onChange={handleInputChange}
                                            className="bg-white/5 border-purple-400/40 focus:border-purple-400 focus:ring-purple-400 placeholder:text-gray-500"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <Label className="font-medium text-purple-300">Passport Image</Label>
                                <div
                                    onClick={handleUploadBoxClick}
                                    className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-purple-400/60 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-white/10 transition-all duration-300 bg-white/5"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Passport Preview" className="w-full h-full object-contain rounded-md p-2" />
                                    ) : (
                                        <div className="text-center text-purple-200/80 p-4">
                                            <PlusCircle className="mx-auto h-16 w-16 text-purple-300/80 mb-4" />
                                            <p className="font-semibold">Please Put Your Passport Image</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg"
                                />
                                {imagePreview && (
                                    <div className="text-center space-y-4 pt-4">
                                        <Button
                                            type="button"
                                            onClick={startScan}
                                            disabled={isScanning}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500"
                                        >
                                            {isScanning ? <Loader2 className="animate-spin" /> : 'Scan Passport'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-12 text-center">
                            <Button type="submit" size="lg" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto px-16 py-6 text-lg font-semibold" disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin" /> : 'Save & Verify Identity'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );

}