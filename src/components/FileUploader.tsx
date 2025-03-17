import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, AlertCircle, File as FilePdf } from 'lucide-react';

interface FileUploaderProps {
  onFileSelected: (file: File) => Promise<void>;
  isUploading: boolean;
  accept?: string;
}

export default function FileUploader({ 
  onFileSelected, 
  isUploading,
  accept = ".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png"
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      handleProcessFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      handleProcessFile(file);
    }
  };

  const handleProcessFile = async (file: File) => {
    try {
      setLocalError(null);
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setLocalError('File size exceeds 10MB limit');
        return;
      }
      
      // Process the file
      await onFileSelected(file);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Error processing file:', error);
      setLocalError(error.message || 'Error processing file');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancelSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setLocalError(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FilePdf className="w-5 h-5 text-red-500" />;
    } else if (file.type.includes('image')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    } else if (
      file.type.includes('word') || 
      file.type.includes('document') || 
      file.name.endsWith('.doc') || 
      file.name.endsWith('.docx')
    ) {
      return <FileText className="w-5 h-5 text-blue-700" />;
    } else {
      return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Processing file...
              </p>
            </div>
          ) : selectedFile ? (
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={handleCancelSelection}
                className="p-1 text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="p-3 bg-primary/10 rounded-full mb-3">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: PDF, Word, Text, Images (max 10MB)
              </p>
            </>
          )}
        </div>
      </div>
      
      {localError && (
        <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{localError}</span>
        </div>
      )}
    </div>
  );
}