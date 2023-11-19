import * as React from "react";
import { Outlet, RootRoute } from "@tanstack/react-router";
import { InstallGithubAppButton } from "@/components/login-with-github-button";
import { ModeToggle } from "@/components/mode-toggle";
import { store } from "@/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export const route = new RootRoute({
  component: function RootPage() {
    return (
      <div className="">
        <nav className="fixed top-0 w-full flex items-center gap-2 px-4 py-2 justify-between z-50 bg-card">
          <div className="font-medium text-lg select-none">Gitdrops</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button variant="outline" size="sm">
                  Hover
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span> {store.githubSearch.searchVariables.query}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div></div>

          <div className="flex items-center gap-2">
            <InstallGithubAppButton />
            <ModeToggle />
          </div>
        </nav>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-screen pt-12">
          {/* <div className="mx-auto max-w-3xl flex flex-col h-full"> */}
          <div className="mx-auto  flex flex-col h-full">
            <Outlet />
          </div>
        </div>
      </div>
    );
  },
});
