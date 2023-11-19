import * as React from "react";
import {
  NumberField as AriaNumberField,
  NumberFieldProps,
  Input,
  TextField as AriaTextField,
  TextFieldProps,
  Label,
  Button as AriaButton,
  SearchField as AriaSearchField,
  SearchFieldProps,
} from "react-aria-components";
import { classed } from "@tw-classed/react";
import { cn } from "@/lib/utils";

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const BaseInput = classed(Input, inputClass);

const NumberField = (props: NumberFieldProps) => {
  return (
    <AriaNumberField {...props} className="w-full">
      <BaseInput />
    </AriaNumberField>
  );
};

const InputIconElement = classed("div", "h-5 w-5 max-h-8 max-w-8", {
  variants: {
    position: {
      start: "mr-3",
      end: "ml-3",
    },
  },
});

const InputIcon = ({
  icon,
  className,
  position,
}: {
  icon?: React.ReactNode;
  position: "start" | "end";
  className?: string;
}) => {
  if (!icon && !className) return null;

  return (
    <InputIconElement className={className} position={position}>
      {icon}
    </InputIconElement>
  );
};

const TextField = ({
  label,
  placeholder,
  leadingIcon,
  trailingIcon,
  leadingIconClassName,
  trailingIconClassName,
  ...props
}: TextFieldProps & InnerInputProps) => {
  return (
    <AriaTextField {...props}>
      <InnerInput
        {...{
          label,
          placeholder,
          leadingIcon,
          trailingIcon,
          leadingIconClassName,
          trailingIconClassName,
        }}
      />
    </AriaTextField>
  );
};

const SearchField = ({
  label,
  placeholder,
  leadingIcon,
  trailingIcon,
  leadingIconClassName,
  trailingIconClassName,
  className,
  loading,
  ...props
}: SearchFieldProps & InnerInputProps & { loading?: boolean }) => {
  return (
    <AriaSearchField {...props} className={cn("w-full", className)}>
      <InnerInput
        {...{
          label,
          placeholder,
          leadingIcon,
          trailingIcon,
          leadingIconClassName: loading
            ? cn("i-lucide-loader-2 animate-spin")
            : leadingIconClassName,
          trailingIconClassName,
        }}
      >
        <AriaButton className="cursor-pointer absolute right-0" />
      </InnerInput>
    </AriaSearchField>
  );
};

type InnerInputProps = {
  label?: React.ReactNode;
  placeholder?: string;
  leadingIconClassName?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  trailingIconClassName?: string;
  children?: React.ReactNode;
};

const InnerInput = ({
  label,
  placeholder,
  leadingIcon,
  trailingIcon,
  leadingIconClassName,
  trailingIconClassName,
  children,
}: InnerInputProps) => {
  const inputRef = React.useRef<React.ElementRef<"input">>(null);

  return (
    <>
      {label && <Label>{label}</Label>}
      <div
        className={cn(inputClass, "flex items-center cursor-text w-full")}
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        <InputIcon
          position="start"
          icon={leadingIcon}
          className={leadingIconClassName}
        />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          className={cn(
            "bg-transparent focus:ring-0 focus:outline-none block placeholder:text-muted w-full",
            {
              "pl-4": Boolean(leadingIcon),
            }
          )}
        />
        <InputIcon
          position="end"
          icon={trailingIcon}
          className={trailingIconClassName}
        />
        {children}
      </div>
    </>
  );
};

const CurrencyField = (props: NumberFieldProps) => {
  return (
    <NumberField
      {...props}
      formatOptions={{
        ...props.formatOptions,
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }}
    />
  );
};

const PercentField = (props: NumberFieldProps) => {
  return (
    <NumberField
      {...props}
      formatOptions={{
        ...props.formatOptions,
        style: "percent",
        maximumFractionDigits: 3,
      }}
    />
  );
};

export { TextField, CurrencyField, PercentField, SearchField };
