import { store } from "@/store";
import { SearchField } from "@/components/ui/input";
import { QualifierCombobox } from "./QualifierCombobox";
import { map } from "lodash-es";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

const {
  githubSearch: { qualifiers },
} = store;

export function GithubSearchToolbar({ className }: { className?: string }) {
  const debouncedOnChange = useDebouncedCallback((v: string) => {
    store.githubSearch.searchInput.value = v;
  }, 350);

  return (
    <div className={cn("flex gap-2 flex-wrap", className)}>
      <SearchField
        className="w-full"
        placeholder="Search"
        leadingIconClassName={"i-lucide-search"}
        value={store.githubSearch.searchInput.value}
        loading={store.githubSearch.isLoadingGithubSearchResults.value}
        onChange={debouncedOnChange}
      />

      <div className="flex flex-wrap gap-2">
        {map(qualifiers, (qualifierConfig, qualifierId) => (
          <QualifierCombobox
            className="grow"
            qualifierConfig={qualifierConfig.value}
            onSelect={(selected) => {
              const { qualifierValue } = selected ?? {};

              const qualifierSignal =
                qualifiers[qualifierId as keyof typeof qualifiers];

              qualifierSignal.value = {
                ...qualifierSignal.value,
                value: qualifierValue,
              };
            }}
          />
        ))}

        {/* <Button variant="outline" onClick={() => {}}>
          Reset to default
        </Button> */}
      </div>
    </div>
  );
}
