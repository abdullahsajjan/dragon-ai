import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase App safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In helper
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      await saveUserProfile(user);
    }
    return user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      console.log('Google sign-in popup closed by user');
      return null;
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups or try email sign in.');
    }
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

// Email/Password Sign-In
export const signInWithEmail = async (email: string, pass: string) => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
};

// Email/Password Sign-Up
export const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const user = result.user;
  if (displayName && user) {
    await updateProfile(user, { displayName });
  }
  await saveUserProfile(user);
  return user;
};

// Sign Out helper
export const logoutUser = async () => {
  await signOut(auth);
};

// Save user profile to Firestore
export const saveUserProfile = async (user: User) => {
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || '',
      lastLoginAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
};

// Save chat sessions to Firestore for authenticated user
export const saveUserSessionsToFirestore = async (userId: string, sessions: any[]) => {
  if (!userId || !sessions) return;
  try {
    const userSessionsRef = doc(db, 'users', userId, 'data', 'chatSessions');
    await setDoc(userSessionsRef, {
      sessions: JSON.stringify(sessions),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Error saving sessions to Firestore:', err);
  }
};

// Load chat sessions from Firestore for authenticated user
export const loadUserSessionsFromFirestore = async (userId: string): Promise<any[] | null> => {
  if (!userId) return null;
  try {
    const userSessionsRef = doc(db, 'users', userId, 'data', 'chatSessions');
    const docSnap = await getDoc(userSessionsRef);
    if (docSnap.exists() && docSnap.data().sessions) {
      return JSON.parse(docSnap.data().sessions);
    }
  } catch (err) {
    console.error('Error loading sessions from Firestore:', err);
  }
  return null;
};
