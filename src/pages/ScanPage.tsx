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
import { AlertCircle, Download, Cloud, WifiOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type ScanState = 'camera' | 'analyzing' | 'result';

const ScanPage = () => {
  const [scanState, setScanState] = useState<ScanState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { isAnalyzing, result, error: diagnosisError, analyzeImage, clearResult, usingGemini } = useDiagnosis();
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
      {/* Model loading overlay - Only show if NO Gemini key is present and model is loading */}
      <AnimatePresence>
        {isModelLoading && scanState === 'camera' && !import.meta.env.VITE_GEMINI_API_KEY && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="bg-card/50 border border-white/20 shadow-2xl rounded-3xl p-8 flex flex-col items-center max-w-xs w-full relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
               
               <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-pulse">
                  <Download className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Initializing AI</h3>
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  Loading the neural network for offline diagnosis...
                </p>
                <div className="w-full space-y-2">
                  <Progress value={loadProgress} className="h-3 rounded-full bg-muted" />
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Loading assets</span>
                    <span>{loadProgress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model error banner - Slide in */}
      {modelError && scanState === 'camera' && !import.meta.env.VITE_GEMINI_API_KEY && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 left-4 right-4 z-40"
        >
          <div className="bg-warning/10 backdrop-blur-md border border-warning/50 rounded-2xl p-4 shadow-lg flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
               <AlertCircle className="w-5 h-5 text-warning" />
             </div>
             <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground">AI unavailable</h4>
                <p className="text-xs text-muted-foreground truncate">Using demo mode for testing</p>
             </div>
             <Button variant="ghost" size="sm" onClick={retry} className="text-warning hover:text-warning hover:bg-warning/10">
               Retry
             </Button>
          </div>
        </motion.div>
      )}

      {scanState === 'camera' && (
        <div className={`h-[calc(100dvh-5rem)] ${modelError ? 'pt-12' : ''} relative`}> {/* 100dvh - header/nav space */}
          <CameraView
            onCapture={handleCapture}
            onFileUpload={handleCapture}
          />

          {/* Model status indicator */}
          <div className="absolute top-4 right-4 z-30">
            {import.meta.env.VITE_GEMINI_API_KEY ? (
               <div className="flex items-center gap-1.5 bg-black/40 text-purple-200 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/10 shadow-lg">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Gemini AI
               </div>
            ) : isModelReady && !isModelLoading && (
              <div className="flex items-center gap-1.5 bg-black/40 text-green-400 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Offline Ready
              </div>
            )}
          </div>
        </div>
      )}

      {scanState === 'analyzing' && capturedImage && (
        <AnalyzingView imageUrl={capturedImage} />
      )}

      {scanState === 'result' && (
        <ScrollArea className="h-[calc(100dvh-5rem)] pb-20"> {/* dvh for mobile browser bar support */}
          {diagnosisError ? (
            <div className="flex flex-col items-center justify-center p-8 h-full space-y-4 text-center mt-10">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Analysis Failed</h3>
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
                onLanguageChange={async (newLang) => {
                   if (capturedImage) {
                      setScanState('analyzing');
                      // Wait a bit to show transition
                      await new Promise(resolve => setTimeout(resolve, 500));
                      // Pass the new language explicitly to avoid stale state
                      await analyzeImage(capturedImage, newLang);
                      setScanState('result');
                   }
                }}
              />

              {/* Cloud save button for logged in users */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="px-6 pb-24 safe-area-bottom"
                >
                  <Button
                    variant="default"
                    className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
                    onClick={handleSaveToCloud}
                  >
                    {isOnline ? (
                      <>
                        <Cloud className="w-5 h-5 mr-2" />
                        Save to History
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-5 h-5 mr-2" />
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
