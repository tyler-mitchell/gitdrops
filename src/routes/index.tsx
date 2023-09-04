import { FileRoute } from "@tanstack/react-router";
import RepoFeedPage from "@/pages/RepoFeed.page";

export const route = new FileRoute('/').createRoute({
  component: RepoFeedPage,
});
