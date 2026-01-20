import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, orderBy, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
      const q = query(
        collection(db, 'scans'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
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
          created_at: data.created_at, // Assuming stored as ISO string or timestamp converted to string
        });
      });

      setScans(fetchedScans);
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
      const fileName = `${user.uid}/${Date.now()}.jpg`;
      const storageRef = ref(storage, `scan-images/${fileName}`);

      await uploadBytes(storageRef, blob);
      const publicUrl = await getDownloadURL(storageRef);

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

      const scanData = {
        user_id: user.uid,
        image_url: imageUrl,
        disease_detected: diseaseDetected,
        crop_name: cropName,
        confidence_score: confidenceScore,
        geo_lat: geoLat,
        geo_long: geoLong,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'scans'), scanData);

      const newScan: Scan = {
        id: docRef.id,
        ...scanData
      };

      // Update local state
      setScans(prev => [newScan, ...prev]);

      toast({
        title: 'Scan saved',
        description: 'Your diagnosis has been saved to your history',
      });

      return newScan;
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
      await deleteDoc(doc(db, 'scans', scanId));

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
