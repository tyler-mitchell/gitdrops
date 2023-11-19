import { useInitializeFirebaseAuth } from "@/modules/firebase";

export function AuthProvider({ children }: { children?: React.ReactNode }) {
  useInitializeFirebaseAuth();
  return <>{children}</>;
}
