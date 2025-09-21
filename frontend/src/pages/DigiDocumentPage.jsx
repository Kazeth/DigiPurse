"use client";

import { createActor, canisterId } from 'declarations/File_manager';
import { useAuth } from '../lib/AuthContext';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PreviewModal from '@/components/modal/PreviewModal';
import FileDeleteModal from '@/components/modal/FileDeleteModal';
import { motion } from 'framer-motion';
import { Loader2, Search, Eye, Download, Trash2, UploadCloud, FileImage, FileVideo, FileText, File as FileIcon, X, ServerCrash } from 'lucide-react';
import { useTransfer } from '@/lib/TransferProgressContext';

// Thumbnail Preview Component (No changes needed here, it's already great)
const FilePreview = ({ file, actor, getIcon }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchThumbnail = async () => {
            const ext = file.name.split('.').pop().toLowerCase();
            if (!['jpg', 'jpeg', 'png', 'gif'].includes(ext) || !actor) {
                setIsLoading(false);
                return;
            }
            try {
                const totalChunks = Number(await actor.getTotalChunks(file.name));
                const fileTypeResult = await actor.getFileType(file.name);
                const fileType = fileTypeResult[0] || 'application/octet-stream';
                let chunks = [];
                for (let i = 0; i < totalChunks; i++) {
                    const chunkBlob = await actor.getFileChunk(file.name, BigInt(i));
                    chunks.push(chunkBlob[0]);
                }
                const blob = new Blob(chunks, { type: fileType });
                const url = URL.createObjectURL(blob);
                setThumbnailUrl(url);
            } catch (error) {
                console.error("Failed to load thumbnail for", file.name, error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchThumbnail();
        return () => {
            if (thumbnailUrl) {
                URL.revokeObjectURL(thumbnailUrl);
            }
        };
    }, [file, actor]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 text-purple-400 animate-spin" /></div>;
    }
    if (thumbnailUrl) {
        return <img src={thumbnailUrl} alt={`Preview of ${file.name}`} className="w-full h-full object-cover" />;
    }
    return getIcon(file.name);
};

export default function DigiDocumentPage() {
    const { isAuthenticated, authClient } = useAuth();
    const [actor, setActor] = useState(null);
    const [files, setFiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(null);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [activePreviewFile, setActivePreviewFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [filterType, setFilterType] = useState('all');
    const { updateProgress, removeProgress } = useTransfer();
    const fileInputRef = useRef(null);

    // All existing useEffect and handler functions remain unchanged...
    // ... (loadFiles, handleFileUpload, handleFileDownload, etc.)
        useEffect(() => {
        if (isAuthenticated) {
            const identity = authClient.getIdentity();
            const newActor = createActor(canisterId, { agentOptions: { identity } });
            setActor(newActor);
        }
    }, [isAuthenticated, authClient]);

    useEffect(() => {
        if (actor) {
            loadFiles();
        }
    }, [actor]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    async function loadFiles() {
        if (!actor) return;
        try {
            const fileList = await actor.getFiles();
            setFiles(fileList);
        } catch (error) {
            console.error('Failed to load files:', error);
            setErrorMessage('Failed to load files. The server may be busy.');
        }
    }

    async function handleFileUpload(event) {
        const selectedFiles = event.target.files;
        setErrorMessage('');
        for (const file of selectedFiles) {
            if (!file) continue;
            if (await actor.checkFileExists(file.name)) {
                setErrorMessage(`File "${file.name}" already exists. Skipping.`);
                continue;
            }
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = new Uint8Array(e.target.result);
                const chunkSize = 1024 * 1024;
                const totalChunks = Math.ceil(content.length / chunkSize);
                try {
                    for (let i = 0; i < totalChunks; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, content.length);
                        const chunk = content.slice(start, end);
                        await actor.uploadFileChunk(file.name, Array.from(chunk), BigInt(i), file.type);
                        updateProgress(file.name, Math.floor(((i + 1) / totalChunks) * 100), 'Uploading');
                    }
                } catch (error) {
                    console.error('Upload failed:', error);
                    setErrorMessage(`Failed to upload ${file.name}.`);
                } finally {
                    await loadFiles();
                    removeProgress(file.name);
                }
            };
            reader.readAsArrayBuffer(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    async function handleFileDownload(name) {
        updateProgress(name, 0, 'Downloading');
        try {
            const totalChunks = Number(await actor.getTotalChunks(name));
            const fileTypeResult = await actor.getFileType(name);
            const fileType = fileTypeResult[0] || 'application/octet-stream';
            let chunks = [];
            for (let i = 0; i < totalChunks; i++) {
                const chunkBlob = await actor.getFileChunk(name, BigInt(i));
                chunks.push(chunkBlob[0]);
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
            setErrorMessage(`Failed to download ${name}.`);
        } finally {
            removeProgress(name);
        }
    }

    function handleDeleteClick(file) {
        setFileToDelete(file);
        setShowDeleteModal(true);
    }

    async function handleFilePreview(name) {
        setPreviewLoading(name);
        setActivePreviewFile(name);
        try {
            const totalChunks = Number(await actor.getTotalChunks(name));
            const fileTypeResult = await actor.getFileType(name);
            const fileType = fileTypeResult[0] || 'application/octet-stream';
            let chunks = [];
            for (let i = 0; i < totalChunks; i++) {
                const chunkBlob = await actor.getFileChunk(name, BigInt(i));
                chunks.push(chunkBlob[0]);
            }
            const blob = new Blob(chunks, { type: fileType });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setPreviewType(fileType);
            setShowPreviewModal(true);
        } catch (error) {
            setErrorMessage(`Failed to generate preview for ${name}.`);
        } finally {
            setPreviewLoading(null);
        }
    }

    const formatBytes = (bytes) => {
        if (!bytes || isNaN(bytes)) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        const iconClass = "h-12 w-12 text-purple-300";
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return <FileImage className={iconClass} />;
        if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return <FileVideo className={iconClass} />;
        if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return <FileText className={iconClass} />;
        return <FileIcon className={iconClass} />;
    };

    const isPreviewable = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        return ['pdf', 'jpg', 'jpeg', 'png', 'mp4', 'mp3'].includes(ext);
    };

    const filteredAndSortedFiles = useMemo(() => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
        const videoExtensions = ['mp4', 'mov', 'avi', 'webm'];
        const docExtensions = ['pdf', 'doc', 'docx', 'txt'];
        return files
            .filter(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                if (filterType === 'images') return imageExtensions.includes(ext);
                if (filterType === 'videos') return videoExtensions.includes(ext);
                if (filterType === 'documents') return docExtensions.includes(ext);
                return true;
            })
            .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                switch (sortBy) {
                    case 'name_asc': return a.name.localeCompare(b.name);
                    case 'name_desc': return b.name.localeCompare(a.name);
                    case 'size_asc': return Number(a.size) - Number(b.size);
                    case 'size_desc': return Number(b.size) - Number(a.size);
                    case 'recent':
                    default:
                        return 0; // Replace with actual timestamp sort if available
                }
            });
    }, [files, searchQuery, sortBy, filterType]);

    // --- Animation Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        // --- MODIFIED: Main page container with consistent styling ---
        <div className="min-h-screen w-full bg-black text-white px-4 sm:px-6 lg:px-8 pt-28 pb-12
                        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                        from-purple-900/40 via-fuchsia-900/10 to-black">
            <div className="container mx-auto">
                {/* --- MODIFIED: Page Header --- */}
                <motion.div 
                    initial="hidden" animate="visible" variants={containerVariants}
                    className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 pb-8 border-b border-white/10"
                >
                    <motion.div variants={itemVariants}>
                        <h1 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                            My Documents
                        </h1>
                        <p className="text-lg text-purple-300/80 mt-1" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                            Your secure, decentralized file storage.
                        </p>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <Button
                            onClick={() => fileInputRef.current.click()}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2 px-6 py-5 text-base"
                            style={{ fontFamily: 'AeonikBold, sans-serif' }}
                        >
                            <UploadCloud className="h-5 w-5" />
                            Upload Files
                        </Button>
                    </motion.div>
                </motion.div>

                {/* --- MODIFIED: Control bar with "glass" effect --- */}
                <motion.div 
                    initial="hidden" animate="visible" variants={containerVariants}
                    className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4"
                >
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text" placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-black/20 pl-10 border-purple-400/30 focus:border-purple-400 focus:ring-purple-400 placeholder:text-purple-400/50"
                            style={{ fontFamily: 'AeonikLight, sans-serif' }}
                        />
                    </div>
                    <div className="flex gap-4">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full md:w-[180px] bg-black/20 border-purple-400/30" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1e1033] text-white border-purple-400/50">
                                <SelectItem value="all" style={{ fontFamily: 'AeonikLight, sans-serif' }}>All Files</SelectItem>
                                <SelectItem value="images" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Images</SelectItem>
                                <SelectItem value="videos" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Videos</SelectItem>
                                <SelectItem value="documents" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Documents</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full md:w-[180px] bg-black/20 border-purple-400/30" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1e1033] text-white border-purple-400/50">
                                <SelectItem value="recent" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Recently Added</SelectItem>
                                <SelectItem value="name_asc" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Name (A-Z)</SelectItem>
                                <SelectItem value="name_desc" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Name (Z-A)</SelectItem>
                                <SelectItem value="size_desc" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Size (Largest)</SelectItem>
                                <SelectItem value="size_asc" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Size (Smallest)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>
                
                {errorMessage && (
                    <div className="flex items-center justify-between mt-4 rounded-2xl border border-red-400/50 bg-red-900/30 p-3 text-red-300 backdrop-blur-sm">
                        <p style={{ fontFamily: 'AeonikLight, sans-serif' }}>{errorMessage}</p>
                        <Button onClick={() => setErrorMessage('')} variant="ghost" size="icon" className="text-red-300 hover:text-white hover:bg-red-500/20">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                )}
                
                {/* --- MODIFIED: File Grid with "glass" cards and animations --- */}
                {filteredAndSortedFiles.length > 0 ? (
                    <motion.div 
                        initial="hidden" animate="visible" variants={containerVariants}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                    >
                        {filteredAndSortedFiles.map((file) => (
                            <motion.div 
                                key={file.name} 
                                variants={itemVariants} 
                                className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 hover:border-purple-400/50 hover:-translate-y-1 group"
                            >
                                <div className="bg-black/20 aspect-video flex items-center justify-center overflow-hidden">
                                    <FilePreview file={file} actor={actor} getIcon={getFileIcon} />
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <p className="font-semibold truncate flex-grow" title={file.name} style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-purple-300/80 mt-1" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                        {formatBytes(Number(file.size))}
                                    </p>
                                </div>
                                <div className="p-2 border-t border-white/10 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isPreviewable(file.name) ? (
                                        <Button variant="ghost" size="icon" onClick={() => handleFilePreview(file.name)} disabled={previewLoading === file.name} title="Preview">
                                            {previewLoading === file.name ? <Loader2 className="h-5 w-5 animate-spin" /> : <Eye className="h-5 w-5 text-purple-300 hover:text-white" />}
                                        </Button>
                                    ) : <div className='w-10 h-10'></div>}
                                    <Button variant="ghost" size="icon" onClick={() => handleFileDownload(file.name)} title="Download">
                                        <Download className="h-5 w-5 text-purple-300 hover:text-white" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(file)} title="Delete">
                                        <Trash2 className="h-5 w-5 text-red-400 hover:text-white" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    // --- MODIFIED: Enhanced "Empty State" view ---
                    <div className="mt-16 text-center text-purple-300/70 flex flex-col items-center">
                        <div className="w-full max-w-lg bg-black/30 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-12">
                             <ServerCrash className="h-16 w-16 mb-4 text-purple-400/50" />
                            <p className="text-xl font-medium text-white" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                No documents found
                            </p>
                            <p className="mt-2" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                Try adjusting your filters or upload a new file to get started.
                            </p>
                             <Button
                                onClick={() => fileInputRef.current.click()}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2 mt-6"
                                style={{ fontFamily: 'AeonikBold, sans-serif' }}
                            >
                                <UploadCloud className="h-5 w-5" />
                                Upload Your First File
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            {showPreviewModal && previewUrl && (
                <PreviewModal
                    fileName={activePreviewFile} previewUrl={previewUrl} previewType={previewType}
                    onClose={() => {
                        setShowPreviewModal(false); URL.revokeObjectURL(previewUrl); setPreviewUrl(null);
                        setPreviewType(null); setActivePreviewFile(null);
                    }}
                />
            )}
            {showDeleteModal && fileToDelete && (
                <FileDeleteModal
                    actor={actor} fileName={fileToDelete.name} fileSize={formatBytes(Number(fileToDelete.size))}
                    onClose={() => setShowDeleteModal(false)}
                    onSuccess={() => {
                        setFiles(files.filter(f => f.name !== fileToDelete.name));
                        setShowDeleteModal(false);
                    }}
                />
            )}
        </div>
    );
}