import MillionJsTest from "@/pages/MillionTest";
import { QualifierFields } from "@/modules/github/QualifierFields";

function RepoFeedPage() {
  // const { user } = useUser();

  // const { search } = useQuery();

  // const [{ githubQueryString }] = useQualifierContext();

  // const items = useMemo(() => {
  //   const r = search({
  //     query: githubQueryString,
  //     type: SearchType.REPOSITORY,
  //     first: 10,
  //   });

  //   return githubRepoCardListSelector(r);
  // }, [search, githubQueryString]);

  // console.log("ITEMS", items);
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex gap-2 mt-8">
        <QualifierFields />
      </div>

      <MillionJsTest />

      {/* <pre>{JSON.stringify(clerk.user, null, 2)}</pre> */}
    </div>
  );
}

export default RepoFeedPage;
