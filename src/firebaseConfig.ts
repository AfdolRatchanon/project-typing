// firebaseConfig.ts (ตัวอย่าง)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // สำหรับ Cloud Firestore
import { getDatabase } from "firebase/database"; // สำหรับ Realtime Database

// Your web app's Firebase configuration (ต้องใส่ข้อมูลของคุณเอง)
const firebaseConfig = {
  // apiKey: "YOUR_API_KEY",
  // authDomain: "YOUR_AUTH_DOMAIN",
  // projectId: "YOUR_PROJECT_ID",
  // storageBucket: "YOUR_STORAGE_BUCKET",
  // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  // appId: "YOUR_APP_ID",
  // databaseURL: "YOUR_DATABASE_URL", // สำคัญมากสำหรับ Realtime Database
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestoreDb = getFirestore(app); // ถ้าคุณใช้ Firestore ด้วย
export const realtimeDb = getDatabase(app); // นี่คือ Realtime Database instance
