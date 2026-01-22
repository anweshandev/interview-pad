import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getLimitedUseToken, initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: "AIzaSyAyRARBhRi0-naRSs6VOt_O18nCOz2yHiU",
  authDomain: "pravaah-consulting-inc.firebaseapp.com",
  projectId: "pravaah-consulting-inc",
  storageBucket: "pravaah-consulting-inc.appspot.com",
  messagingSenderId: "561508397957",
  appId: "1:561508397957:web:a65391214b718bc6468aec",
  measurementId: "G-CS847D6VK4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider('6LcpiJAqAAAAAOe4uyybKcyk6NPQe4Oqz1-Iuz6U'),
  isTokenAutoRefreshEnabled: true
});
const ai = getAI(app, 
	{ 
		backend: new GoogleAIBackend(), 
		useLimitedUseAppCheckTokens: true,
	}
);

const baseModel = getGenerativeModel(ai, { model: "gemini-2.5-flash" });


/**
 * Get the current App Check token.
 * @returns The App Check token string.
 */
export const getAppCheckToken = async (): Promise<string> => {
  const tokenResult = await getLimitedUseToken(appCheck);
  return tokenResult.token;
}

/**
 * Get the current user's ID token.
 * @returns The ID token string or null if no user is signed in.
 */
export const getIDToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
	return await user.getIdToken(true);
  }
  return null;
}


export { app, auth, db, storage, analytics, appCheck, ai, baseModel };
