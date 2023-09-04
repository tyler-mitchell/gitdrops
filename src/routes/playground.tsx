import { FileRoute } from "@tanstack/react-router";
import RepoFeedPage from "@/pages/RepoFeed.page";
import { InputExamplePage } from "../pages/InputExample";

export const route = new FileRoute('playground').createRoute({
  component: InputExamplePage,
});
