import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiagnosisResult, getConfidenceLevel, getConfidenceColor } from '@/types/diagnosis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  Leaf,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RefreshCw,
  Share2,
  ShieldCheck,
  Cpu,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLanguage } from '@/contexts/LanguageContext';

interface ResultCardProps {
  result: DiagnosisResult;
  onScanAgain: () => void;
}

const ResultCard = ({ result, onScanAgain }: ResultCardProps) => {
  const confidenceLevel = getConfidenceLevel(result.confidence);
  const confidenceColor = getConfidenceColor(result.confidence);
  const isHealthy = result.diseaseName.toLowerCase().includes('healthy');
  const confidencePercent = Math.round(result.confidence * 100);

  const { language, t } = useLanguage();
  const { speak, speakSequence, stop, togglePause, isSpeaking, isPaused, isSupported } = useTextToSpeech({ language });
  const [isReadingAll, setIsReadingAll] = useState(false);

  const speakText = (text: string) => {
    if (isSpeaking) {
      stop();
      return;
    }
    speak(text);
  };

  const readAllResults = () => {
    if (isReadingAll) {
      stop();
      setIsReadingAll(false);
      return;
    }

    setIsReadingAll(true);

    const texts = [
      // Intro
      `${t('result')}: ${result.crop}.`,
      // Status
      isHealthy
        ? t('healthyPlant')
        : `${t('diseaseDetected')}: ${result.diseaseName}.`,
      // Confidence
      `${t('confidenceScore')}: ${confidencePercent}%.`,
      // Chemical treatment
      `${t('chemical')}: ${result.remedy.chemicalSolution}`,
      // Organic treatment
      `${t('natural')}: ${result.remedy.organicSolution}`,
      // Prevention
      `${t('prevention')}: ${result.remedy.prevention}`,
    ];

    speakSequence(texts, () => {
      setIsReadingAll(false);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Crop-Doc AI Diagnosis',
          text: `🌿 AI Scan Result\n\nCrop: ${result.crop}\nDiagnosis: ${result.diseaseName}\nConfidence: ${confidencePercent}%\n\nScanned with Crop-Doc AI`,
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
      {/* Hero Result Card */}
      <div className="relative rounded-3xl overflow-hidden mb-4 shadow-xl">
        <img
          src={result.imageUrl}
          alt="Scanned plant"
          className="w-full h-52 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* AI Badge */}
        <div className="absolute top-4 right-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20"
          >
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-white">{t('aiVerified')}</span>
          </motion.div>
        </div>

        {/* Result content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* Status badge */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3",
              isHealthy
                ? "bg-success text-success-foreground"
                : result.diseaseName === "No Crop Found"
                  ? "bg-slate-500 text-white"
                  : "bg-destructive text-destructive-foreground"
            )}
          >
            {isHealthy ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : result.diseaseName === "No Crop Found" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-semibold">
              {isHealthy
                ? t('healthyPlant')
                : result.diseaseName === "No Crop Found"
                  ? t('noCropDetected')
                  : t('diseaseDetected')}
            </span>
          </motion.div>

          {/* Explicit Crop Identification Badge */}
          {result.crop !== 'Unknown' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-2 mb-2"
            >
              <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/10 text-white text-sm font-medium">
                {t('cropIdentified')}: <span className="font-bold text-white">{result.crop}</span>
              </div>
            </motion.div>
          )}

          {/* Disease name */}
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-1"
          >
            {result.diseaseName}
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 text-sm"
          >
            Detected on {result.crop}
          </motion.p>
        </div>
      </div>

      {/* Read All Button - TTS Control */}
      {isSupported && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mb-4"
        >
          <Button
            onClick={readAllResults}
            variant={isReadingAll ? "default" : "outline"}
            className={cn(
              "w-full h-14 rounded-xl gap-3 text-base font-medium transition-all",
              isReadingAll && "bg-primary text-primary-foreground"
            )}
          >
            <AnimatePresence mode="wait">
              {isReadingAll ? (
                <motion.div
                  key="speaking"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-3"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5" onClick={(e) => { e.stopPropagation(); togglePause(); }} />
                      <span>Paused - Tap to Resume</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-4 bg-primary-foreground rounded-full animate-pulse" />
                        <span className="w-1 h-6 bg-primary-foreground rounded-full animate-pulse delay-75" />
                        <span className="w-1 h-3 bg-primary-foreground rounded-full animate-pulse delay-150" />
                      </div>
                      <span>{t('stopReading')}</span>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-3"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>🔊 {t('readAloud')}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      )}

      {/* Confidence Score Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl p-5 mb-4 border border-border shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('confidenceScore')}</p>
              <p className="text-sm font-medium text-foreground">{confidenceLevel} accuracy</p>
            </div>
          </div>
          <div className="text-right">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="text-3xl font-bold text-foreground"
            >
              {confidencePercent}
            </motion.span>
            <span className="text-lg text-muted-foreground">%</span>
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidencePercent}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
            className={cn(
              "h-full rounded-full relative overflow-hidden",
              confidenceColor === 'success' && "bg-success",
              confidenceColor === 'warning' && "bg-warning",
              confidenceColor === 'destructive' && "bg-destructive"
            )}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
            />
          </motion.div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Sparkles className="w-4 h-4 text-warning" />
          <p className="text-xs text-muted-foreground">
            {confidenceLevel === 'high' && "High confidence - recommended treatment below"}
            {confidenceLevel === 'medium' && "Good match - consider expert verification"}
            {confidenceLevel === 'low' && "Try a clearer photo for better accuracy"}
          </p>
        </div>
      </motion.div>

      {/* Remedy Tabs */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Tabs defaultValue="chemical" className="mb-4">
          <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-muted rounded-xl">
            <TabsTrigger
              value="chemical"
              className="touch-target flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <FlaskConical className="w-4 h-4" />
              <span className="font-medium">{t('chemical')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="organic"
              className="touch-target flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Leaf className="w-4 h-4" />
              <span className="font-medium">{t('natural')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chemical" className="mt-4">
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">{t('chemical')}</h3>
                </div>
                <button
                  onClick={() => speakText(result.remedy.chemicalSolution)}
                  className={cn(
                    "touch-target w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isSpeaking && !isReadingAll ? "bg-primary text-primary-foreground" : "bg-primary/10 hover:bg-primary/20"
                  )}
                  aria-label="Read aloud"
                >
                  {isSpeaking && !isReadingAll ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-primary" />
                  )}
                </button>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {result.remedy.chemicalSolution}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="organic" className="mt-4">
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-success" />
                  </div>
                  <h3 className="font-semibold text-foreground">{t('natural')}</h3>
                </div>
                <button
                  onClick={() => speakText(result.remedy.organicSolution)}
                  className={cn(
                    "touch-target w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isSpeaking && !isReadingAll ? "bg-primary text-primary-foreground" : "bg-primary/10 hover:bg-primary/20"
                  )}
                  aria-label="Read aloud"
                >
                  {isSpeaking && !isReadingAll ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-primary" />
                  )}
                </button>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {result.remedy.organicSolution}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Prevention tip */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-accent rounded-2xl p-5 mb-6 border border-accent"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent-foreground/10 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-accent-foreground" />
          </div>
          <h3 className="font-semibold text-accent-foreground">{t('prevention')}</h3>
        </div>
        <p className="text-sm text-accent-foreground/80 leading-relaxed">
          {result.remedy.prevention}
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 gap-3"
      >
        <Button
          variant="outline"
          size="lg"
          className="touch-target h-14 rounded-xl"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5 mr-2" />
          {t('share')}
        </Button>
        <Button
          size="lg"
          className="touch-target h-14 rounded-xl bg-primary hover:bg-primary/90"
          onClick={onScanAgain}
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          {t('scanAgain')}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ResultCard;