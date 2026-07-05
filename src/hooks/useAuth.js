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
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Signed in via redirect:", result.user.uid);
        }
      })
      .catch((err) => console.error("Redirect error:", err));

    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("Auth state:", u?.uid ?? "not signed in");
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, []);

  const login = () => signInWithRedirect(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);
  const isOwner = user?.uid === OWNER_UID;

  return { user, isOwner, loading, login, logout };
}
