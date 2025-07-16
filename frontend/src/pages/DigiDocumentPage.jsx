import { AuthClient } from '@dfinity/auth-client';
import { createActor } from 'declarations/Document_backend';
import { canisterId } from 'declarations/backend/index.js';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

import { Document_backend } from 'declarations/Document_backend';


const network = process.env.DFX_NETWORK;
const identityProvider =
    network === 'ic'
        ? 'https://identity.ic0.app' // Mainnet
        : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'; // Local

export default function DigiDocumentPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authClient, setAuthClient] = useState();
    const [actor, setActor] = useState();
    const [files, setFiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState();
    const [filesTransferProgress, setFilesTransferProgress] = useState([]);

    useEffect(() => {

    }, []);

    useEffect(() => {
        updateActor();
        setErrorMessage();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadFiles();
        }
    }, [isAuthenticated]);

    async function updateActor() {
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        const actor = createActor(canisterId, {
            agentOptions: {
                identity
            }
        });
        const isAuthenticated = await authClient.isAuthenticated();

        setActor(actor);
        setAuthClient(authClient);
        setIsAuthenticated(isAuthenticated);
    }

    async function updateProgress(fileName, progress, mode) {
        setFilesTransferProgress((prevList) => {
            const existingIndex = prevList.findIndex(item => item.fileName === fileName);
            const updatedItem = { fileName, progress, mode };

            if (existingIndex >= 0) {
                const newList = [...prevList];
                newList[existingIndex] = updatedItem;
                return newList;
            } else {
                return [...prevList, updatedItem];
            }
        });
    }

    async function removeProgress(fileName) {
        setFilesTransferProgress((prevList) =>
            prevList.filter(item => item.fileName !== fileName)
        );
    }

    async function loadFiles() {
        try {
            const fileList = await actor.getFiles();
            setFiles(fileList);
        } catch (error) {
            console.error('Failed to load files:', error);
            setErrorMessage('Failed to load files. Please try again.');
        }
    }

    async function handleFileUpload(event) {
        const files = event.target.files;
        setErrorMessage();

        for (const file of files) {

            if (!file) {
                continue;
            }

            if (await actor.checkFileExists(file.name)) {
                setErrorMessage(`File "${file.name}" already exists. Skipping the file...`);
                continue;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = new Uint8Array(e.target.result);
                const chunkSize = 1024 * 1024; // 1 MB chunks
                const totalChunks = Math.ceil(content.length / chunkSize);


                try {
                    for (let i = 0; i < totalChunks; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, content.length);
                        const chunk = content.slice(start, end);

                        await actor.uploadFileChunk(file.name, chunk, BigInt(i), file.type);
                        updateProgress(file.name, Math.floor(((i + 1) / totalChunks) * 100), 'Uploading');
                    }
                } catch (error) {
                    console.error('Upload failed:', error);
                    setErrorMessage(`Failed to upload ${file.name}: ${error.message}`);
                } finally {
                    await loadFiles();
                    removeProgress(file.name);
                }
            };

            reader.readAsArrayBuffer(file);
        }
    }

    async function handleFileDownload(name) {
        updateProgress(name, 0, 'Downloading');
        try {
            const totalChunks = Number(await actor.getTotalChunks(name));
            const fileType = await actor.getFileType(name)[0];
            let chunks = [];

            for (let i = 0; i < totalChunks; i++) {
                const chunkBlob = await actor.getFileChunk(name, BigInt(i));
                if (chunkBlob) {
                    chunks.push(chunkBlob[0]);
                } else {
                    throw new Error(`Failed to retrieve chunk ${i}`);
                }

                updateProgress(name, Math.floor(((i + 1) / totalChunks) * 100), 'Downloading');
            }

            const data = new Blob(chunks, { type: fileType });
            const url = URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            setErrorMessage(`Failed to download ${name}: ${error.message}`);
        } finally {
            removeProgress(name);
        }
    }

    async function handleFileDelete(name) {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                const success = await actor.deleteFile(name);
                if (success) {
                    await loadFiles();
                } else {
                    setErrorMessage('Failed to delete file');
                }
            } catch (error) {
                console.error('Delete failed:', error);
                setErrorMessage(`Failed to delete ${name}: ${error.message}`);
            }
        }
    }

    async function handleFilePreview(name) {

    }

    return (
        <div className="container mx-auto p-4">
            <div>
                <div className="mb-4">
                    <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                {errorMessage && (
                    <div className="mt-4 rounded-md border border-red-400 bg-red-100 p-3 text-red-700">{errorMessage}</div>
                )}

                {filesTransferProgress.length > 0 && (
                    <div>
                        {filesTransferProgress.map((item) => (
                            <div key={item.fileName}className="mb-4">
                                <p className="mb-2 text-sm text-white">
                                    {`${item.mode} ${item.fileName}`}
                                </p>
                                <p className='mb-2 text-[2vw] text-white'>
                                    {`${item.progress} %`}
                                </p>
                            </div>

                        ))}

                    </div>
                )}

                <div className="space-y-2">
                    {files.length === 0 ? (
                        <p className="py-8 text-center text-gray-500">You have no files. Upload some!</p>
                    ) : (
                        files.map((file) => (
                            <div key={file.name} className="flex items-center justify-between rounded-lg bg-white p-3 shadow text-[#4C1D95]">
                                <div className="flex items-center space-x-2">
                                    <span>{file.name}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <Button onClick={() => handleFilePreview(file.name)} className="btn">
                                        Preview
                                    </Button>
                                    <Button onClick={() => handleFileDownload(file.name)} className="btn">
                                        Download
                                    </Button>
                                    <Button onClick={() => handleFileDelete(file.name)} className="btn">
                                        Delete
                                    </Button>

                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}

