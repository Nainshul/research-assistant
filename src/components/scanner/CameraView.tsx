import { useEffect } from 'react';
import { Camera, XCircle, Image as ImageIcon } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onFileUpload: (imageDataUrl: string) => void;
}

const CameraView = ({ onCapture, onFileUpload }: CameraViewProps) => {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, captureImage } = useCamera();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const imageData = captureImage();
    if (imageData) {
      onCapture(imageData);
    }
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
    <div className="relative w-full h-full bg-foreground/5 rounded-2xl overflow-hidden">
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

      {/* Scanning overlay */}
      <AnimatePresence>
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Corner guides */}
            <div className="absolute inset-8">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg" />
            </div>

            {/* Scanning line animation */}
            <motion.div
              className="absolute left-8 right-8 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
              initial={{ top: '10%' }}
              animate={{ top: ['10%', '90%', '10%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 p-6">
          <XCircle className="w-16 h-16 text-destructive mb-4" />
          <p className="text-center text-foreground font-medium mb-2">Camera Error</p>
          <p className="text-center text-muted-foreground text-sm mb-4">{error}</p>
          <Button onClick={startCamera} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-foreground/80 to-transparent">
        <div className="flex items-center justify-center gap-6">
          {/* Gallery upload */}
          <label className="touch-target w-14 h-14 rounded-full bg-card/90 flex items-center justify-center cursor-pointer hover:bg-card transition-colors">
            <ImageIcon className="w-6 h-6 text-foreground" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Capture button */}
          <button
            onClick={handleCapture}
            disabled={!isStreaming}
            className="touch-target w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            aria-label="Take photo"
          >
            <div className="w-16 h-16 rounded-full border-4 border-primary-foreground flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary-foreground" />
            </div>
          </button>

          {/* Placeholder for symmetry */}
          <div className="w-14 h-14" />
        </div>
      </div>

      {/* Hint text */}
      {isStreaming && (
        <div className="absolute top-4 left-0 right-0 text-center">
          <p className="text-primary-foreground text-sm font-medium bg-foreground/60 px-4 py-2 rounded-full inline-block">
            Point camera at the affected plant
          </p>
        </div>
      )}
    </div>
  );
};

export default CameraView;
