import { useState, useEffect, useCallback } from 'react';
import { loadModel, isModelReady, getModelStatus } from '@/lib/plantDiseaseModel';

interface UsePlantModelReturn {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  loadProgress: number;
  retry: () => void;
  initialize: () => Promise<void>;
}

interface UsePlantModelOptions {
  autoLoad?: boolean;
}

export const usePlantModel = (options: UsePlantModelOptions = { autoLoad: true }): UsePlantModelReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(isModelReady());
  const [error, setError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  const initialize = useCallback(async () => {
    if (isModelReady()) {
      setIsReady(true);
      setLoadProgress(100);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadProgress(5);

    try {
      // Small delay for UI stability
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadProgress(10);
      
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => Math.min(prev + 5, 90));
      }, 300);

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
    if (options.autoLoad) {
      initialize();
    }
  }, [initialize, options.autoLoad]);

  const retry = useCallback(() => {
    setError(null);
    initialize();
  }, [initialize]);

  return {
    isLoading,
    isReady,
    error,
    loadProgress,
    retry,
    initialize, // Exported for manual control
  };
};
