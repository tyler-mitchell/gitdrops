import app from "@/modules/firebase/firebase-app";
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";

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
  getToken: () => localStorage.getItem(GH_ACCESS_TOKEN_KEY),
  setToken: (accessToken?: string) => {
    if (accessToken) {
      localStorage.setItem(GH_ACCESS_TOKEN_KEY, accessToken);
    }
  },
};

export async function getGithubAuthHeaderValue() {
  const auth = getFirebaseAuth();

  const { currentUser } = auth;

  if (!currentUser) {
    return undefined;
  }
}

export async function signInWithGithub() {
  const provider = new GithubAuthProvider();

  const auth = getFirebaseAuth();

  try {
    const userCredential = await signInWithPopup(auth, provider);

    const githubOAuthCredential =
      GithubAuthProvider.credentialFromResult(userCredential);

    const { accessToken } = githubOAuthCredential ?? {};

    githubAccessToken.setToken(accessToken);

    return {
      githubOAuthCredential,
      userCredential,
    };
  } catch (e) {
    console.log(e);
    return undefined;
  }
}
