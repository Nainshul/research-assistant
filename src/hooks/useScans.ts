import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  created_at: string;
}

export const useScans = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['scans', user?.uid],
    queryFn: async () => {
      if (!user) return [];

      const q = query(
        collection(db, 'scans'),
        where('user_id', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const fetchedScans: Scan[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedScans.push({
          id: doc.id,
          user_id: data.user_id,
          image_url: data.image_url,
          disease_detected: data.disease_detected,
          crop_name: data.crop_name,
          confidence_score: data.confidence_score,
          geo_lat: data.geo_lat,
          geo_long: data.geo_long,
          created_at: data.created_at,
        });
      });

      // Sort client-side
      return fetchedScans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!user,
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (imageDataUrl: string) => {
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const fileName = `${user.uid}/${Date.now()}.jpg`;
      const storageRef = ref(storage, `scan-images/${fileName}`);

      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
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
          // Geolocation not available or denied
          console.log('Geolocation access denied or timed out');
        }
      }

      const scanData = {
        user_id: user.uid,
        image_url: data.imageUrl,
        disease_detected: data.diseaseDetected,
        crop_name: data.cropName,
        confidence_score: data.confidenceScore,
        geo_lat: geoLat,
        geo_long: geoLong,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'scans'), scanData);
      return { id: docRef.id, ...scanData } as Scan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans', user?.uid] });
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
      await deleteDoc(doc(db, 'scans', scanId));
      return scanId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans', user?.uid] });
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
    saveScan: async (imageUrl: string, diseaseDetected: string, cropName: string | null, confidenceScore: number) => {
      return await saveScanMutation.mutateAsync({ imageUrl, diseaseDetected, cropName, confidenceScore });
    },
    deleteScan: deleteScanMutation.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['scans', user?.uid] }),
  };
};
