import { useState, useEffect, useCallback } from 'react';
import { loadModel, isModelReady, getModelStatus } from '@/lib/plantDiseaseModel';

interface UsePlantModelReturn {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  loadProgress: number;
  retry: () => void;
}

export const usePlantModel = (): UsePlantModelReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(isModelReady());
  const [error, setError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  const initializeModel = useCallback(async () => {
    if (isModelReady()) {
      setIsReady(true);
      setLoadProgress(100);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadProgress(10);

    try {
      // Simulate progress during load
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await loadModel();
      
      clearInterval(progressInterval);
      
      const status = getModelStatus();
      if (status.error) {
        setError(status.error);
        setLoadProgress(0);
      } else {
        setIsReady(true);
        setLoadProgress(100);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load model';
      setError(message);
      setLoadProgress(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  const retry = useCallback(() => {
    setError(null);
    initializeModel();
  }, [initializeModel]);

  return {
    isLoading,
    isReady,
    error,
    loadProgress,
    retry,
  };
};
