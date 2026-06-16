import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

const OWNER_UID = "AT5ZK6aKtDXOvUCaSs2qVGhuNUP2";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result on page load
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect error:", err);
    });

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  const logout = () => signOut(auth);

  const isOwner = user?.uid === OWNER_UID;

  return { user, isOwner, loading, login, logout };
}
