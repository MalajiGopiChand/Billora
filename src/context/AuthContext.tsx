import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => onAuthStateChanged(auth, async (activeUser) => {
    setUser(activeUser);
    const token = await activeUser?.getIdTokenResult();
    const isOwner = activeUser?.email === 'thegopichand@gmail.com';
    setIsAdmin(Boolean(token?.claims.admin) || isOwner);
    setLoading(false);
  }), []);

  const value: AuthContextValue = {
    user,
    loading,
    isAdmin,
    login: async (email, password) => { await signInWithEmailAndPassword(auth, email, password); },
    register: async (email, password) => {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', credential.user.uid), { uid: credential.user.uid, email: credential.user.email });
    },
    logout: () => signOut(auth),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
