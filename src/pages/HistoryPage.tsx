import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, MapPin, Trash2, AlertCircle, ArrowLeft, Camera, Sparkles, Bot } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useScans, Scan } from '@/hooks/useScans';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getConfidenceColor, getConfidenceLevel } from '@/types/diagnosis';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRemedyForClass, remediesDatabase, getDefaultRemedy } from '@/data/diseaseRemedies';

const ScanCard = ({ 
  scan, 
  onDelete, 
  onClick 
}: { 
  scan: Scan; 
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClick: (scan: Scan) => void;
}) => {
  const confidenceLevel = getConfidenceLevel(scan.confidence_score);
  const confidenceColor = getConfidenceColor(scan.confidence_score);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer active:bg-muted/50 transition-colors"
      onClick={() => onClick(scan)}
    >
      <div className="flex gap-3 p-3">
        {/* Image thumbnail */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <img 
            src={scan.image_url} 
            alt="Scan" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">
                {scan.disease_detected.replace(/_/g, ' ')}
              </h3>
              {scan.crop_name && (
                <p className="text-sm text-muted-foreground">{scan.crop_name}</p>
              )}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-${confidenceColor}/10 text-${confidenceColor} uppercase`}>
              {confidenceLevel}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(scan.created_at), 'MMM d')}
            </span>
            {scan.geo_lat && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                Local
              </span>
            )}
          </div>
        </div>

        {/* Delete button (prevent bubbling) */}
        <button
          onClick={(e) => onDelete(scan.id, e)}
          className="touch-target self-center p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

const ScanDetailModal = ({ 
  scan, 
  isOpen, 
  onClose 
}: { 
  scan: Scan | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  if (!scan) return null;

  // Use stored remedies if available, otherwise look up in database, otherwise use default
  const remedy = (scan.chemical_solution || scan.organic_solution || scan.prevention) 
    ? {
        diseaseName: scan.disease_detected,
        crop: scan.crop_name || 'Unknown',
        chemicalSolution: scan.chemical_solution || 'Consult a local expert.',
        organicSolution: scan.organic_solution || 'Remove infected parts.',
        prevention: scan.prevention || 'Maintain good hygiene.',
      }
    : (remediesDatabase[scan.disease_detected] || 
       Object.values(remediesDatabase).find(r => r.diseaseName === scan.disease_detected) ||
       getDefaultRemedy(scan.disease_detected, scan.crop_name || 'Unknown'));

  const confidenceColor = getConfidenceColor(scan.confidence_score);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden bg-[#0a0f0c] border border-white/10 max-w-lg rounded-3xl h-[90vh] flex flex-col">
        <ScrollArea className="flex-1">
          <div className="relative h-64 w-full">
            <img 
              src={scan.image_url} 
              alt="Diagnosis Result" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0c] to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4 text-white">
               <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-md bg-${confidenceColor}/20 text-${confidenceColor} uppercase mb-2 backdrop-blur-md`}>
                {getConfidenceLevel(scan.confidence_score)} Accuracy
              </span>
              <h2 className="text-2xl font-bold leading-tight">
                {scan.disease_detected.replace(/_/g, ' ')}
              </h2>
              <p className="text-gray-300 flex items-center gap-1.5 mt-1 font-medium italic">
                {scan.crop_name}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Meta Info */}
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Date</p>
                <p className="text-sm font-medium">{format(new Date(scan.created_at), 'MMM d, yyyy')}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Time</p>
                <p className="text-sm font-medium">{format(new Date(scan.created_at), 'hh:mm a')}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Location</p>
                <p className="text-sm font-medium">{scan.geo_lat ? 'Saved' : 'N/A'}</p>
              </div>
            </div>

            {/* Remedies Section */}
            {remedy ? (
              <>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-warning italic">
                    <AlertCircle className="w-4 h-4" /> Recommended Action
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed bg-warning/5 p-4 rounded-xl border border-warning/10">
                    {remedy.chemicalSolution}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-green-400 italic">
                    <Sparkles className="w-4 h-4" /> Natural Treatment
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                    {remedy.organicSolution}
                  </p>
                </div>

                <div className="space-y-3 pb-8">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-primary italic">
                    <Camera className="w-4 h-4" /> Prevention Tips
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/10">
                    {remedy.prevention}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5 mx-auto">
                 <Bot className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                 <p className="text-sm text-muted-foreground">Original AI remedies for this scan were not saved. <br/>Future scans will include full details.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-white/5 bg-black/40">
           <Button onClick={onClose} variant="secondary" className="w-full rounded-2xl h-12">Close Details</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scans, isLoading, deleteScan } = useScans();
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening details when clicking delete
    if (window.confirm('Are you sure you want to delete this scan?')) {
      try {
        await deleteScan(id);
      } catch (err) {
        // Error toast is handled in useScans
      }
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Sign in Required</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to view your scan history and sync across devices
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-border">
        <button 
          onClick={() => navigate(-1)}
          className="touch-target w-10 h-10 flex items-center justify-center rounded-full bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Scan History</h1>
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="p-4 space-y-3">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 bg-card rounded-xl border border-border">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))
          ) : scans.length === 0 ? (
            // Empty state
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No scans yet</h3>
              <p className="text-muted-foreground text-sm max-w-xs mb-6">
                Start scanning your crops to build your diagnosis history
              </p>
              <Button onClick={() => navigate('/scan')}>
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            </motion.div>
          ) : (
            // Scans list
            <AnimatePresence>
              {scans.map((scan) => (
                <ScanCard 
                  key={scan.id} 
                  scan={scan} 
                  onDelete={handleDelete} 
                  onClick={setSelectedScan}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      <ScanDetailModal 
        scan={selectedScan} 
        isOpen={!!selectedScan} 
        onClose={() => setSelectedScan(null)} 
      />

      {/* Stats footer */}
      {scans.length > 0 && (
        <div className="absolute bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{scans.length}</p>
              <p className="text-xs text-muted-foreground">Total Scans</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">
                {scans.filter(s => s.disease_detected.toLowerCase().includes('healthy')).length}
              </p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">
                {scans.filter(s => !s.disease_detected.toLowerCase().includes('healthy')).length}
              </p>
              <p className="text-xs text-muted-foreground">Diseased</p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default HistoryPage;
