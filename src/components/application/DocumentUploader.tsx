
import React, { useState } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { Document } from "@/types";
import { Button } from "@/components/ui/button";

interface DocumentUploaderProps {
  onUpload: (documents: Document[]) => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  multiple?: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  maxSize = 5, // Default 5MB
  allowedTypes = ["image/jpeg", "image/png", "application/pdf"],
  multiple = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (fileList: FileList) => {
    setError(null);
    const newFiles: Document[] = [];
    const maxSizeBytes = maxSize * 1024 * 1024;

    Array.from(fileList).forEach((file) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setError(`File type not allowed: ${file.type}`);
        return;
      }

      // Validate file size
      if (file.size > maxSizeBytes) {
        setError(`File too large: ${file.name}`);
        return;
      }

      // For MVP, use URL.createObjectURL instead of actual upload
      const fileUrl = URL.createObjectURL(file);

      const newDocument: Document = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        url: fileUrl,
        uploadedAt: new Date(),
      };

      newFiles.push(newDocument);
    });

    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);
      onUpload(updatedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);
    onUpload(updatedFiles);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`document-upload-area ${isDragging ? "dragging" : ""}`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          multiple={multiple}
          accept={allowedTypes.join(",")}
        />

        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          <Upload className="h-10 w-10 text-realestate-navy mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Accepted formats: JPEG, PNG, PDF (Max {maxSize}MB)
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h4>
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-realestate-teal mr-2" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(file.id)}
                  className="text-gray-500 hover:text-realestate-navy"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
