import { initializeApp } from 'firebase/app';
import { Auth, browserLocalPersistence, getAuth, initializeAuth } from 'firebase/auth';
// @ts-expect-error getReactNativePersistence exists at runtime via Metro's react-native bundle resolution
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHQV9uuP4of7pqYuWy-0cmJNtSbKvfgMM",
  authDomain: "thespotapp-144e2.firebaseapp.com",
  projectId: "thespotapp-144e2",
  storageBucket: "thespotapp-144e2.firebasestorage.app",
  messagingSenderId: "889053884899",
  appId: "1:889053884899:web:ecf2c55bbb060947c430d6",
  measurementId: "G-RKGP53QSV7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with platform-appropriate persistence
let auth: Auth;
try {
  if (Platform.OS === 'web') {
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch (e: any) {
  if (e.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw e;
  }
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 