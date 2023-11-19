import * as React from "react";
import { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { classed, deriveClassed } from "@tw-classed/react";
import * as Ariakit from "@ariakit/react";
import { CheckIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandPopoverElement = classed(
  Ariakit.SelectPopover,
  "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
  // Animate
  "data-[enter]:animate-in data-[leave]:animate-out",
  // // Fade
  "data-[enter]:fade-in-0 data-[leave]:fade-out-0",
  // // Zoom
  "data-[enter]:zoom-in-95 data-[leave]:zoom-out-95",
  // Slide
  "data-[enter]:slide-in-from-top-2"
  // "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
);

const CommandPopoverContentElement = classed(
  "div"
  // "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
  // Animate
  // "data-[enter]:animate-in data-[leave]:animate-out",
  // // Fade
  // "data-[enter]:fade-in-0 data-[leave]:fade-out-0",
  // // Zoom
  // "data-[enter]:zoom-in-95 data-[leave]:zoom-out-95",
  // // Slide
  // "slide-in-from-top-2"
  // "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
);

const CommandGroupLabel = classed(
  Ariakit.ComboboxGroupLabel,
  "px-2 font-medium text-muted-foreground"
);

const CommandSearchInputElement = classed(
  Ariakit.Combobox,
  "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
);

const CommandListElement = classed(
  Ariakit.ComboboxList,
  "max-h-[300px] overflow-y-auto overflow-x-hidden",
  "bg-popover"
);

const CommandGroupElement = classed(
  Ariakit.ComboboxGroup,
  "overflow-hidden p-1 text-foreground px-2 py-1.5 text-xs font-medium"
);

const CommandItemIconElement = classed("div", "h-4 w-4 shrink-0 mr-2");

const CommandItemEl = classed(
  Ariakit.ComboboxItem,
  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
  // "hover:bg-accent cursor-pointer",
  "aria-selected:bg-accent aria-selected:text-accent-foreground",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
);

const CommandItemElement = deriveClassed<
  typeof CommandItemEl,
  React.ComponentProps<typeof CommandItemEl> & {
    label: React.ReactNode;
    showIcon?: boolean;
    iconClassName?: string;
  }
>(({ label, showIcon, iconClassName, ...props }, ref) => {
  return (
    <CommandItemEl
      {...props}
      className="cursor-pointer group"
      ref={ref}
      render={<Ariakit.SelectItem value={props.value} />}
    >
      {showIcon && <CommandItemIconElement className={iconClassName} />}
      {label}
      <Ariakit.SelectItemCheck className="ml-auto group-data-[active-item]:opacity-50  group-aria-selected:i-lucide-check" />
    </CommandItemEl>
  );
});

const CommandItemSeparator = classed(
  Ariakit.ComboboxSeparator,
  "-mx-1 h-px bg-border"
);

const CommandEmptyItemElement = classed("div", "py-6 text-center text-sm");

const CommandShortcutElement = classed(
  "span",
  "ml-auto text-xs tracking-widest text-muted-foreground"
);

const CommandInputElement = classed(
  Ariakit.Select,
  Button,
  "w-[200px] justify-between"
);

export const CommandElement = Object.assign(
  {},
  {
    Input: CommandInputElement,
    Popover: CommandPopoverElement,
    PopoverContent: CommandPopoverContentElement,
    Group: CommandGroupElement,
    GroupLabel: CommandGroupLabel,
    SearchInput: CommandSearchInputElement,
    Item: CommandItemElement,
    List: CommandListElement,
    Separator: CommandItemSeparator,
    EmptyItem: CommandEmptyItemElement,
    Shortcut: CommandShortcutElement,
  }
);

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
