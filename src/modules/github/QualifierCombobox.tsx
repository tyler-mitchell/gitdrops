"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { QualifierOption, ResolvedQualifierConfig } from "./search-query.types";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "preact/hooks";
// import { Offscreen } from "@/components/offscreen";
import { Virtualizer } from "@/components/virtual-list";

type QualifierComboboxProps = {
  onSelect?: (qualifier?: QualifierOption) => void;
  qualifierConfig: ResolvedQualifierConfig;
  className?: string;
  isOpen?: boolean;
};

function OptionIcon({
  iconClassName,
  className,
  enabled = true,
  Icon,
}: {
  iconClassName?: string;
  className?: string;
  enabled?: boolean;
  Icon?: ResolvedQualifierConfig["Icon"];
}) {
  if ((!iconClassName && !Icon) || !enabled) return null;

  const Component = Icon ?? "span";

  return (
    <Component className={cn("h-4 w-4 shrink-0", iconClassName, className)} />
  );
}

const ComboboxSelect = ({
  qualifierConfig,
  className: classNameProp,
  isOpen,
}: QualifierComboboxProps) => {
  const { optionMap, value, inputProps, Icon } = qualifierConfig;

  const { placeholder, className, showIcon = true } = inputProps ?? {};

  const selected = optionMap.get(value ?? "");

  return (
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className={cn(
          "w-[200px] whitespace-nowrap justify-between gap-2",
          className,
          classNameProp
        )}
        style={
          {
            // width: width ?? "200px",
            // maxWidth: width ?? "200px",
          }
        }
      >
        <OptionIcon
          enabled={showIcon}
          iconClassName={selected?.iconClassName}
          Icon={Icon}
        />

        {selected ? selected.label : placeholder}

        <CaretSortIcon className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
  );
};
export function QualifierCombobox(props: QualifierComboboxProps) {
  const { onSelect } = props;

  const [open, setOpen] = React.useState(false);

  function handleClosePopover() {
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ComboboxSelect isOpen={open} {...props} />

      <PopoverContent className="w-[200px] p-0 h-full">
        <QualifierList
          {...props}
          onSelect={(v) => {
            onSelect?.(v);
            handleClosePopover();
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

const QualifierList = ({
  qualifierConfig,
  onSelect,
}: QualifierComboboxProps) => {
  const {
    allOptions: options,
    optionMap,
    width,
    value,
    listProps,
    searchProps,
    listItemProps,
    required = true,
    Icon,
  } = qualifierConfig;

  const scrollRef = useRef<React.ElementRef<"div">>(null);

  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 32,

    overscan: 20,
  });

  return (
    <Command className="h-full">
      {searchProps?.searchable && (
        <CommandInput placeholder={searchProps?.placeholder} className="h-9" />
      )}

      {listProps?.emptyLabel && (
        <CommandEmpty>{listProps.emptyLabel}</CommandEmpty>
      )}

      <Virtualizer
        scrollRef={scrollRef}
        virtualizer={virtualizer}
        width={width}
      >
        <Virtualizer.ScrollArea ref={scrollRef}>
          <Virtualizer.Viewport>
            <CommandList>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const option = options[virtualItem.index];

                return (
                  <Virtualizer.Item
                    key={`${option.qualifierValue}-${virtualItem.index}`}
                    virtualItem={virtualItem}
                  >
                    <CommandItem
                      autoFocus={false}
                      value={option.qualifierValue}
                      onSelect={(v) => {
                        const shouldUnselect = value === v && !required;

                        console.log({ shouldUnselect, v, value });

                        const selected = shouldUnselect
                          ? undefined
                          : optionMap.get(v);

                        onSelect?.(selected);
                      }}
                      className="w-full flex items-center gap-2"
                    >
                      <OptionIcon
                        enabled={listItemProps?.showIcon}
                        iconClassName={option.iconClassName}
                        Icon={Icon}
                      />

                      {option.label}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === option.qualifierValue
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  </Virtualizer.Item>
                );
              })}
            </CommandList>
          </Virtualizer.Viewport>
        </Virtualizer.ScrollArea>
      </Virtualizer>
    </Command>
  );
};
