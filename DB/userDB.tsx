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

// Sign Up
export const signUp = async (email: string, password: string, name: string, age: number, gender: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Firestore lo user save cheyyi
    await setDoc(doc(db, 'users', uid), {
      uid,
      name,
      age,
      gender,
      email,
      bio: '',
      intent: 'relationship',
      photos: [],
      liked: [],
      matches: [],
      createdAt: new Date(),
    });

    return { success: true, uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Login
export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, uid: userCredential.user.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Logout
export const logout = async () => {
  await signOut(auth);
  
};

// All users fetch cheyyi (swipe cards ki)
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

// Like cheyyi + Match check cheyyi
export const likeUser = async (currentUid: string, likedUid: string) => {
  // Current user liked array lo add cheyyi
  await updateDoc(doc(db, 'users', currentUid), {
    liked: arrayUnion(likedUid)
  });

  // Opposite user meeru kuda like chesaadha check cheyyi
  const likedUserDoc = await getDoc(doc(db, 'users', likedUid));
  const likedUserData = likedUserDoc.data();

  if (likedUserData?.liked?.includes(currentUid)) {
    // Match! Rendu peru matches lo add cheyyi
    await updateDoc(doc(db, 'users', currentUid), {
      matches: arrayUnion(likedUid)
    });
    await updateDoc(doc(db, 'users', likedUid), {
      matches: arrayUnion(currentUid)
    });
    return { matched: true };
  }

  return { matched: false };
};
// User type export
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

// Firebase nundi users fetch cheyyi
export const fetchUsersFromFirebase = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, 'users'));
  const users: User[] = [];
  snapshot.forEach(docSnap => {
    users.push({ id: docSnap.id, ...docSnap.data() } as User);
  });
  return users;
};
export const matchwithgoalData: User[] = [
  {
    id: "1",
    name: "Ananya",
    age: 24,
    image: "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Travel lover",
    gender: "female",
    intent: "relationship",
  },
  {
    id: "2",
    name: "Meera",
    age: 22,
    image: "https://images.pexels.com/photos/1408978/pexels-photo-1408978.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Coffee addict",
    gender: "female",
    intent: "relationship",
  },
];

export const RECOMMENDATION_USER: User[] = [
  {
    id: "3",
    name: "Kavya",
    age: 25,
    image: "https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Designer",
    gender: "female",
    intent: "relationship",
  },
];
// AI Compatibility Score — Claude API
export const getCompatibilityScore = async (
  currentUser: any,
  otherUser: any
): Promise<{ score: number; reason: string }> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: `You are a dating app compatibility analyzer. Based on these two user profiles, give a compatibility score from 0-100 and one short reason (max 10 words).

User 1: Name: ${currentUser.name}, Intent: ${currentUser.intent}, Bio: ${currentUser.bio || 'Not provided'}
User 2: Name: ${otherUser.name}, Intent: ${otherUser.intent}, Bio: ${otherUser.bio || 'Not provided'}

Respond in JSON only: {"score": 85, "reason": "Both seeking serious relationships"}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text;
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    return { score: 75, reason: "Great potential match!" };
  }
};