import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../constants/appwrite';

export const saveVerificationStatus = async (userId: string, photoUri: string) => {
  try {
    // Photo → base64 convert
    const response = await fetch(photoUri);
    const blob = await response.blob();
    const reader = new FileReader();
    
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Firestore lo save — Storage avvakkarledu!
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      isVerified: true,
      verifiedAt: serverTimestamp(),
      selfieBase64: base64,
      verificationStep: 'selfie_complete',
    });

    return base64;
  } catch (error) {
    console.error('saveVerificationStatus error:', error);
    throw error;
  }
};

export const getVerificationStatus = async (userId: string): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    return snap.exists() ? !!snap.data().isVerified : false;
  } catch (error) {
    console.error('getVerificationStatus error:', error);
    return false;
  }
};