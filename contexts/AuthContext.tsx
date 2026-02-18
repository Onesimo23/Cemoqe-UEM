import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: 'student' | 'instructor' | 'admin';
  status: 'Ativo' | 'Suspenso';
  providers: string[];
  createdAt: any;
  lastLogin: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Garante persistência local da sessão
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((e) => {
      console.warn('Falha ao configurar persistência de sessão:', e);
    });
  }, []);

  // Inicializa rapidamente a sessão com base no auth.currentUser (fallback imediato)
  useEffect(() => {
    if (auth.currentUser && !user) {
      const cu = auth.currentUser;
      setUser(cu);
      if (!profile) {
        const fullName = cu.displayName || cu.email?.split('@')[0] || 'Utilizador';
        const fallback: UserProfile = {
          id: cu.uid,
          uid: cu.uid,
          email: cu.email || '',
          full_name: fullName,
          avatar_url: cu.photoURL || null,
          role: 'student',
          status: 'Ativo',
          providers: cu.providerData.map(p => p.providerId),
          createdAt: null,
          lastLogin: null,
        };
        setProfile(fallback);
      }
      setLoading(false);
    }
  }, []);

  const getOrUpdateProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const userRef = doc(db, 'profiles', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    let profileData: UserProfile;

    if (userSnap.exists()) {
      profileData = { ...(userSnap.data() as UserProfile), uid: firebaseUser.uid };
      // Garantir que nunca tenha "Novo Utilizador"
      if (profileData.full_name === 'Novo Utilizador' || !profileData.full_name) {
        profileData.full_name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilizador';
        await setDoc(userRef, { full_name: profileData.full_name }, { merge: true });
      }
    } else {
      // Extrair nome do Google: usar displayName, senão usar parte do email antes do @
      const fullName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilizador';
      
      profileData = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        full_name: fullName,
        avatar_url: firebaseUser.photoURL || null,
        role: 'student',
        status: 'Ativo',
        providers: firebaseUser.providerData.map(p => p.providerId),
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      await setDoc(userRef, profileData);
    }
    
    return profileData;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userProfile = await getOrUpdateProfile(currentUser);
          setProfile(userProfile);
          await setDoc(doc(db, 'profiles', currentUser.uid), { 
            lastLogin: serverTimestamp(),
            providers: currentUser.providerData.map(p => p.providerId)
          }, { merge: true });
        } catch (err) {
          console.error("Erro ao carregar perfil:", err);
          // Fallback seguro: trata utilizador autenticado como estudante quando Firestore estiver indisponível
          const fullName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Utilizador';
          const fallback: UserProfile = {
            id: currentUser.uid,
            uid: currentUser.uid,
            email: currentUser.email || '',
            full_name: fullName,
            avatar_url: currentUser.photoURL || null,
            role: 'student',
            status: 'Ativo',
            providers: currentUser.providerData.map(p => p.providerId),
            createdAt: null,
            lastLogin: null,
          };
          setProfile(fallback);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const updated = await getOrUpdateProfile(user);
      setProfile(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
