"use client";

import * as React from "react";
import { UploadCloud, X, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// Define the structure for a file being uploaded
export interface UploadedFile {
  id: string;
  file: File;
  progress: number; // 0-100
  status: "uploading" | "completed" | "error";
}

// Define the props for the component
interface FileUploadCardProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"
  > {
  files: UploadedFile[];
  onFilesChange: (files: File[]) => void;
  onFileRemove: (id: string) => void;
  onClose?: () => void;
  accept?: string;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

export const FileUploadCard = React.forwardRef<HTMLDivElement, FileUploadCardProps>(
  (
    {
      className,
      files = [],
      onFilesChange,
      onFileRemove,
      onClose,
      accept = "application/pdf",
      maxSizeMB = 5,
      title = "Upload files",
      subtitle = "Select and upload the files of your choice",
      showHeader = true,
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Handler for drag enter event
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    // Handler for drag leave event
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    // Handler for drag over event
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Handler for drop event
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles && droppedFiles.length > 0) {
        onFilesChange(droppedFiles);
      }
    };

    // Handler for file input change
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        onFilesChange(selectedFiles);
      }
    };

    // Trigger file input click
    const triggerFileSelect = () => fileInputRef.current?.click();

    // Format file size for display
    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 KB";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Animation variants for Framer Motion
    const cardVariants = {
      hidden: { opacity: 0, y: 15 },
      visible: { opacity: 1, y: 0 },
    };

    const fileItemVariants = {
      hidden: { opacity: 0, x: -15 },
      visible: { opacity: 1, x: 0 },
    };

    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.25 }}
        className={cn(
          "w-full rounded-[20px] bg-white/90 border border-[var(--line)] shadow-sm overflow-hidden text-sbg-ink",
          className
        )}
        {...props}
      >
        <div className="p-5 sm:p-6">
          {showHeader && (
            <div className="flex items-start justify-between pb-5 border-b border-[var(--line)] mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-sbg-lilac-100 border border-sbg-lilac-200 text-sbg-lilac-700">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-sbg-ink tracking-tight">{title}</h3>
                  <p className="text-xs text-sbg-ink-3 font-mono mt-0.5">{subtitle}</p>
                </div>
              </div>
              {onClose && (
                <button
                  type="button"
                  className="rounded-full p-1.5 text-sbg-ink-3 hover:text-sbg-ink hover:bg-sbg-lilac-50 transition-colors"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={cn(
              "border-[1.5px] border-dashed rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer select-none",
              isDragging
                ? "border-sbg-lilac-600 bg-sbg-lilac-100 scale-[0.995]"
                : "border-sbg-lilac-300 bg-sbg-lilac-50/60 hover:border-sbg-lilac-600 hover:bg-sbg-lilac-50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="w-12 h-12 rounded-full bg-sbg-lilac-100 border border-sbg-lilac-200 flex items-center justify-center mb-3.5 text-sbg-lilac-700">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="font-semibold text-sm text-sbg-ink">Choose a file or drag & drop it here.</p>
            <p className="text-xs text-sbg-ink-3 font-mono mt-1">
              PDF, PNG, JPEG formats, up to {maxSizeMB} MB.
            </p>
            <button
              type="button"
              className="mt-4 px-4 py-1.5 rounded text-xs font-mono font-medium border border-[var(--line)] bg-white text-sbg-ink hover:border-sbg-lilac-600 hover:text-sbg-lilac-700 transition-all pointer-events-none"
            >
              Browse File
            </button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-[var(--line)] bg-sbg-lilac-50/60">
            <ul className="space-y-3">
              <AnimatePresence>
                {files.map((file) => (
                  <motion.li
                    key={file.id}
                    variants={fileItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    layout
                    className="flex items-center justify-between gap-3 p-3.5 rounded-lg bg-white border border-[var(--line)]"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded bg-sbg-lilac-100 border border-sbg-lilac-200 text-[11px] font-mono font-bold text-sbg-lilac-700 uppercase tracking-wider">
                        {file.file.type.split("/")[1]?.toUpperCase().substring(0, 3) || "PDF"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-medium text-sbg-ink truncate">{file.file.name}</p>
                        <div className="text-[11px] font-mono text-sbg-ink-3 flex items-center gap-1.5 mt-0.5">
                          {file.status === "uploading" && (
                            <span>{formatFileSize((file.file.size * file.progress) / 100)} of {formatFileSize(file.file.size)}</span>
                          )}
                          {file.status === "completed" && (
                            <span>{formatFileSize(file.file.size)}</span>
                          )}
                          <span>•</span>
                          <span
                            className={cn(
                              { "text-sbg-lilac-700 font-medium": file.status === "uploading" },
                              { "text-emerald-600 font-medium": file.status === "completed" },
                              { "text-red-600 font-medium": file.status === "error" }
                            )}
                          >
                            {file.status === "uploading" ? `Uploading... ${Math.round(file.progress)}%` : file.status === "completed" ? "Completed" : "Error"}
                          </span>
                        </div>
                        <Progress value={file.progress} className="h-1.5 mt-1.5 bg-sbg-lilac-100 [&>div]:bg-sbg-lilac-600" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {file.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      <button
                        type="button"
                        className="rounded p-1 text-sbg-ink-3 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => onFileRemove(file.id)}
                      >
                        {file.status === "completed" ? <Trash2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </motion.div>
    );
  }
);
FileUploadCard.displayName = "FileUploadCard";
