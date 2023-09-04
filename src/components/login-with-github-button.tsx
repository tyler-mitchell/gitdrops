import { Button } from "@/components/ui/button";
import { useGithubSignIn } from "@/modules/firebase";

export function InstallGithubAppButton() {
  const { signInWithGithub, isSignedIn } = useGithubSignIn();

  if (isSignedIn) return null;

  return (
    <Button
      onClick={async () => {
        signInWithGithub();
      }}
      variant="outline"
      size="default"
      className="shrink-0 flex items-center">
      <span className="i-skill-icons-github-dark w-5 h-5 mr-2" />
      Connect Github
    </Button>
  );
}
