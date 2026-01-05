import { useState, useCallback } from 'react';
import { DiagnosisResult } from '@/types/diagnosis';
import { mockDiagnosis } from '@/data/mockDiseases';

interface UseDiagnosisReturn {
  isAnalyzing: boolean;
  result: DiagnosisResult | null;
  error: string | null;
  analyzeImage: (imageDataUrl: string) => Promise<void>;
  clearResult: () => void;
}

export const useDiagnosis = (): UseDiagnosisReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate network/processing delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // TODO: Replace with actual TensorFlow.js inference
      // For now, use mock diagnosis
      const diagnosisResult = mockDiagnosis(imageDataUrl);
      setResult(diagnosisResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    result,
    error,
    analyzeImage,
    clearResult,
  };
};
