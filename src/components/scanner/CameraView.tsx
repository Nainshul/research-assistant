import { useEffect, useState } from 'react';
import { Camera, XCircle, Image as ImageIcon, Zap, Focus, SwitchCamera } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onFileUpload: (imageDataUrl: string) => void;
}

const CameraView = ({ onCapture, onFileUpload }: CameraViewProps) => {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, captureImage } = useCamera();
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (!isStreaming) return;
    
    setIsCapturing(true);
    setShowFlash(true);
    
    // Flash effect
    setTimeout(() => setShowFlash(false), 150);
    
    // Capture after brief delay for feedback
    setTimeout(() => {
      const imageData = captureImage();
      if (imageData) {
        onCapture(imageData);
      }
      setIsCapturing(false);
    }, 200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          onFileUpload(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Flash effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* Advanced scanning overlay */}
      <AnimatePresence>
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Vignette effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />
            
            {/* Scan frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-72 h-72">
                {/* Animated corners */}
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0"
                >
                  {/* Top-left */}
                  <div className="absolute -top-1 -left-1 w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                  </div>
                  {/* Top-right */}
                  <div className="absolute -top-1 -right-1 w-16 h-16">
                    <div className="absolute top-0 right-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                    <div className="absolute top-0 right-0 w-1 h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                  </div>
                  {/* Bottom-left */}
                  <div className="absolute -bottom-1 -left-1 w-16 h-16">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                    <div className="absolute bottom-0 left-0 w-1 h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                  </div>
                  {/* Bottom-right */}
                  <div className="absolute -bottom-1 -right-1 w-16 h-16">
                    <div className="absolute bottom-0 right-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                    <div className="absolute bottom-0 right-0 w-1 h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                  </div>
                </motion.div>

                {/* Cross-hair center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Focus className="w-8 h-8 text-primary/60" />
                  </motion.div>
                </div>

                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                  initial={{ top: 0 }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ boxShadow: '0 0 20px 4px hsl(var(--primary) / 0.5)' }}
                />
              </div>
            </div>

            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 p-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <p className="text-center text-foreground font-semibold text-lg mb-2">Camera Access Denied</p>
          <p className="text-center text-muted-foreground text-sm mb-6 max-w-xs">{error}</p>
          <Button onClick={startCamera} className="gap-2">
            <SwitchCamera className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* Top bar with hints */}
      {isStreaming && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 left-0 right-0 p-4"
        >
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-white/90 text-sm font-medium">
                Position leaf in frame
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex items-center justify-center gap-8 px-6">
          {/* Gallery upload */}
          <motion.label 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="touch-target w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center cursor-pointer border border-white/20 hover:bg-white/20 transition-colors"
          >
            <ImageIcon className="w-6 h-6 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </motion.label>

          {/* Capture button */}
          <motion.button
            onClick={handleCapture}
            disabled={!isStreaming || isCapturing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="touch-target relative w-20 h-20 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Take photo"
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-white" />
            
            {/* Inner circle */}
            <motion.div 
              className="absolute inset-2 rounded-full bg-white"
              animate={isCapturing ? { scale: 0.8 } : { scale: 1 }}
            />
            
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.button>

          {/* Placeholder for symmetry */}
          <div className="w-14 h-14" />
        </div>

        {/* Quick tip */}
        <p className="text-center text-white/50 text-xs mt-4">
          Tap to scan • Upload from gallery
        </p>
      </div>
    </div>
  );
};

export default CameraView;