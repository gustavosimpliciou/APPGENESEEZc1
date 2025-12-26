import { useState } from "react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useCreateProject, useProject, useProcessProject } from "@/hooks/use-projects";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Download, RefreshCw, LayoutTemplate, Share2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [projectId, setProjectId] = useState<number | null>(null);
  
  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const createProject = useCreateProject();
  const processProject = useProcessProject();

  const handleUpload = async (file: File) => {
    try {
      const newProject = await createProject.mutateAsync(file);
      setProjectId(newProject.id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleProcess = () => {
    if (projectId) {
      processProject.mutate(projectId);
    }
  };

  // Derived state
  const isProcessing = project?.status === "processing";
  const isCompleted = project?.status === "completed";
  const hasOriginal = !!project?.originalVideoUrl;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-white/20">
      <Header />

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 pt-28 pb-12 px-6 h-screen flex flex-col">
        <div className="max-w-[1800px] mx-auto w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column: Input / Source */}
          <div className="flex flex-col h-full space-y-6">
            <div className="flex-1 relative rounded-3xl overflow-hidden glass-panel">
              {hasOriginal ? (
                <VideoPlayer 
                  src={project.originalVideoUrl!} 
                  className="w-full h-full" 
                  label="Reference Source"
                />
              ) : (
                <UploadZone 
                  onFileSelect={handleUpload} 
                  isUploading={createProject.isPending} 
                />
              )}
            </div>

            {/* Action Area */}
            <div className="h-32 rounded-3xl glass-panel p-6 flex items-center justify-between gap-6">
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-display font-bold text-white">Motion Extraction</h3>
                <p className="text-sm text-white/40">Isolate skeletal data from source</p>
              </div>
              
              <div className="flex items-center gap-4">
                {hasOriginal && (
                  <Button
                    variant="ghost" 
                    className="h-14 w-14 rounded-2xl border border-white/10 hover:bg-white/5"
                    onClick={() => setProjectId(null)} // Reset
                    disabled={isProcessing}
                  >
                    <RefreshCw className="w-5 h-5 text-white/60" />
                  </Button>
                )}
                
                <Button
                  onClick={handleProcess}
                  disabled={!hasOriginal || isProcessing || isCompleted}
                  className="h-14 px-8 rounded-2xl bg-white text-black font-display font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing
                    </span>
                  ) : isCompleted ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Done
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Extract & Transfer
                      <Wand2 className="w-5 h-5 ml-1" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Output / Preview */}
          <div className="flex flex-col h-full space-y-6">
            <div className="flex-1 relative rounded-3xl overflow-hidden glass-panel bg-black/60 border-white/5 flex items-center justify-center">
              {/* Output State Handling */}
              <AnimatePresence mode="wait">
                {isCompleted && project?.generatedVideoUrl ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="w-full h-full"
                  >
                    <VideoPlayer 
                      src={project.generatedVideoUrl} 
                      className="w-full h-full" 
                      label="Generated Output"
                      autoPlay
                    />
                  </motion.div>
                ) : isProcessing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center p-8 w-full h-full relative"
                  >
                    {/* Scanning Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse" />
                    <div className="w-full h-1 bg-primary/20 absolute top-1/2 -translate-y-1/2 blur-sm" />
                    
                    <div className="z-10 bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                      <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mb-6 mx-auto" />
                      <h3 className="text-2xl font-display font-bold text-white mb-2">Analyzing Motion</h3>
                      <p className="text-white/40 font-mono text-sm">Extracting keyframes... please wait</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center p-8 opacity-30"
                  >
                    <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 rotate-12">
                      <LayoutTemplate className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white">Preview Area</h3>
                    <p className="text-white/60 text-sm mt-2">Output will appear here</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Utility / Attachment Boxes */}
            <div className="h-32 grid grid-cols-3 gap-6">
              <AttachmentBox icon={Layers} label="Frame Data" value={project ? "Ready" : "Empty"} />
              <AttachmentBox icon={Download} label="Export Assets" value="MP4 / JSON" disabled={!isCompleted} />
              <AttachmentBox icon={Share2} label="Share Project" value="Link" disabled={!isCompleted} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function AttachmentBox({ icon: Icon, label, value, disabled }: { icon: any, label: string, value: string, disabled?: boolean }) {
  return (
    <button 
      disabled={disabled}
      className={cn(
        "rounded-3xl glass-panel p-5 flex flex-col justify-between text-left transition-all duration-300 group",
        disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5 hover:border-white/20 active:scale-95"
      )}
    >
      <div className="flex items-start justify-between w-full">
        <Icon className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors" />
      </div>
      <div>
        <p className="text-xs font-mono text-white/30 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-display font-bold text-white">{value}</p>
      </div>
    </button>
  );
}
