import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Scan {
  id: string;
  user_id: string;
  image_url: string;
  disease_detected: string;
  crop_name: string | null;
  confidence_score: number;
  geo_lat: number | null;
  geo_long: number | null;
  chemical_solution: string | null;
  organic_solution: string | null;
  prevention: string | null;
  created_at: string;
}

export const useScans = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['scans', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scans:', error);
        throw error;
      }

      return (data || []) as Scan[];
    },
    enabled: !!user,
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (imageDataUrl: string) => {
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const fileName = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(`scan-images/${fileName}`, blob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(`scan-images/${fileName}`);

      return urlData.publicUrl;
    },
    onError: (error: any) => {
      console.error('Error uploading image:', error);
      toast.error('Upload failed', {
        description: error.message || 'Could not save image to cloud',
      });
    }
  });

  const saveScanMutation = useMutation({
    mutationFn: async (data: {
      imageUrl: string;
      diseaseDetected: string;
      cropName: string | null;
      confidenceScore: number;
      chemicalSolution?: string | null;
      organicSolution?: string | null;
      prevention?: string | null;
    }) => {
      if (!user) throw new Error('User not authenticated');

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
          console.log('Geolocation access denied or timed out');
        }
      }

      const scanData = {
        user_id: user.id,
        image_url: data.imageUrl,
        disease_detected: data.diseaseDetected,
        crop_name: data.cropName,
        confidence_score: data.confidenceScore,
        geo_lat: geoLat,
        geo_long: geoLong,
        chemical_solution: data.chemicalSolution || null,
        organic_solution: data.organicSolution || null,
        prevention: data.prevention || null,
      };

      const { data: inserted, error } = await supabase
        .from('scans')
        .insert(scanData)
        .select()
        .single();

      if (error) throw error;
      return inserted as Scan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans', user?.id] });
      toast.success('Scan saved', {
        description: 'Your diagnosis has been saved to your history',
      });
    },
    onError: (error: any) => {
      console.error('Error saving scan:', error);
      toast.error('Save failed', {
        description: error.message || 'Could not save scan to cloud',
      });
    }
  });

  const deleteScanMutation = useMutation({
    mutationFn: async (scanId: string) => {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;
      return scanId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans', user?.id] });
      toast.success('Scan deleted', {
        description: 'The scan has been removed from your history',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting scan:', error);
      toast.error('Delete failed', {
        description: error.message || 'Could not delete scan',
      });
    }
  });

  return {
    scans,
    isLoading,
    uploadImage: uploadImageMutation.mutateAsync,
    saveScan: async (
      imageUrl: string, 
      diseaseDetected: string, 
      cropName: string | null, 
      confidenceScore: number,
      chemicalSolution?: string | null,
      organicSolution?: string | null,
      prevention?: string | null
    ) => {
      return await saveScanMutation.mutateAsync({ 
        imageUrl, 
        diseaseDetected, 
        cropName, 
        confidenceScore,
        chemicalSolution,
        organicSolution,
        prevention
      });
    },
    deleteScan: deleteScanMutation.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['scans', user?.id] }),
  };
};
