import { Button } from "@/components/ui/button";
import { signInWithGithub } from "@/modules/firebase";
import { useState } from "react";

export function InstallGithubAppButton() {
  const [token, setToken] = useState<string | undefined>();
  async function handleLogin() {
    const { githubOAuthCredential } = (await signInWithGithub()) ?? {};

    setToken(githubOAuthCredential?.accessToken);

    console.log("githubOAuthCredential", githubOAuthCredential);
  }
  return (
    <Button
      onClick={async () => {
        handleLogin();
      }}
      variant="outline"
      size="default"
      className="shrink-0 flex items-center">
      <span className="i-skill-icons-github-dark w-5 h-5 mr-2" />
      Connect Github
    </Button>
  );
}
