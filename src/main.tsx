import { Router, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "@/styles/global.css";
import { AppProvider } from "./providers";
import { render } from "preact";

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

render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>,
  document.getElementById("root")!
);
