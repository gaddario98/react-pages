import { expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react-native';

// Mock React Native platform detection
global.navigator = {
  ...global.navigator,
  product: 'ReactNative',
} as any;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Platform module from React Native
vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: vi.fn((obj: any) => obj.ios),
  },
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
}));

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

// Suppress console errors in tests (optional)
let originalError: any;
beforeEach(() => {
  originalError = console.error;
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});
