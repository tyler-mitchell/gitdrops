import { GithubSearchToolbar } from "@/modules/github/GithubSearchToolbar";
import RepoList from "@/pages/RepoList";
// import { QualifierFields } from "@/modules/github/QualifierFields";

function RepoFeedPage() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <GithubSearchToolbar className="mt-8" />
      <RepoList />
    </div>
  );
}

export default RepoFeedPage;
[];
