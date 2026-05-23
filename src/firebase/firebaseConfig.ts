import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// เชื่อมต่อ emulator อัตโนมัติเมื่อรัน dev (VITE_USE_EMULATOR=true)
// experimentalForceLongPolling แก้ปัญหา WebKit (Safari/iPhone) ที่ WebSocket กับ emulator ไม่ทำงาน
export const db = import.meta.env.VITE_USE_EMULATOR === 'true'
  ? initializeFirestore(app, { experimentalForceLongPolling: true })
  : getFirestore(app);

if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.info('[DEV] Firebase Emulator connected (long-polling mode)');
}
