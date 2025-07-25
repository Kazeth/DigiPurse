import React from 'react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

function FileDeleteModal({ fileName, fileSize, onClose, actor, loadFiles }) {
    const [isDeleting, setIsDeleting] = useState(null)

    async function handleFileDelete(actor, name, onClose, loadFiles) {
        setIsDeleting(true);
        try {
            const success = await actor.deleteFile(name);
            if (success) {
                await loadFiles();
                onClose();
            } else {
                console.error('Delete failed');
            }
        } catch (error) {
            console.error('Delete process terminated');
        } finally {
            setIsDeleting(false);
        }
    }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                <p className="text-lg font-semibold text-center mb-2 text-[#4C1D95]">
                    Are you sure you want to delete this file?</p>
                <p className="mb-1 text-base font-bold text-center text-[#4C1D95]">
                    {fileName}
                </p>
                <p className="mb-4 text-sm text-[#4C1D95]">
                    {fileSize}
                </p>
                <div className="flex justify-around px-4">
                    <Button
                        onClick={() => handleFileDelete(actor, fileName, onClose, loadFiles)}
                        className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        disabled={isDeleting}>
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </>
                        ) : (
                            'Delete'
                        )}
                    </Button>
                    <Button
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default FileDeleteModal;
