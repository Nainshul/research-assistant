import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CameraView from '@/components/scanner/CameraView';
import AnalyzingView from '@/components/scanner/AnalyzingView';
import ResultCard from '@/components/scanner/ResultCard';
import { useDiagnosis } from '@/hooks/useDiagnosis';
import { usePlantModel } from '@/hooks/usePlantModel';
import { useScans } from '@/hooks/useScans';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Download, Cloud, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type ScanState = 'camera' | 'analyzing' | 'result';

const ScanPage = () => {
  const [scanState, setScanState] = useState<ScanState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { isAnalyzing, result, error: diagnosisError, analyzeImage, clearResult } = useDiagnosis();
  const { isLoading: isModelLoading, isReady: isModelReady, error: modelError, loadProgress, retry } = usePlantModel();
  const { uploadImage, saveScan } = useScans();
  const { isOnline, addPendingScan } = useOfflineSync();
  const { user } = useAuth();

  const handleCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setScanState('analyzing');
    await analyzeImage(imageDataUrl);
    setScanState('result');
  };

  // Save scan to cloud when result is available and user is logged in
  const handleSaveToCloud = async () => {
    if (!result || !capturedImage || !user) return;

    // If offline, save to pending queue
    if (!isOnline) {
      addPendingScan({
        imageDataUrl: capturedImage,
        diseaseName: result.diseaseName,
        cropName: result.crop,
        confidence: result.confidence,
      });
      toast.success('Scan saved locally - will sync when online');
      return;
    }

    const imageUrl = await uploadImage(capturedImage);
    if (imageUrl) {
      await saveScan(
        imageUrl,
        result.diseaseName,
        result.crop,
        result.confidence
      );
      toast.success('Scan saved to history');
    }
  };

  const handleScanAgain = () => {
    setCapturedImage(null);
    clearResult();
    setScanState('camera');
  };

  return (
    <AppLayout hideHeader={scanState === 'camera'}>
      {/* Model loading overlay */}
      <AnimatePresence>
        {isModelLoading && scanState === 'camera' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background/95 flex flex-col items-center justify-center p-6"
          >
            <Download className="w-12 h-12 text-primary mb-4 animate-bounce" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Loading AI Model</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Preparing plant disease detection...
            </p>
            <div className="w-48">
              <Progress value={loadProgress} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{loadProgress}%</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model error banner */}
      {modelError && scanState === 'camera' && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 left-0 right-0 z-40 bg-warning/10 border-b border-warning p-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
            <span className="text-foreground flex-1">
              AI model unavailable. Using demo mode.
            </span>
            <Button variant="outline" size="sm" onClick={retry}>
              Retry
            </Button>
          </div>
        </motion.div>
      )}

      {scanState === 'camera' && (
        <div className={`h-[calc(100vh-96px)] ${modelError ? 'pt-12' : ''}`}>
          <CameraView
            onCapture={handleCapture}
            onFileUpload={handleCapture}
          />

          {/* Model status indicator */}
          {isModelReady && !isModelLoading && (
            <div className="absolute top-2 right-2 z-30">
              <div className="flex items-center gap-1.5 bg-success/20 text-success px-2 py-1 rounded-full text-xs font-medium">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                AI Ready
              </div>
            </div>
          )}
        </div>
      )}

      {scanState === 'analyzing' && capturedImage && (
        <AnalyzingView imageUrl={capturedImage} />
      )}

      {scanState === 'result' && (
        <ScrollArea className="h-[calc(100vh-160px)]">
          {diagnosisError ? (
            <div className="flex flex-col items-center justify-center p-8 h-full space-y-4 text-center mt-10">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No Crop Detected</h3>
              <p className="text-muted-foreground max-w-md">
                {diagnosisError.includes('No crop found')
                  ? "It seems you scanned something else. Please make sure to scan a plant, crop, or natural product."
                  : diagnosisError}
              </p>
              <Button onClick={handleScanAgain} className="mt-4">
                Scan Again
              </Button>
            </div>
          ) : result ? (
            <>
              <ResultCard
                result={result}
                onScanAgain={handleScanAgain}
              />

              {/* Cloud save button for logged in users */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="px-4 pb-4"
                >
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSaveToCloud}
                  >
                    {isOnline ? (
                      <>
                        <Cloud className="w-4 h-4 mr-2" />
                        Save to History
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 mr-2" />
                        Save Offline
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <Button onClick={handleScanAgain}>Return to Camera</Button>
            </div>
          )}
        </ScrollArea>
      )}
    </AppLayout>
  );
};

export default ScanPage;
