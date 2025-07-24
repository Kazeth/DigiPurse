import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, ScanLine } from 'lucide-react';
import { createWorker } from 'tesseract.js';

export default function DigiIdentity() {
    const [formData, setFormData] = useState({
        fullName: '',
        passportNumber: '',
        nationality: '',
        dateOfBirth: '',
        gender: '',
        dateOfExpiry: '',
        countryCode: '',
    });

    const [passportImage, setPassportImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState('');

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

    const handleUploadBoxClick = () => {
        fileInputRef.current.click();
    };

    const startScan = async () => {
        if (!passportImage) {
            alert('Insert Passport Image.');
            return;
        }

        setIsScanning(true);
        setScanResult('');

        let worker;
        try {
            worker = await createWorker('eng');

            const { data: { text } } = await worker.recognize(passportImage);

            setScanResult(text);
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

        console.log("Raw OCR Text:", text);
        console.log("Detected MRZ Lines:", mrzLines);

        if (!mrzLines || mrzLines.length < 2) {
            alert("Unable to detect two complete MRZ lines. The image quality might be poor.");
            return;
        }

        const potentialLines = mrzLines.slice(-2);

        let line1 = potentialLines.find(line => line.startsWith('P<'));
        let line2 = potentialLines.find(line => line !== line1);

        if (!line1 || !line2) {
            const hasManyDigits = (line) => /\d{7,}/.test(line);
            if (hasManyDigits(potentialLines[0]) && !hasManyDigits(potentialLines[1])) {
                line2 = potentialLines[0];
                line1 = potentialLines[1];
            } else {
                line2 = potentialLines[1];
                line1 = potentialLines[0];
            }
        }

        if (!line1 || !line2) {
            alert("Failed to differentiate MRZ lines. Please try again.");
            return;
        }

        const nameField = line1.substring(5).split('<<');
        const surname = nameField[0].replace(/</g, ' ').trim();
        const givenName = (nameField[1] || '').replace(/</g, ' ').trim();
        const fullName = `${givenName} ${surname}`.trim();

        const passportNumber = line2.substring(0, 9).replace(/</g, '');
        const nationality = line2.substring(10, 13).replace(/</g, '');
        const dob = line2.substring(13, 19);
        const gender = line2.substring(20, 21);
        const expiryDate = line2.substring(21, 27);

        const formatYYMMDD = (yymmdd) => {
            if (yymmdd.length !== 6) return '';
            let year = parseInt(yymmdd.substring(0, 2), 10);
            const month = yymmdd.substring(2, 4);
            const day = yymmdd.substring(4, 6);
            year = (year < 50) ? 2000 + year : 1900 + year;
            return `${year}-${month}-${day}`;
        };

        const formattedDob = formatYYMMDD(dob);
        const formattedExpiry = formatYYMMDD(expiryDate);
        const finalGender = gender === 'M' ? 'Male' : (gender === 'F' ? 'Female' : 'Other');

        setFormData(prev => ({
            ...prev,
            fullName,
            passportNumber,
            nationality,
            dateOfBirth: formattedDob,
            gender: finalGender,
            dateOfExpiry: formattedExpiry,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const formFields = [
        { id: 'fullName', label: 'Full Name', type: 'text' },
        { id: 'passportNumber', label: 'Passport Number', type: 'text' },
        { id: 'nationality', label: 'Nationality', type: 'text' },
        { id: 'dateOfBirth', label: 'Date Of Birth', type: 'date' },
        { id: 'gender', label: 'Sex/Gender', type: 'text' },
        { id: 'dateOfExpiry', label: 'Date Of Expiry', type: 'date' },
    ];

    return (
        <div className="bg-[#11071F] text-white min-h-[calc(100vh-10rem)] p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Verify Your Identity
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-purple-200/70">
                        To ensure platform security, you must complete your DigiIdentity profile before you can host an event.
                    </p>
                </div>

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
                                        {isScanning ? 'Scanning...' : (
                                            <>
                                                <ScanLine className="mr-2 h-4 w-4" /> Scan Passport
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Button type="submit" size="lg" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto px-16 py-6 text-lg font-semibold">
                            Save & Verify Identity
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}