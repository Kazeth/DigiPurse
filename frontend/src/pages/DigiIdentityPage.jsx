import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';

export default function DigiIdentity() {
    const [formData, setFormData] = useState({
        fullName: '',
        passportNumber: '',
        nationality: '',
        placeOfBirth: '',
        dateOfBirth: '',
        gender: '',
        dateOfIssue: '',
        dateOfExpiry: '',
        countryCode: '',
    });

    const [passportImage, setPassportImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

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

    // Allows triggering the hidden file input
    const handleUploadBoxClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!passportImage) {
            alert('Please upload a passport image.');
            return;
        }
        console.log('Submitting Form Data:', formData);
        console.log('Submitting Passport Image:', passportImage.name);
        alert('Identity information saved successfully!');
    };

    const formFields = [
        { id: 'fullName', label: 'Full Name', type: 'text' },
        { id: 'passportNumber', label: 'Passport Number', type: 'text' },
        { id: 'nationality', label: 'Nationality', type: 'text' },
        { id: 'placeOfBirth', label: 'Place Of Birth', type: 'text' },
        { id: 'dateOfBirth', label: 'Date Of Birth', type: 'date' },
        { id: 'gender', label: 'Sex/Gender', type: 'text' },
        { id: 'dateOfIssue', label: 'Date Of Issue', type: 'date' },
        { id: 'dateOfExpiry', label: 'Date Of Expiry', type: 'date' },
        { id: 'countryCode', label: 'Country Code', type: 'text' },
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

                        <div className="space-y-2">
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