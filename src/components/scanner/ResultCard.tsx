import { motion } from 'framer-motion';
import { DiagnosisResult, getConfidenceLevel, getConfidenceColor } from '@/types/diagnosis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle2, 
  FlaskConical, 
  Leaf, 
  Volume2,
  RefreshCw,
  Share2,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultCardProps {
  result: DiagnosisResult;
  onScanAgain: () => void;
}

const ResultCard = ({ result, onScanAgain }: ResultCardProps) => {
  const confidenceLevel = getConfidenceLevel(result.confidence);
  const confidenceColor = getConfidenceColor(confidenceLevel);
  const isHealthy = result.diseaseName.toLowerCase().includes('healthy');

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Crop-Doc Diagnosis',
          text: `My ${result.crop} has ${result.diseaseName}. Confidence: ${Math.round(result.confidence * 100)}%`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-4"
    >
      {/* Image & Diagnosis Header */}
      <div className="relative rounded-2xl overflow-hidden mb-4">
        <img
          src={result.imageUrl}
          alt="Scanned plant"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
        
        {/* Result badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full w-fit",
            isHealthy ? "bg-success" : "bg-destructive"
          )}>
            {isHealthy ? (
              <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-destructive-foreground" />
            )}
            <span className="font-bold text-primary-foreground">
              {result.crop}: {result.diseaseName}
            </span>
          </div>
        </div>
      </div>

      {/* Confidence meter */}
      <div className="bg-card rounded-xl p-4 mb-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">AI Confidence</span>
          <span className="text-lg font-bold text-foreground">
            {Math.round(result.confidence * 100)}%
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.confidence * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn("h-full rounded-full", confidenceColor)}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {confidenceLevel === 'high' && "High confidence - treatment recommended"}
          {confidenceLevel === 'medium' && "Moderate confidence - verify with expert"}
          {confidenceLevel === 'low' && "Low confidence - please try a clearer photo"}
        </p>
      </div>

      {/* Remedy Tabs */}
      <Tabs defaultValue="chemical" className="mb-4">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="chemical" className="touch-target flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            Chemical
          </TabsTrigger>
          <TabsTrigger value="organic" className="touch-target flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Natural
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chemical" className="mt-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground">Chemical Treatment</h3>
              <button 
                onClick={() => speakText(result.remedy.chemicalSolution)}
                className="touch-target w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                aria-label="Read aloud"
              >
                <Volume2 className="w-5 h-5 text-primary" />
              </button>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {result.remedy.chemicalSolution}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="organic" className="mt-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground">Natural Treatment</h3>
              <button 
                onClick={() => speakText(result.remedy.organicSolution)}
                className="touch-target w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                aria-label="Read aloud"
              >
                <Volume2 className="w-5 h-5 text-primary" />
              </button>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {result.remedy.organicSolution}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Prevention tip */}
      <div className="bg-accent/50 rounded-xl p-4 mb-6 border border-accent">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-accent-foreground" />
          <h3 className="font-semibold text-accent-foreground">Prevention</h3>
        </div>
        <p className="text-sm text-accent-foreground/80">
          {result.remedy.prevention}
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="lg"
          className="touch-target"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>
        <Button
          size="lg"
          className="touch-target"
          onClick={onScanAgain}
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Scan Again
        </Button>
      </div>
    </motion.div>
  );
};

export default ResultCard;
