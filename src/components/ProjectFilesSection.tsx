import React, { useState } from 'react';
import { FileText, Download, Trash2, Loader2, File, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import FileUploader from './FileUploader';
import type { ProjectFile } from '../types';
import { useProjectStore } from '../store/projectStore';
import { supabase } from '../lib/supabase';

interface ProjectFilesSectionProps {
  projectId: string;
  files: ProjectFile[];
}

export default function ProjectFilesSection({ projectId, files }: ProjectFilesSectionProps) {
  const { uploadFile, deleteFile, loading, error } = useProjectStore();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    if (!file) {
      setLocalError('No file selected');
      return;
    }
    
    try {
      setLocalError(null);
      await handleUploadFile(file);
    } catch (error: any) {
      console.error('Error processing file:', error);
      setLocalError(error.message || 'Error processing file');
    }
  };

  const handleUploadFile = async (file: File) => {
    try {
      setUploadingFile(true);
      await uploadFile(projectId, file);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(fileId, filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
        setLocalError('Failed to delete file');
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    // Default icon
    let Icon = FileText;
    
    // Customize based on file type
    if (fileType.includes('pdf')) {
      Icon = FileText;
    } else if (fileType.includes('image')) {
      Icon = File;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      Icon = FileText;
    }
    
    return <Icon className="w-4 h-4 text-primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Project Files</h3>
      </div>
      
      <FileUploader 
        onFileSelected={handleFileSelected}
        isUploading={uploadingFile || loading}
        accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png"
      />
      
      {(error || localError) && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>{error || localError}</div>
        </div>
      )}
      
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-sm text-gray-500">No files uploaded yet</p>
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="bg-white p-4 rounded-md border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded mt-0.5">
                    {getFileIcon(file.file_type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{file.name}</h4>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>{file.file_type.split('/')[1]?.toUpperCase()}</span>
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={async () => {
                      try {
                        // Get a temporary URL for the file
                        const { data, error } = await supabase.storage
                          .from('project-files')
                          .createSignedUrl(file.file_path, 60);
                          
                        if (error) throw error;
                        
                        // Open the file in a new tab
                        window.open(data.signedUrl, '_blank');
                      } catch (error) {
                        console.error('Error getting file URL:', error);
                        setLocalError('Failed to access file');
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-primary transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id, file.file_path)}
                    className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}