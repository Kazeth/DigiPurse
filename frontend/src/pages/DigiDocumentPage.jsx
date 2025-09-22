import { useState, useEffect, useMemo, useRef } from 'react';
import { createActor, canisterId } from 'declarations/File_manager';
import { useAuth } from '../lib/AuthContext';
import { useTransfer } from '@/lib/TransferProgressContext';
import { logActivity } from '../utils/RegistryLogger';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PreviewModal from '@/components/modal/PreviewModal';
import FileDeleteModal from '@/components/modal/FileDeleteModal';

// Icons
import {
  Loader2,
  Search,
  Eye,
  Download,
  Trash2,
  UploadCloud,
  FileImage,
  FileVideo,
  FileText,
  File as FileIcon,
  X,
  ServerCrash,
} from 'lucide-react';


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
        console.error('Failed to load thumbnail for', file.name, error);
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
    return <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />;
  }

  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt={`Preview of ${file.name}`}
        className="w-full h-full object-cover"
      />
    );
  }

  return getIcon(file.name);
};


export default function DigiDocumentPage() {
  const { isAuthenticated, authClient } = useAuth();
  const { updateProgress, removeProgress } = useTransfer();

  const [actor, setActor] = useState(null);
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Preview states
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(null);
  const [activePreviewFile, setActivePreviewFile] = useState(null);

  // Delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Filter & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterType, setFilterType] = useState('all');

  const fileInputRef = useRef(null);

  // Actor Setup
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

  // Handlers
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

            await actor.uploadFileChunk(file.name, chunk, BigInt(i), file.type);
            updateProgress(
              file.name,
              Math.floor(((i + 1) / totalChunks) * 100),
              'Uploading'
            );
          }
        } catch (error) {
          console.error('Upload failed:', error);
          setErrorMessage(`Failed to upload ${file.name}.`);
        } finally {
          await loadFiles();

          const identity = authClient?.getIdentity();
          if (identity && isAuthenticated) {
            try {
              await logActivity(
                identity,
                identity.getPrincipal(),
                { DocumentUploaded: file.name },
                `File "${file.name}" berhasil diupload.`
              );
            } catch (err) {
              console.error('Registry log (upload) failed:', err);
            }
          }

          removeProgress(file.name);
        }
      };

      reader.readAsArrayBuffer(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        updateProgress(
          name,
          Math.floor(((i + 1) / totalChunks) * 100),
          'Downloading'
        );
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

  // Helpers
  const formatBytes = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconClass = 'h-12 w-12 text-purple-300';

    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext))
      return <FileImage className={iconClass} />;
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext))
      return <FileVideo className={iconClass} />;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext))
      return <FileText className={iconClass} />;
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
      .filter((file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        if (filterType === 'images') return imageExtensions.includes(ext);
        if (filterType === 'videos') return videoExtensions.includes(ext);
        if (filterType === 'documents') return docExtensions.includes(ext);
        return true;
      })
      .filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'size_asc':
            return Number(a.size) - Number(b.size);
          case 'size_desc':
            return Number(b.size) - Number(a.size);
          case 'recent':
          default:
            return 0;
        }
      });
  }, [files, searchQuery, sortBy, filterType]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#11071F] to-[#1F112D] text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{ fontFamily: 'AeonikBold, sans-serif' }}
          >
            My Documents
          </h1>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current.click()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2"
            style={{ fontFamily: 'AeonikBold, sans-serif' }}
          >
            <UploadCloud className="h-5 w-5" />
            Upload Files
          </Button>
        </div>

        <div className="bg-white/5 border border-purple-400/20 rounded-lg p-4 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent pl-10 border-purple-400/30 focus:border-purple-400"
              style={{ fontFamily: 'AeonikLight, sans-serif' }}
            />
          </div>
          <div className="flex gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger
                className="w-full md:w-[180px] bg-transparent border-purple-400/30"
                style={{ fontFamily: 'AeonikLight, sans-serif' }}
              >
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1F112D] text-white border-purple-400/50">
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="images">Images</SelectItem>
                <SelectItem value="videos">Videos</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger
                className="w-full md:w-[180px] bg-transparent border-purple-400/30"
                style={{ fontFamily: 'AeonikLight, sans-serif' }}
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#1F112D] text-white border-purple-400/50">
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="size_desc">Size (Largest)</SelectItem>
                <SelectItem value="size_asc">Size (Smallest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center justify-between mt-4 rounded-md border border-red-400 bg-red-900/50 p-3 text-red-300">
            <p style={{ fontFamily: 'AeonikLight, sans-serif' }}>{errorMessage}</p>
            <Button
              onClick={() => setErrorMessage('')}
              variant="ghost"
              size="icon"
              style={{ fontFamily: 'AeonikBold, sans-serif' }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        {filteredAndSortedFiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.name}
                className="bg-white/5 border border-purple-400/20 rounded-lg flex flex-col overflow-hidden transition-all duration-300 hover:border-purple-400/60 hover:-translate-y-1"
              >
                <div className="bg-black/20 h-32 flex items-center justify-center overflow-hidden">
                  <FilePreview file={file} actor={actor} getIcon={getFileIcon} />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <p
                    className="font-semibold truncate flex-grow"
                    title={file.name}
                    style={{ fontFamily: 'AeonikBold, sans-serif' }}
                  >
                    {file.name}
                  </p>
                  <p
                    className="text-sm text-purple-300/80 mt-1"
                    style={{ fontFamily: 'AeonikLight, sans-serif' }}
                  >
                    {formatBytes(Number(file.size))}
                  </p>
                </div>
                <div className="p-2 border-t border-purple-400/20 flex justify-end gap-1">
                  {isPreviewable(file.name) ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFilePreview(file.name)}
                      disabled={previewLoading === file.name}
                      title="Preview"
                      style={{ fontFamily: 'AeonikBold, sans-serif' }}
                    >
                      {previewLoading === file.name ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  ) : (
                    <div className="w-10 h-10"></div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFileDownload(file.name)}
                    title="Download"
                    style={{ fontFamily: 'AeonikBold, sans-serif' }}
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(file)}
                    title="Delete"
                    style={{ fontFamily: 'AeonikBold, sans-serif' }}
                  >
                    <Trash2 className="h-5 w-5 text-red-400 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-purple-300/70 flex flex-col items-center">
            <ServerCrash className="h-16 w-16 mb-4" />
            <p
              className="text-xl font-medium"
              style={{ fontFamily: 'AeonikBold, sans-serif' }}
            >
              No documents found.
            </p>
            <p style={{ fontFamily: 'AeonikLight, sans-serif' }}>
              Try adjusting your filters or upload a new file.
            </p>
          </div>
        )}
      </div>

      {showPreviewModal && previewUrl && (
        <PreviewModal
          fileName={activePreviewFile}
          previewUrl={previewUrl}
          previewType={previewType}
          onClose={() => {
            setShowPreviewModal(false);
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setPreviewType(null);
            setActivePreviewFile(null);
          }}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && fileToDelete && (
        <FileDeleteModal
            actor={actor}
            fileName={fileToDelete.name}
            fileSize={formatBytes(Number(fileToDelete.size))}
            onClose={() => setShowDeleteModal(false)}
            onSuccess={() => {
                setFiles(files.filter((f) => f.name !== fileToDelete.name));
                setShowDeleteModal(false);

                const identity = authClient?.getIdentity();
                if (identity && isAuthenticated) {
                logActivity(
                    identity,
                    identity.getPrincipal(),
                    { DocumentDeleted: null },
                    `File "${fileToDelete.name}" berhasil dihapus.`
                ).catch((err) =>
                    console.error('Registry log (delete) failed:', err)
                );
                }
            }}
        />
      )}
    </div>
  );
}