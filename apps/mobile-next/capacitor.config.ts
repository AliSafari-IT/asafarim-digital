import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.asafarim.edumatch',
  appName: 'EduMatch',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
