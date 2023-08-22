import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { env } from "@/env/index.ts";
import { Router, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "@/styles/global.css";
import { ThemeProvider } from "@/components/theme-provider";

// Set up a Router instance
const router = new Router({
  routeTree,
  defaultPreload: "intent",
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ThemeProvider defaultTheme="dark">
      <ClerkProvider publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}>
        <RouterProvider router={router} />
      </ClerkProvider>
    </ThemeProvider>
  );
}
