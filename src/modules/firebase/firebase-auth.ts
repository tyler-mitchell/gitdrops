/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import app from "@/modules/firebase/firebase-app";
import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  User,
} from "firebase/auth";

import { useEffect } from "react";

import { store } from "@/store";

const auth = getAuth(app);

function checkAuthState(user: User | null) {
  store.isSignedInToFirebase.value = Boolean(user);
  return store.isSignedInToFirebase.value;
}

export function useInitializeFirebaseAuth() {
  useEffect(() => {
    store.isSignedInToFirebase.value = checkAuthState(auth.currentUser);

    const unsub = auth.onAuthStateChanged((user) => {
      checkAuthState(user);
    });

    return () => {
      unsub();
    };
  }, []);
}

export async function signInWithGithub() {
  const provider = new GithubAuthProvider();

  try {
    const userCredential = await signInWithPopup(auth, provider);

    const githubOAuthCredential =
      GithubAuthProvider.credentialFromResult(userCredential);

    const { accessToken } = githubOAuthCredential ?? {};

    store.githubAccessToken.value = accessToken;

    return {
      githubOAuthCredential,
      userCredential,
    };
  } catch (e) {
    return undefined;
  }
}
