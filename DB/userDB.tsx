import { auth, db } from '../constants/appwrite';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection,
  getDocs, updateDoc, arrayUnion
} from 'firebase/firestore';

export type User = {
  id: string;
  name: string;
  age: number;
  bio?: string;
  image?: string;
  photo?: string;
  gender?: string;
  intent?: string;
  liked?: string[];
  matches?: string[];
};

export const signUp = async (email: string, password: string, name: string, age: number, gender: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    await setDoc(doc(db, 'users', uid), {
      uid, name, age, gender, email,
      bio: '', intent: 'relationship',
      photos: [], liked: [], matches: [],
      createdAt: new Date(),
    });
    return { success: true, uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, uid: userCredential.user.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  await signOut(auth);
};

export const getAllUsers = async (currentUid: string) => {
  const snapshot = await getDocs(collection(db, 'users'));
  const users: any[] = [];
  snapshot.forEach(docSnap => {
    if (docSnap.id !== currentUid) {
      users.push({ id: docSnap.id, ...docSnap.data() });
    }
  });
  return users;
};

export const likeUser = async (currentUid: string, likedUid: string) => {
  await updateDoc(doc(db, 'users', currentUid), {
    liked: arrayUnion(likedUid)
  });
  const likedUserDoc = await getDoc(doc(db, 'users', likedUid));
  const likedUserData = likedUserDoc.data();
  if (likedUserData?.liked?.includes(currentUid)) {
    await updateDoc(doc(db, 'users', currentUid), { matches: arrayUnion(likedUid) });
    await updateDoc(doc(db, 'users', likedUid), { matches: arrayUnion(currentUid) });
    return { matched: true };
  }
  return { matched: false };
};

export const fetchUsersFromFirebase = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, 'users'));
  const users: User[] = [];
  snapshot.forEach(docSnap => {
    users.push({ id: docSnap.id, ...docSnap.data() } as User);
  });
  return users;
};

export const matchwithgoalData: User[] = [
  { id: "1", name: "Ananya", age: 24, image: "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400", bio: "Travel lover", gender: "female", intent: "relationship" },
  { id: "2", name: "Meera", age: 22, image: "https://images.pexels.com/photos/1408978/pexels-photo-1408978.jpeg?auto=compress&cs=tinysrgb&w=400", bio: "Coffee addict", gender: "female", intent: "relationship" },
];

export const RECOMMENDATION_USER: User[] = [
  { id: "3", name: "Kavya", age: 25, image: "https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=400", bio: "Designer", gender: "female", intent: "relationship" },
];

// Smart Compatibility Score
export const getCompatibilityScore = (
  currentUser: any,
  otherUser: any
): { score: number; reason: string } => {
  let score = 60;
  let reason = "Interesting profile!";

  if (currentUser.intent === otherUser.intent) {
    score += 20;
    reason = "Same relationship goals!";
  }

  if (otherUser.bio && otherUser.bio.length > 10) {
    score += 10;
    reason = "Great bio, high compatibility!";
  }

  if (otherUser.age && currentUser.age) {
    const ageDiff = Math.abs(otherUser.age - currentUser.age);
    if (ageDiff <= 5) score += 10;
  }

  return { score: Math.min(score, 99), reason };
};
// Anti-ghosting — chat timer + streak update
export const updateChatStreak = async (currentUid: string, otherUid: string) => {
  const chatId = [currentUid, otherUid].sort().join('_');
  const chatRef = doc(db, 'chats', chatId);
  const chatSnap = await getDoc(chatRef);

  const now = new Date();
  
  if (chatSnap.exists()) {
    const data = chatSnap.data();
    const lastMessage = data.lastMessageAt?.toDate();
    const streak = data.streak || 0;
    
    // Last message 24 saarl lo chesthe streak continue
    const hoursDiff = lastMessage 
      ? (now.getTime() - lastMessage.getTime()) / (1000 * 60 * 60)
      : 999;
      
    const newStreak = hoursDiff <= 24 ? streak + 1 : 1;
    
    await updateDoc(chatRef, {
      streak: newStreak,
      lastMessageAt: now,
      ghostingWarning: false,
    });
    
    return newStreak;
  } else {
    await setDoc(chatRef, {
      users: [currentUid, otherUid],
      streak: 1,
      lastMessageAt: now,
      ghostingWarning: false,
    });
    return 1;
  }
};

// Ghosting check — 24hr reply lekapothe warning
export const checkGhostingWarning = async (currentUid: string, otherUid: string) => {
  const chatId = [currentUid, otherUid].sort().join('_');
  const chatRef = doc(db, 'chats', chatId);
  const chatSnap = await getDoc(chatRef);

  if (chatSnap.exists()) {
    const data = chatSnap.data();
    const lastMessage = data.lastMessageAt?.toDate();
    if (lastMessage) {
      const hoursDiff = (new Date().getTime() - lastMessage.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        await updateDoc(chatRef, { ghostingWarning: true });
        return true;
      }
    }
  }
  return false;
};// Privacy settings update
export const updatePrivacySettings = async (uid: string, settings: { incognito?: boolean, blurPhoto?: boolean }) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...settings,
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};