import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PendingScan {
  id: string;
  imageDataUrl: string;
  diseaseName: string;
  cropName: string;
  confidence: number;
  chemicalSolution?: string | null;
  organicSolution?: string | null;
  prevention?: string | null;
  createdAt: string;
}

const PENDING_SCANS_KEY = 'crop-doc-pending-scans';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingScans, setPendingScans] = useState<PendingScan[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();

  // Load pending scans from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PENDING_SCANS_KEY);
    if (stored) {
      try {
        setPendingScans(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse pending scans:', e);
      }
    }
  }, []);

  // Save pending scans to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(PENDING_SCANS_KEY, JSON.stringify(pendingScans));
  }, [pendingScans]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Back online - ready to sync');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Gone offline - scans will be saved locally');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add a scan to pending queue (for offline storage)
  const addPendingScan = useCallback((scan: Omit<PendingScan, 'id' | 'createdAt'>) => {
    const newScan: PendingScan = {
      ...scan,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setPendingScans(prev => [...prev, newScan]);
    return newScan.id;
  }, []);

  // Remove a scan from pending queue
  const removePendingScan = useCallback((id: string) => {
    setPendingScans(prev => prev.filter(scan => scan.id !== id));
  }, []);

  // Convert data URL to blob for upload
  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const response = await fetch(dataUrl);
    return response.blob();
  };

  // Sync all pending scans to Supabase
  const syncPendingScans = useCallback(async () => {
    if (!user || !isOnline || pendingScans.length === 0 || isSyncing) {
      return { synced: 0, failed: 0 };
    }

    setIsSyncing(true);
    let synced = 0;
    let failed = 0;

    for (const scan of pendingScans) {
      try {
        // Upload image to storage
        const blob = await dataUrlToBlob(scan.imageDataUrl);
        const fileName = `${user.id}/${Date.now()}-${scan.id}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(`scan-images/${fileName}`, blob, {
            contentType: 'image/jpeg',
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(`scan-images/${fileName}`);

        // Save scan to database
        const { error: insertError } = await supabase
          .from('scans')
          .insert({
            user_id: user.id,
            image_url: urlData.publicUrl,
            disease_detected: scan.diseaseName,
            crop_name: scan.cropName,
            confidence_score: scan.confidence,
            chemical_solution: scan.chemicalSolution || null,
            organic_solution: scan.organicSolution || null,
            prevention: scan.prevention || null,
            created_at: scan.createdAt,
          });

        if (insertError) throw insertError;

        // Remove from pending queue on success
        removePendingScan(scan.id);
        synced++;
      } catch (error) {
        console.error('Failed to sync scan:', scan.id, error);
        failed++;
      }
    }

    setIsSyncing(false);
    return { synced, failed };
  }, [user, isOnline, pendingScans, isSyncing, removePendingScan]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && user && pendingScans.length > 0) {
      const timer = setTimeout(() => {
        syncPendingScans();
      }, 2000); // Wait 2 seconds after coming online
      return () => clearTimeout(timer);
    }
  }, [isOnline, user, pendingScans.length, syncPendingScans]);

  return {
    isOnline,
    pendingScans,
    pendingCount: pendingScans.length,
    isSyncing,
    addPendingScan,
    removePendingScan,
    syncPendingScans,
  };
};
