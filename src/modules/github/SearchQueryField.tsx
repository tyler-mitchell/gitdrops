import { SearchField } from "@/components/ui/input";
import { useQualifierContext } from "@/modules/github/QualifierContext";

function SearchQueryField() {
  const [{ searchInput }, dispatch] = useQualifierContext();

  return (
    <SearchField
      className="w-full"
      placeholder="Search"
      leadingIconClassName={"i-lucide-search"}
      value={searchInput}
      onChange={(v) => {
        dispatch.setSearchInput(v);
      }}
    />
  );
}

export { SearchQueryField };
