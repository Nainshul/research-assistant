import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Camera, Leaf, Zap, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get diagnosis in seconds'
    },
    {
      icon: Leaf,
      title: 'Natural Remedies',
      description: 'Organic treatment options'
    },
    {
      icon: WifiOff,
      title: 'Works Offline',
      description: 'No internet needed in field'
    },
  ];

  return (
    <AppLayout>
      <div className="px-6 py-8">
        {/* Hero section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Leaf className="w-12 h-12 text-primary" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Heal Your Crops
          </h1>
          <p className="text-muted-foreground text-lg max-w-xs mx-auto">
            Take a photo of your sick plant and get instant treatment advice
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <Button 
            size="lg" 
            className="w-full h-16 text-lg font-semibold touch-target rounded-2xl shadow-lg"
            onClick={() => navigate('/scan')}
          >
            <Camera className="w-6 h-6 mr-3" />
            Scan Your Crop
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Why Crop-Doc?
          </h2>
          
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Connection status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm"
        >
          <Wifi className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">Online • Cloud sync enabled</span>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Index;
