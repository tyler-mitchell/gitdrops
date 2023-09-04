import { QualifierCombobox } from "@/modules/github/QualifierCombobox";
import { SearchQueryField } from "./SearchQueryField";
export function QualifierFields() {
  return (
    <>
      <SearchQueryField />
      <QualifierCombobox qualifier="created" />
      <QualifierCombobox qualifier="language" />
      <QualifierCombobox qualifier="minStars" />
    </>
  );
}
