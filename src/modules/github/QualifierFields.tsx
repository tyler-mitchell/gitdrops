import { QualifierCombobox } from "@/modules/github/QualifierCombobox";

export function QualifierFields() {
  return (
    <>
      <QualifierCombobox qualifier="created" />
      <QualifierCombobox qualifier="language" />
      <QualifierCombobox qualifier="minStars" />
    </>
  );
}
