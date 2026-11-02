import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shivganesh.battlearena',
  appName: 'Character Battle Arena',
  webDir: 'out',
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-xxxxxxxxxxxxxxxx~wwwwwwwwww', // Replace with your AdMob App ID
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