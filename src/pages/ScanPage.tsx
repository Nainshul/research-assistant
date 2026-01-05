import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CameraView from '@/components/scanner/CameraView';
import AnalyzingView from '@/components/scanner/AnalyzingView';
import ResultCard from '@/components/scanner/ResultCard';
import { useDiagnosis } from '@/hooks/useDiagnosis';
import { ScrollArea } from '@/components/ui/scroll-area';

type ScanState = 'camera' | 'analyzing' | 'result';

const ScanPage = () => {
  const [scanState, setScanState] = useState<ScanState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { isAnalyzing, result, analyzeImage, clearResult } = useDiagnosis();

  const handleCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setScanState('analyzing');
    await analyzeImage(imageDataUrl);
    setScanState('result');
  };

  const handleScanAgain = () => {
    setCapturedImage(null);
    clearResult();
    setScanState('camera');
  };

  return (
    <AppLayout hideHeader={scanState === 'camera'}>
      {scanState === 'camera' && (
        <div className="h-[calc(100vh-96px)]">
          <CameraView 
            onCapture={handleCapture} 
            onFileUpload={handleCapture}
          />
        </div>
      )}

      {scanState === 'analyzing' && capturedImage && (
        <AnalyzingView imageUrl={capturedImage} />
      )}

      {scanState === 'result' && result && (
        <ScrollArea className="h-[calc(100vh-160px)]">
          <ResultCard 
            result={result} 
            onScanAgain={handleScanAgain}
          />
        </ScrollArea>
      )}
    </AppLayout>
  );
};

export default ScanPage;
