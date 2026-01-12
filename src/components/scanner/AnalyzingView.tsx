import { motion } from 'framer-motion';
import { Leaf, Sparkles, Cpu, Scan, Brain, CheckCircle2 } from 'lucide-react';
import { isModelReady } from '@/lib/plantDiseaseModel';
import { useState, useEffect } from 'react';

interface AnalyzingViewProps {
  imageUrl: string;
}

const analysisSteps = [
  { icon: Scan, label: 'Scanning image', duration: 800 },
  { icon: Brain, label: 'AI processing', duration: 1200 },
  { icon: Leaf, label: 'Identifying disease', duration: 1000 },
  { icon: CheckCircle2, label: 'Generating results', duration: 800 },
];

const AnalyzingView = ({ imageUrl }: AnalyzingViewProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const advanceStep = () => {
      setCurrentStep((prev) => {
        if (prev < analysisSteps.length - 1) {
          timeout = setTimeout(advanceStep, analysisSteps[prev + 1].duration);
          return prev + 1;
        }
        return prev;
      });
    };

    timeout = setTimeout(advanceStep, analysisSteps[0].duration);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[70vh] bg-gradient-to-b from-background to-muted/30">
      {/* Captured image with analysis overlay */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-56 h-56 rounded-3xl overflow-hidden shadow-2xl mb-8"
      >
        <img
          src={imageUrl}
          alt="Captured plant"
          className="w-full h-full object-cover"
        />
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/20" />
        
        {/* Animated scan effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.3) 50%, transparent 100%)',
            backgroundSize: '100% 40px',
          }}
          animate={{ 
            backgroundPosition: ['0% -40px', '0% 300px'],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
        />

        {/* Corner brackets */}
        <div className="absolute inset-3">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
          </motion.div>
        </div>

        {/* AI badge */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-center">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full"
          >
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-white">
              {isModelReady() ? 'TensorFlow.js' : 'AI Engine'}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Progress steps */}
      <div className="w-full max-w-xs mb-8">
        <div className="space-y-3">
          {analysisSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/10 border border-primary/30' 
                    : isComplete 
                      ? 'bg-success/10 border border-success/30' 
                      : 'bg-muted/50 border border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isComplete 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <motion.div
                      animate={isActive ? { rotate: 360 } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isActive 
                    ? 'text-primary' 
                    : isComplete 
                      ? 'text-success' 
                      : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {isActive && (
                  <motion.div
                    className="ml-auto"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Sparkles className="w-4 h-4 text-warning" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Status message */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-center"
      >
        <p className="text-muted-foreground text-sm">
          {isModelReady() 
            ? 'Running on-device AI inference'
            : 'Analyzing with cloud AI'}
        </p>
      </motion.div>

      {/* Animated dots */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ 
              scale: [1, 1.5, 1], 
              opacity: [0.3, 1, 0.3] 
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              delay: i * 0.15 
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnalyzingView;