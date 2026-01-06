import { motion } from 'framer-motion';
import { Leaf, Sparkles, Cpu } from 'lucide-react';
import { isModelReady } from '@/lib/plantDiseaseModel';

interface AnalyzingViewProps {
  imageUrl: string;
}

const AnalyzingView = ({ imageUrl }: AnalyzingViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[60vh]">
      {/* Captured image preview */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-xl mb-8"
      >
        <img
          src={imageUrl}
          alt="Captured plant"
          className="w-full h-full object-cover"
        />
        
        {/* Scanning overlay */}
        <motion.div
          className="absolute inset-0 bg-primary/20"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {/* Scanning line */}
        <motion.div
          className="absolute left-0 right-0 h-1 bg-primary"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* Animated icon */}
      <motion.div
        className="relative mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <Sparkles className="w-5 h-5 text-warning" />
        </motion.div>
      </motion.div>

      {/* Loading text */}
      <motion.h2
        className="text-xl font-bold text-foreground mb-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Analyzing your crop...
      </motion.h2>
      
      <p className="text-muted-foreground text-center max-w-xs">
        {isModelReady() 
          ? 'Running TensorFlow.js AI model on your device'
          : 'Our AI is examining the image to identify any diseases'}
      </p>

      {/* AI Engine indicator */}
      <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary/10 rounded-full">
        <Cpu className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-primary">
          {isModelReady() ? 'On-Device AI' : 'Demo Mode'}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnalyzingView;
