import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../util/firebase";
import { setUser, setLoading, setError } from "../store/slices/authSlice";
import { type RootState } from "../store";
import type { AdminUser } from "../types";

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(setLoading(true));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get custom claims from token
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const role = idTokenResult.claims.role as string | undefined;

          // Check if user has admin role
          if (role === "admin") {
            const adminUser: AdminUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: "admin",
            };
            dispatch(setUser(adminUser));
          } else {
            // Not an admin, logout
            await auth.signOut();
            dispatch(setUser(null));
            dispatch(setError("Access denied. Admin role required."));
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

  const loginWithEmail = async (_email: string) => {
    dispatch(setLoading(true));
    try {
      // Note: You'll need to set up email link authentication in Firebase
      // For now, we'll use anonymous signin + custom token approach
      // This is a placeholder - implement actual email link auth in your Firebase setup

      dispatch(setError("Email login setup required. Contact your Firebase admin."));
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
