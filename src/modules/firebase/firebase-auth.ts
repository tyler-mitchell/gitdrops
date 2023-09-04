import app from "@/modules/firebase/firebase-app";
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { useEffect, useState } from "react";

export function getFirebaseAuth() {
  return getAuth(app);
}

const GH_ACCESS_TOKEN_KEY = "githubAccessToken";

export const githubAccessToken = {
  getTokenAuthHeader() {
    const token = this.getToken();

    if (!token) return undefined;

    return { Authorization: `Bearer ${token}` };
  },
  hasToken: () => Boolean(localStorage.getItem(GH_ACCESS_TOKEN_KEY)),
  getToken: () => localStorage.getItem(GH_ACCESS_TOKEN_KEY),
  removeToken: () => localStorage.removeItem(GH_ACCESS_TOKEN_KEY),
  setToken: (accessToken?: string) => {
    if (accessToken) {
      localStorage.setItem(GH_ACCESS_TOKEN_KEY, accessToken);
    }
  },
};

export function useGithubSignIn() {
  const [isSignedIn, setIsSignedIn] = useState(githubAccessToken.hasToken());

  async function signInWithGithub() {
    const provider = new GithubAuthProvider();

    const auth = getFirebaseAuth();

    try {
      const userCredential = await signInWithPopup(auth, provider);

      const githubOAuthCredential =
        GithubAuthProvider.credentialFromResult(userCredential);

      const { accessToken } = githubOAuthCredential ?? {};

      githubAccessToken.setToken(accessToken);
      setIsSignedIn(true);

      return {
        githubOAuthCredential,
        userCredential,
      };
    } catch (e) {
      githubAccessToken.setToken(undefined);
      setIsSignedIn(false);
      return undefined;
    }
  }

  useEffect(() => {
    const auth = getFirebaseAuth();

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user && githubAccessToken.hasToken()) {
        githubAccessToken.removeToken();
      }

      setIsSignedIn(Boolean(user));
    });

    return () => {
      unsubAuth();
    };
  }, []);

  return { isSignedIn, signInWithGithub };
}
