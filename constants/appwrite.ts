import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCHpsKvz5kc_ANFtfhf-UoAV5-gbiZa-lI",
  authDomain: "nextgen-dating-app.firebaseapp.com",
  projectId: "nextgen-dating-app",
  storageBucket: "nextgen-dating-app.firebasestorage.app",
  messagingSenderId: "283687342429",
  appId: "1:283687342429:web:edfb06c051f4db9b6298b4",
  databaseURL: "https://nextgen-dating-app-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

export default app;