import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { UserProfile, UserRole, SchoolUnit } from '../types/uks';
import { DEMO_USERS } from '../data/seedData';
import { UksDataService } from '../services/uksService';

interface AuthContextType {
  currentUser: UserProfile;
  firebaseUser: User | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  switchRole: (role: UserRole, customUser?: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'uks_active_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Default active user is Admin UKS (most common active operator)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEMO_USERS[1]; // Ns. Siti Rahmawati (Admin UKS)
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsLoading(false);
      if (user) {
        // If logged in with Google, enrich current profile with real Google user info
        setCurrentUser(prev => {
          const updated: UserProfile = {
            ...prev,
            email: user.email || prev.email,
            displayName: user.displayName || prev.displayName,
            avatarUrl: user.photoURL || undefined,
          };
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        const email = result.user.email || '';
        // Check if matching specific admin
        let role: UserRole = 'admin_uks';
        let unit: SchoolUnit | 'SEMUA' = 'SEMUA';
        let assignedClass: string | undefined;

        if (email.includes('yayasan') || email.includes('admin')) {
          role = 'super_admin';
        } else if (email.includes('kepsek') || email.includes('kepala')) {
          role = 'kepala_sekolah';
          unit = 'SDIT';
        } else if (email.includes('guru') || email.includes('wali')) {
          role = 'guru';
          unit = 'SDIT';
          assignedClass = '4-A';
        } else if (email.includes('ortu') || email.includes('wali.murid')) {
          role = 'orang_tua';
        }

        const newUser: UserProfile = {
          id: result.user.uid,
          email,
          displayName: result.user.displayName || email.split('@')[0],
          role,
          unit,
          assignedClass,
          avatarUrl: result.user.photoURL || undefined,
        };

        setCurrentUser(newUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
        UksDataService.logAudit(newUser.id, newUser.displayName, newUser.role, 'LOGIN_GOOGLE', `Login via Google: ${email}`);
      }
    } catch (error) {
      console.warn('Google sign-in popup closed or cancelled:', error);
    }
  };

  const switchRole = (role: UserRole, customUser?: Partial<UserProfile>) => {
    const targetDemo = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[1];
    const updated: UserProfile = {
      ...targetDemo,
      ...customUser,
      avatarUrl: currentUser.avatarUrl || targetDemo.avatarUrl,
    };
    setCurrentUser(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    UksDataService.logAudit(
      updated.id,
      updated.displayName,
      updated.role,
      'GANTI_PERAN',
      `Beralih ke peran ${updated.role} (${updated.displayName})`
    );
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    // Set to demo default
    const def = DEMO_USERS[1];
    setCurrentUser(def);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(def));
  };

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (currentUser.role === 'super_admin') return true;
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      firebaseUser,
      isLoading,
      loginWithGoogle,
      switchRole,
      logout,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
