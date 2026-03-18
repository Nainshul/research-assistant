import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.cropdoc.android',
  appName: 'Crop-Doc',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    useLegacyBridge: false,
  },
};

export default config;
