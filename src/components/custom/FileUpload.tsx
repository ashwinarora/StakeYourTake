"use client";

import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploadFullProps {
  onUploadSuccess?: (assetUrl: string) => void;
  onFileRemove?: () => void;
  useAPI?: boolean; // Whether to use API route instead of direct Cloudinary upload
  disabled?: boolean; // Disable upload when mutations are pending
}

export function FileUploadFull({ onUploadSuccess, onFileRemove, useAPI = false, disabled = false }: FileUploadFullProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const { uploadFile, isUploading } = useFileUpload();

  const onUpload = React.useCallback(
    async (
      files: File[],
      {
        onProgress,
        onSuccess,
        onError,
      }: {
        onProgress: (file: File, progress: number) => void;
        onSuccess: (file: File) => void;
        onError: (file: File, error: Error) => void;
      },
    ) => {
      try {
        let results;


        const result = await uploadFile(files[0]); // no need to pass options now
        results = [result];

        // Handle successful uploads
        results.forEach((result, index) => {
          const file = files[index];
          onSuccess(file);

          // Call the callback with the Cloudinary URL if provided
          if (onUploadSuccess) {
            onUploadSuccess(result.secure_url);
          }

          // Show success toast
          toast.success(`${file.name} uploaded successfully!`);
        });
      } catch (error) {
        // Handle upload errors
        const errorMessage = error instanceof Error ? error.message : "Upload failed";

        // Mark all files as failed
        files.forEach((file) => {
          onError(file, new Error(errorMessage));
        });

        toast.error(`Upload failed: ${errorMessage}`);
      }
    },
    [onUploadSuccess, uploadFile, useAPI],
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const handleFileRemove = React.useCallback(() => {
    setFiles([]);
    if (onFileRemove) {
      onFileRemove();
    }
  }, [onFileRemove]);

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      maxFiles={1}
      maxSize={10 * 1024 * 1024} // 10MB limit
      accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
      className="w-full"
      onUpload={onUpload}
      onFileReject={onFileReject}
      disabled={disabled || isUploading}
    >
      {files.length === 0 ? (
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">
              {isUploading ? "Uploading..." : "Drag & drop file here"}
            </p>
            <p className="text-muted-foreground text-xs">
              {isUploading ? "Please wait while your file uploads" : "Or click to browse (1 file, up to 10MB)"}
            </p>
            {!isUploading && (
              <p className="text-muted-foreground text-xs">
                Images: JPEG, PNG, GIF, WebP • Videos: MP4, WebM, MOV
              </p>
            )}
          </div>
          <FileUploadTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-fit"
              disabled={disabled || isUploading}
            >
              {isUploading ? "Uploading..." : "Browse files"}
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
      ) : (
        <div className="w-full">
          <FileUploadList>
            {files.map((file, index) => (
              <FileUploadItem key={index} value={file} className="relative">
                <FileUploadItemPreview className="size-24 [&>svg]:size-16">
                  <FileUploadItemProgress variant="circular" size={40} />
                </FileUploadItemPreview>
                <FileUploadItemMetadata>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </FileUploadItemMetadata>
                <FileUploadItemDelete asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleFileRemove}
                  >
                    <X className="size-3" />
                  </Button>
                </FileUploadItemDelete>
              </FileUploadItem>
            ))}
          </FileUploadList>
        </div>
      )}
    </FileUpload>
  );
}