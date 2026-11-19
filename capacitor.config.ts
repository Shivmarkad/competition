import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shivganesh.battlearena',
  appName: 'Character Battle Arena',
  webDir: 'out',
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-3940256099942544~3347511713', // Google's official test AdMob App ID
      testingDevices: ['auto'],
      initializeForTesting: true,
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;