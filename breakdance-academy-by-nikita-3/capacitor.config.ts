export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
    iosScheme?: string;
  };
  ios?: {
    contentInset?: string;
    preferredContentMode?: string;
    allowsInlineMediaPlayback?: boolean;
    scrollEnabled?: boolean;
  };
  plugins?: Record<string, unknown>;
}

const config: CapacitorConfig = {
  appId: 'com.nikita.breakdanceacademy',
  appName: 'Брейк от Никиты',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'ionic'
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    allowsInlineMediaPlayback: true,
    scrollEnabled: true
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#FFE600'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark'
    }
  }
};

export default config;
