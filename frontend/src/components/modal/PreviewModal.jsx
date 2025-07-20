import React from 'react';

function PreviewModal({ fileName, previewType, previewUrl, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full relative">
                <div className="mb-2 text-sm text-[#4C1D95]">
                    {fileName}
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
                >
                    &times;
                </button>

                <div className="mt-6">
                    {console.log('3. Previewing:', { previewUrl, previewType })}
                    {previewType?.startsWith('image') && (
                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] mx-auto" />
                    )}
                    {previewType === 'application/pdf' && (
                        <iframe src={previewUrl} className="w-full h-[70vh]" title="PDF Preview" />
                    )}
                    {previewType?.startsWith('video') && (
                        <video src={previewUrl} controls className="w-full max-h-[70vh] mx-auto" />
                    )}
                    {previewType?.startsWith('audio') && (
                        <audio src={previewUrl} controls className="w-full" />
                    )}
                    {!['image', 'video', 'audio'].some(t => previewType?.startsWith(t)) &&
                        previewType !== 'application/pdf' && (
                            <div className="text-center text-gray-500">Preview is not available for this file type.</div>
                        )}
                </div>
            </div>
        </div>
    );
}

export default PreviewModal;
