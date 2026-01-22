import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "../util/firebase";
import { getAdminUserByEmail, createAdminUser } from "../services/firestore";
import { setUser, setLoading, setError } from "../store/slices/authSlice";
import { type RootState } from "../store";

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(setLoading(true));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Check if admin user exists in Firestore
          const adminUser = await getAdminUserByEmail(firebaseUser.email || "");

          if (adminUser) {
            dispatch(setUser(adminUser));
          } else {
            // Create new admin user if not exists
            const displayName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Admin";
            const newAdminUser = await createAdminUser(firebaseUser.email || "", displayName);
            dispatch(setUser(newAdminUser));
          }
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        dispatch(setError((error as Error).message));
      } finally {
        dispatch(setLoading(false));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  const loginWithEmail = async (email: string) => {
    dispatch(setLoading(true));
    try {
      // Sign in anonymously first
      await signInAnonymously(auth);
      
      // Then create/get admin user with email
      const adminUser = await getAdminUserByEmail(email);
      if (adminUser) {
        dispatch(setUser(adminUser));
      } else {
        const displayName = email.split("@")[0];
        const newAdminUser = await createAdminUser(email, displayName);
        dispatch(setUser(newAdminUser));
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      dispatch(setUser(null));
    } catch (error) {
      dispatch(setError((error as Error).message));
    }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    loginWithEmail,
    logout,
  };
};
