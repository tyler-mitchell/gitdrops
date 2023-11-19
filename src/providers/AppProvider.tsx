import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./AuthProvider";
import { ApiClientProvider } from "./ApiClientProvider";

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <ApiClientProvider>{children}</ApiClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
