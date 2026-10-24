import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';

// The verified authorized primary administrator email for the client's Firebase project
export const PRIMARY_ADMIN_EMAIL = 'nasirkhanprinting@gmail.com';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrapAdminRole: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        try {
          const isPrimary =
            user.email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

          // Fetch the user's admin document if one exists
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          const adminData = adminDoc.exists() ? adminDoc.data() : null;

          // Validate admin privileges:
          // Must have explicit administrator role AND matching email
          const hasValidAdminRole =
            adminData?.role === 'administrator' &&
            adminData?.email?.trim().toLowerCase() === user.email.trim().toLowerCase();

          if (isPrimary) {
            // Primary owner is unconditionally authorized
            setIsAdmin(true);

            // Self-bootstrap admin record if it does not yet exist
            if (!adminDoc.exists()) {
              try {
                await setDoc(doc(db, 'admins', user.uid), {
                  email: user.email.trim().toLowerCase(),
                  role: 'administrator',
                  createdAt: new Date().toISOString(),
                });
              } catch (bootstrapErr) {
                console.warn('Initial admin document self-bootstrap notice:', bootstrapErr);
              }
            }
          } else {
            // Non-primary accounts only obtain admin state if explicitly approved with matching email
            setIsAdmin(Boolean(hasValidAdminRole));
          }
        } catch (e) {
          console.warn('Admin check error:', e);
          // Fall back strictly to verified primary owner email
          const isPrimary =
            user.email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
          setIsAdmin(isPrimary);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isPrimary =
        result.user.email?.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

      if (isPrimary) {
        setIsAdmin(true);
        try {
          await setDoc(
            doc(db, 'admins', result.user.uid),
            {
              email: result.user.email?.trim().toLowerCase(),
              role: 'administrator',
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Background admin doc synchronization notice:', err);
        }
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      let errorMsg = err?.message || 'Failed to sign in with Google';
      if (err?.code === 'auth/unauthorized-domain' || errorMsg.includes('auth/unauthorized-domain')) {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        errorMsg = `Unauthorized Domain (${domain}): This domain is not yet listed in the Firebase project "ecommerce-978b5" Authorized Domains list. Please add "${domain}" in Firebase Console -> Authentication -> Settings -> Authorized domains, or use Email/Password login below.`;
      }
      setError(errorMsg);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Email sign in error:', err);
      setError(err?.message || 'Invalid email or password');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const bootstrapAdminRole = async () => {
    if (!currentUser?.email) return;
    const isPrimary =
      currentUser.email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

    if (!isPrimary) {
      console.warn('Unauthorized attempt: Only the verified primary owner can bootstrap admin documents.');
      return;
    }

    try {
      await setDoc(doc(db, 'admins', currentUser.uid), {
        email: currentUser.email.trim().toLowerCase(),
        role: 'administrator',
        createdAt: new Date().toISOString(),
      });
      setIsAdmin(true);
    } catch (err: any) {
      console.error('Admin bootstrap error:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        loginWithGoogle,
        loginWithEmail,
        logout,
        bootstrapAdminRole,
        error,
        clearError,
      }}
    >
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
