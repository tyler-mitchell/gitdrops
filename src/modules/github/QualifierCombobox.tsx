"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ResolvedQualifierConfig,
  type QualifierFilterId,
} from "./search-query.types";
import { QualifierOption } from "@/modules/github/search-query.types";
import { CommandList } from "cmdk";
import { useQualifierContext } from "@/modules/github/QualifierContext";

type OnSelect = (value: string) => void;

export function QualifierCombobox({
  qualifier,
}: {
  qualifier: QualifierFilterId;
}) {
  const [{ qualifierConfig }, dispatch] = useQualifierContext();

  const {
    options: qualifierOptions,
    optionGroups,
    optionMap,
    inputProps,
    listProps,
    listItemProps,
    searchProps,
    required,
    width = "200px",
  } = qualifierConfig[qualifier];

  const selected = qualifierConfig[qualifier].value ?? "";

  const options = qualifierOptions ?? [];

  const selectedOption = optionMap.get(selected);

  const [open, setOpen] = React.useState(false);

  function handleOptionSelect(currentValue: string) {
    const newValue = !required && currentValue === selected ? "" : currentValue;

    dispatch.setQualifierValue({ qualifier, value: newValue });

    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", inputProps?.className)}
          style={{ width }}>
          <InputLabel selectedOption={selectedOption} inputProps={inputProps} />

          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width }}>
        <Command>
          {searchProps?.searchable && (
            <CommandInput
              placeholder={searchProps.placeholder ?? "Search..."}
              className="h-9"
            />
          )}
          {listProps?.emptyLabel && (
            <CommandEmpty>{listProps?.emptyLabel}</CommandEmpty>
          )}

          <CommandList className="max-h-96 overflow-y-auto">
            <OptionGroup
              showIcons={listItemProps?.showIcon}
              options={options}
              onSelect={handleOptionSelect}
              selected={`${selected}`}
            />
            {optionGroups?.map(({ groupId, groupLabel, options }) => (
              <OptionGroup
                heading={groupLabel}
                key={groupId}
                options={options}
                onSelect={handleOptionSelect}
                selected={`${selected}`}
              />
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function InputLabel({
  selectedOption,
  inputProps,
}: {
  selectedOption?: QualifierOption;
  inputProps: ResolvedQualifierConfig["inputProps"];
}) {
  if (!selectedOption) return inputProps?.placeholder ?? "Select...";

  const { label, iconClassName } = selectedOption;

  return (
    <>
      <div className={cn("flex items-center justify-center gap-2")}>
        {inputProps?.showIcon && (
          <ComboboxItemIcon iconClassName={iconClassName} />
        )}
        <div>{label}</div>
      </div>
    </>
  );
}

function OptionGroup({
  options,
  selected,
  onSelect,
  heading,
  showIcons,
}: {
  options: QualifierOption[];
  selected: string;
  heading?: string;
  onSelect: OnSelect;
  showIcons?: boolean;
}) {
  return (
    <CommandGroup heading={heading}>
      {options.map(({ label, qualifierValue, iconClassName }) => (
        <CommandItem
          value={qualifierValue}
          key={qualifierValue}
          className="cursor-pointer"
          onSelect={(currentValue) => {
            onSelect(currentValue);
          }}>
          {showIcons && (
            <ComboboxItemIcon iconClassName={iconClassName} className="mr-2" />
          )}
          {label}

          <CheckIcon
            className={cn(
              "ml-auto h-4 w-4",
              selected === qualifierValue ? "opacity-100" : "opacity-0"
            )}
          />
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

function ComboboxItemIcon({
  iconClassName,
  className,
}: {
  iconClassName?: string;
  className?: string;
}) {
  return <div className={cn("h-4 w-4 shrink-0", iconClassName, className)} />;
}
