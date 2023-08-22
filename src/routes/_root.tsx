import * as React from "react";
import { Outlet, RootRoute } from "@tanstack/react-router";
import { InstallGithubAppButton } from "@/components/login-with-github-button";
import { ModeToggle } from "@/components/mode-toggle";
import { useQualifierContext } from "@/modules/github/QualifierContext";

export const route = new RootRoute({
  component: function RootPage() {
    const [{ githubQueryString }] = useQualifierContext();

    return (
      <div>
        <nav className="fixed top-0 w-full h-12 flex items-center gap-2 px-4  justify-between">
          <div className="font-medium text-xl select-none">Gitdrops</div>
          <div className="text-muted select-none">{githubQueryString}</div>

          <div className="flex items-center gap-2">
            <InstallGithubAppButton />
            <ModeToggle />
          </div>
        </nav>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-screen pt-12">
          <div className="mx-auto max-w-3xl">
            <Outlet />
          </div>
        </div>
      </div>
    );
  },
});

function RepoCard() {}
