import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Scan {
  id: string;
  user_id: string;
  image_url: string;
  disease_detected: string;
  crop_name: string | null;
  confidence_score: number;
  geo_lat: number | null;
  geo_long: number | null;
  created_at: string;
}

export const useScans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScans = async () => {
    if (!user) {
      setScans([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [user]);

  const uploadImage = async (imageDataUrl: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('scan-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('scan-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not save image to cloud',
        variant: 'destructive',
      });
      return null;
    }
  };

  const saveScan = async (
    imageUrl: string,
    diseaseDetected: string,
    cropName: string | null,
    confidenceScore: number
  ): Promise<Scan | null> => {
    if (!user) return null;

    try {
      // Try to get geolocation
      let geoLat: number | null = null;
      let geoLong: number | null = null;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          geoLat = position.coords.latitude;
          geoLong = position.coords.longitude;
        } catch {
          // Geolocation not available or denied
        }
      }

      const { data, error } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          disease_detected: diseaseDetected,
          crop_name: cropName,
          confidence_score: confidenceScore,
          geo_lat: geoLat,
          geo_long: geoLong,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setScans(prev => [data, ...prev]);
      
      toast({
        title: 'Scan saved',
        description: 'Your diagnosis has been saved to your history',
      });

      return data;
    } catch (error) {
      console.error('Error saving scan:', error);
      toast({
        title: 'Save failed',
        description: 'Could not save scan to cloud',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteScan = async (scanId: string) => {
    try {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      setScans(prev => prev.filter(s => s.id !== scanId));
      
      toast({
        title: 'Scan deleted',
        description: 'The scan has been removed from your history',
      });
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast({
        title: 'Delete failed',
        description: 'Could not delete scan',
        variant: 'destructive',
      });
    }
  };

  return {
    scans,
    isLoading,
    uploadImage,
    saveScan,
    deleteScan,
    refetch: fetchScans,
  };
};
