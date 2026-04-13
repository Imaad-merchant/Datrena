import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3O1zaa02Gd9ztpEQ05jsaPLZQKQHXtc4",
  authDomain: "signal-54014.firebaseapp.com",
  projectId: "signal-54014",
  storageBucket: "signal-54014.firebasestorage.app",
  messagingSenderId: "725420236180",
  appId: "1:725420236180:web:d5f3e8b4c9a1f2d3e4f5a6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
