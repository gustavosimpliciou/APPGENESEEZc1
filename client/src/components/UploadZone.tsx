import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileVideo, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export function UploadZone({ onFileSelect, isUploading }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const onDropRejected = useCallback(() => {
    setError("Please upload a valid video file (MP4, MOV, WebM)");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "video/*": [".mp4", ".mov", ".webm"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col relative group">
      <div
        {...getRootProps()}
        className={cn(
          "flex-1 border border-dashed rounded-3xl transition-all duration-300 ease-out flex flex-col items-center justify-center p-8 cursor-pointer overflow-hidden relative",
          isDragActive
            ? "border-primary bg-primary/5 scale-[0.99] neon-glow"
            : "border-white/10 hover:border-white/30 hover:bg-white/5",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />

        {/* Animated Background Grid */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
               backgroundSize: '40px 40px' 
             }} 
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center z-10"
            >
              <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin mb-6" />
              <h3 className="text-xl font-display font-medium text-white tracking-wide">
                Uploading Asset...
              </h3>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center z-10 space-y-6 max-w-md"
            >
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center transition-colors duration-300",
                isDragActive ? "bg-primary text-background" : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white"
              )}>
                {isDragActive ? <FileVideo className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-bold text-white tracking-tight">
                  {isDragActive ? "Drop to Upload" : "Upload Reference Video"}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Drag and drop your source footage here, or click to browse.
                  <br />
                  <span className="text-white/20">Supported formats: MP4, MOV, WebM</span>
                </p>
              </div>

              {error && (
                <div className="flex items-center text-destructive text-sm bg-destructive/10 px-4 py-2 rounded-full mt-4">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
