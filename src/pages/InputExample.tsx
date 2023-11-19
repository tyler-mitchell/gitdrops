/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { PayloadAction, createLocalState } from "../lib/createLocalState";
import {
  CurrencyField,
  NumberFieldProps,
  PercentField,
} from "../components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import React, { ChangeEvent, useEffect, useMemo } from "react";
import {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormStateReturn,
  useForm,
  FieldPath,
  UseFormReturn,
} from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Slider } from "../components/ui/slider";
import { morph, scope, type } from "arktype";
import { ZodNumber, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { classed } from "@tw-classed/react";
import { Call, Tuples, Numbers, Pipe, Unions, ComposeLeft } from "hotscript";
import { collect, map } from "@effect/data/ReadonlyRecord";
import { ReducerMap } from "@/src/lib/createLocalState";
import { useDeepCompareEffect } from "use-deep-compare";
import { MathfieldElement } from "mathlive";

type RenderProps<TName extends string> = {
  field: ControllerRenderProps<FieldValues, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<FieldValues>;
};

const Field = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  description,
  label,
  control,
  className,
  children,
  hidden,
}: {
  hidden?: boolean;
  label?: string;
  description?: string;
  name: TName;
  className?: string;
  control: Control<TFieldValues>;
  children:
    | React.ReactNode
    | ((renderProps: RenderProps<TName>) => React.ReactNode);
}) => {
  const child = (renderProps: RenderProps<TName>) => {
    const { field } = renderProps;
    const c =
      typeof children === "function"
        ? children(renderProps)
        : React.cloneElement(children, field);

    return c;
  };

  return hidden ? null : (
    <FormField
      control={control}
      name={name}
      render={(renderProps) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>{child(renderProps as never)}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const singleTaxBracket = {
  TaxFilingStatus: "Single",
  standardDeduction: 13850,
  taxBrackets: [
    { rate: 10, startAmount: 0 },
    { rate: 12, startAmount: 11000 },
    { rate: 22, startAmount: 44725 },
    { rate: 24, startAmount: 95375 },
    { rate: 32, startAmount: 182100 },
    { rate: 35, startAmount: 231250 },
    { rate: 37, startAmount: 578125 },
  ],
};

function calculateFederalTax(baseSalary: number) {
  const taxableIncome = baseSalary - singleTaxBracket.standardDeduction;
  let applicableBracket = null;

  for (const bracket of singleTaxBracket.taxBrackets) {
    if (taxableIncome >= bracket.startAmount) {
      applicableBracket = bracket;
    } else {
      break;
    }
  }

  if (!applicableBracket) {
    return { rate: 0, amount: 0 };
  }

  const taxableAmountInBracket = Math.min(
    taxableIncome - applicableBracket.startAmount,
    applicableBracket.startAmount
  );
  const taxAmount = taxableAmountInBracket * (applicableBracket.rate / 100);

  return { rate: applicableBracket.rate / 100, amount: taxAmount };
}

// const formSchema = scope({
//   basePay: "number",
//   monthlyRent1: "number",
//   monthlyRent2: "number",
//   totalMonthlyRent: [
//     { m1: "monthlyRent1", m2: "monthlyRent2" },
//     "=>",
//     ({ m1, m2 }) => m1 + m2,
//   ],
//   yearlyRent: "number",
//   stateIncomeTaxRate: "number",
//   stateIncomeTax: "number",
//   totalBase: "number",
//   yearlyRSU: "number",
//   fourYearRSU: "number",
//   valuation: "number",
//   salaryWithEquity: "number",
//   additionalMonthlyBenefits: "number",
//   equityPercent: "number",
//   yearlyEquity: "number",
//   equityValue: "number",
//   additionalYearlyBenefits: "number",
//   rsuGrowth: "number",
//   netRSU: "number",
// });

export type CreateProxyCtxOptions<
  TState extends object,
  TReducerMap extends ReducerMap<TState>
> = TReducerMap;

type VariableFieldData<T> = {
  label: string;
  id: string;
  defaultValue?: number;
  type: "currency" | "percent";
  balanceType?: "equity" | "tax" | "expense" | "benefit";
  step?: number;
  min?: number;
  max?: number;
  formatOptions?: Intl.NumberFormatOptions;
  schema?: z.ZodNumber;
  field?:
    | { fieldType: "input" }
    | { fieldType: "select"; options: { label: string; value: number }[] }
    | { fieldType: "slider" };
  formula?: (
    state: { [K in keyof T]: number },
    data: Record<keyof T, VariableFieldData<unknown>>
  ) => number;
};

type DataDefinition<T, TResolved extends boolean = true> = {
  [K in keyof T]: TResolved extends true
    ? VariableFieldData<T>
    : Omit<VariableFieldData<T>, "id">;
};

function trackPropertyAccess<T extends object>() {
  const accessedProperties: (keyof T)[] = [];
  return {
    getProxy: new Proxy({} as T, {
      get(_, p: string | symbol) {
        accessedProperties.push(p as keyof T);
        return 0; // Returning a dummy value, since we're only interested in property access
      },
    }),
    accessedProperties,
  };
}

function defineVariableData<T>(data: DataDefinition<T, false>) {
  const dataFieldMap = map(data, (v, key) => ({
    id: key as keyof T,
    min: v.type === "currency" ? 0 : -1,
    max: v.type === "percent" ? 3 : undefined,
    ...v,
  })) as Record<keyof T, VariableFieldData<T>>;

  const dataFieldList = collect(
    dataFieldMap,
    (_, value) => value as VariableFieldData<T>
  );

  const defaultFieldValues = map(dataFieldMap, (v) => v.defaultValue ?? 0);

  const formSchema = z.object(
    collect(data, (key, { schema, min, max, defaultValue }) => {
      return (
        schema ??
        z
          .number()
          .min(min || -Infinity)
          .max(max || Infinity)
          .default(defaultValue ?? 0)
      );
    }) as Record<keyof T, ZodNumber>
  );

  const fieldDependencies = new Map<keyof T, Set<keyof T>>();
  const fieldDependents = new Map<keyof T, Set<keyof T>>();

  for (const key in data) {
    const fieldData = data[key];
    // if (fieldData.formula) {
    const { getProxy, accessedProperties } = trackPropertyAccess<T>();
    fieldData.formula?.(getProxy as any, dataFieldMap as any);

    console.log("KEEEY", key);
    fieldDependents.set(key, new Set([...accessedProperties]));

    accessedProperties.forEach((dep) => {
      // if (fieldDependencies.has(dep)) return;
      if (fieldDependencies.has(dep)) {
        const deps = fieldDependencies.get(dep)!;
        deps.add(key);
      } else {
        fieldDependencies.set(dep, new Set([key]));
      }
    });
  }

  return {
    dataFieldMap,
    dataFieldList,
    defaultFieldValues,
    formSchema,
    fieldDependencies,
    fieldDependents,
  };
}

const {
  dataFieldList,
  dataFieldMap,
  formSchema,
  defaultFieldValues,
  fieldDependencies,
  fieldDependents,
} = defineVariableData({
  // Base
  basePay: {
    label: "Base pay",
    type: "currency",
    balanceType: "benefit",
    field: { fieldType: "input" },
  },

  totalBase: {
    label: "Total base",
    type: "currency",
    balanceType: "benefit",
    formula: (v) => {
      console.log("Executing formula for totalBase");

      return (
        v.basePay - v.yearlyRent - v.totalTaxes + v.additionalYearlyBenefits
      );
    },
  },

  // Rent
  monthlyRent1: {
    label: "Monthly rent1",
    type: "currency",
    balanceType: "benefit",
    field: { fieldType: "input" },
  },
  monthlyRent2: {
    label: "Monthly rent2",
    type: "currency",
    balanceType: "benefit",
    field: { fieldType: "input" },
  },
  totalMonthlyRent: {
    label: "Total monthly rent",
    type: "currency",
    balanceType: "benefit",
    formula: (v) => v.monthlyRent1 + v.monthlyRent2,
  },
  yearlyRent: {
    label: "Yearly rent",
    type: "currency",
    balanceType: "benefit",
    formula: (v) => v.totalMonthlyRent * 12,
  },

  // State Income Tax
  stateIncomeTaxRate: {
    label: "State Income Tax Rate",
    type: "percent",
    balanceType: "tax",
    field: { fieldType: "input" },
  },
  stateIncomeTax: {
    label: "State Income Tax",
    type: "currency",
    balanceType: "tax",
    formula: (v) => v.stateIncomeTaxRate * v.basePay,
  },

  // Federal Income Tax
  federalIncomeTaxRate: {
    label: "Federal Income Tax Rate",
    type: "percent",
    balanceType: "tax",
    formula: (v) => calculateFederalTax(v.basePay).rate,
  },
  federalIncomeTax: {
    label: "Federal Income Tax",
    type: "currency",
    balanceType: "tax",
    formula: (v) => calculateFederalTax(v.basePay).amount,
  },

  // Social Security Tax
  socialSecurityTaxRate: {
    label: "Social Security Tax Rate",
    type: "percent",
    balanceType: "tax",
    defaultValue: 0.048,
  },
  socialSecurityTax: {
    label: "Social Security Tax",
    type: "currency",
    balanceType: "tax",
    formula: (v) => v.basePay * v.socialSecurityTaxRate,
  },

  // Medicare Tax
  medicareTaxRate: {
    label: "Medicare Tax Rate",
    type: "percent",
    balanceType: "tax",
    defaultValue: 0.0145,
  },
  medicareTax: {
    label: "Medicare Tax",
    type: "currency",
    balanceType: "tax",
    formula: (v) => v.basePay * v.medicareTaxRate,
  },

  // Taxes
  totalTaxRate: {
    label: "Tax Rate",
    type: "percent",
    balanceType: "expense",
    formula: (v, data) => {
      return collect(data, (key, { balanceType, type }) =>
        balanceType === "tax" && type === "percent" ? v[key] : 0
      ).reduce((acc, cur) => (acc += cur), 0);
    },
  },
  totalTaxes: {
    label: "Taxes",
    type: "currency",
    balanceType: "expense",
    formula: (v, data) => {
      return collect(data, (key, { balanceType, type }) =>
        balanceType === "tax" && type === "currency" ? v[key] : 0
      ).reduce((acc, cur) => (acc += cur), 0);
    },
  },

  fourYearRSU: {
    label: "Four year rsu",
    type: "currency",
    balanceType: "benefit",
  },
  yearlyRSU: {
    label: "Yearly rsu",
    type: "currency",
    balanceType: "equity",
    formula: (v) =>
      Math.max(0, (v.fourYearRSU + v.rsuGrowth * v.fourYearRSU) / 4),
  },
  valuation: {
    label: "Valuation",
    type: "currency",
    field: { fieldType: "slider" },
  },
  salaryWithEquity: {
    label: "Salary with equity",
    type: "currency",
    balanceType: "benefit",
    formula: (v) => v.totalBase + v.yearlyRSU + v.yearlyEquity,
  },

  additionalMonthlyBenefits: {
    label: "Additional monthly benefits",
    type: "currency",
    balanceType: "benefit",
  },

  // Equity

  equityPercent: {
    label: "Equity percent",
    type: "currency",
    balanceType: "benefit",
  },

  yearlyEquity: {
    label: "Yearly equity",
    type: "currency",
    balanceType: "equity",
    formula: (v) => v.equityValue / 4,
  },

  equityValue: {
    label: "Equity value",
    type: "currency",
    formula: (v) => v.valuation * v.equityPercent,
  },

  additionalYearlyBenefits: {
    label: "Additional yearly benefits",
    type: "currency",
    balanceType: "benefit",
  },

  rsuGrowth: {
    label: "RSU growth",
    type: "percent",
    defaultValue: -0.3,
    min: -1,
    field: {
      fieldType: "slider",
    },
  },
  netRSU: {
    label: "Net RSU",
    type: "currency",
    balanceType: "benefit",
    formula: (v) => v.rsuGrowth * v.netRSU,
  },
});

type FormSchema = z.infer<typeof formSchema>;

type Tax = {
  label: string;
  value: number;
  percentage: number;
};

function VariableField({
  form,
  name,
}: {
  name: keyof FormSchema;
  form: UseFormReturn<FormSchema>;
}) {
  const { label, type = "c", field, max, min, step } = dataFieldMap[name];
  const { fieldType = "input" } = field ?? {};

  const formFields = { name, control: form.control };

  if (fieldType === "input" && type === "currency") {
    return (
      <Field label={label} {...formFields}>
        <CurrencyField />
      </Field>
    );
  }

  if (fieldType === "input" && type === "percent") {
    return (
      <Field label={label} {...formFields}>
        <PercentField />
      </Field>
    );
  }

  if (fieldType === "slider") {
    return (
      <Field {...formFields}>
        {({ field }) => (
          <Slider
            label={label}
            formatOptions={
              type === "percent"
                ? {
                    style: "percent",
                    maximumFractionDigits: 1,
                  }
                : currencyFormatOption
            }
            maxValue={max}
            minValue={min}
            defaultValue={field.value}
            step={step}
            onChange={(v) => {
              if (!isNaN(v) && v) {
                field.onChange(v);
              }
            }}
          />
        )}
      </Field>
    );
  }

  return null;
}

const Breakdown = ({
  title,
  defaultValues,
  additionalTaxes = [],
  description,
  additionalMonthlyBenefitsList = [],
}: {
  title: string;
  description?: string;
  defaultValues: FormSchema;
  additionalMonthlyBenefitsList?: { label: string; value: number }[];
  additionalTaxes?: Omit<Tax, "value">[];
}) => {
  const form = useForm<FormSchema>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultFieldValues,
      ...defaultValues,
      // additionalMonthlyBenefits: additionalMonthlyBenefitsList.reduce(
      //   (acc, cur) => acc + cur.value,
      //   0
      // ),
    },
  });

  const { watch, setValue, getValues, control } = form;

  const watchedValues = watch();

  const {
    yearlyRent,
    yearlyRSU,

    totalBase,
    equityValue,
    yearlyEquity,
    additionalYearlyBenefits,
    salaryWithEquity,
    totalTaxes,
    totalTaxRate,
  } = watchedValues;

  console.log({ fieldDependencies, fieldDependents });
  const taxes = useMemo(() => {
    return dataFieldList
      .filter((e) => e.balanceType === "tax" && e.type !== "percent")
      .map(
        (e) =>
          ({
            label: e.label,
            percentage: watchedValues[`${e.id}Rate`] * 100,
            value: watchedValues[e.id],
          } as Tax)
      );
  }, [watchedValues]);

  useDeepCompareEffect(() => {
    fieldDependencies.forEach((e) => {
      e.forEach((dep) => {
        const evaluatedDep = dataFieldMap[dep].formula?.(
          getValues() as any,
          dataFieldMap
        );
        setValue(dep, evaluatedDep);
      });
    });
  }, [watchedValues]);

  React.useEffect(() => {
    const subscription = watch((fieldValues, { name, type }) => {
      if (type !== "change") return undefined;

      const newValue = fieldValues[name];

      setValue(name, newValue);

      fieldDependencies.get(name)?.forEach((dep) => {
        console.log("DEP", dep);
        const evaluatedDep = dataFieldMap[dep].formula?.(
          fieldValues as any,
          dataFieldMap
        );
        setValue(dep, evaluatedDep);
      });

      console.log({
        name,
        type,
        new: fieldValues[name],

        fieldValues,
      });
    });
    return () => subscription.unsubscribe();
  }, [setValue, watch]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  console.log({ totalBase });
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>

        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grow">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-10 justify-stretch grow h-full"
          >
            <Section title="Base">
              <FormRow>
                <VariableField name="basePay" form={form} />
                <Field
                  name="stateIncomeTaxRate"
                  label="State Income Tax"
                  control={control}
                >
                  <PercentField />
                </Field>
              </FormRow>
              <FormRow>
                <Field
                  name="monthlyRent1"
                  label="Monthly Rent"
                  control={control}
                >
                  <CurrencyField />
                </Field>

                <Field
                  name="monthlyRent2"
                  label="Monthly Rent 2"
                  control={control}
                >
                  <CurrencyField />
                </Field>
              </FormRow>

              <StatSection>
                <Statistic
                  title="Rent"
                  value={yearlyRent}
                  sign="negative"
                  variant="subtotal"
                />

                <Statistic
                  variant="subtotal"
                  title="Taxes"
                  sign="negative"
                  value={totalTaxes}
                  valuePrefix={
                    <div className="text-muted">
                      {percentFormat(totalTaxRate)}
                    </div>
                  }
                >
                  {taxes
                    .sort((a, b) => b.value - a.value)
                    .map(({ label, value, percentage }) => (
                      <Statistic
                        variant="item"
                        title={label}
                        value={value}
                        valuePrefix={percentFormat(percentage / 100)}
                        sign="negative"
                      />
                    ))}
                </Statistic>

                <Statistic
                  title="Additional Benefits"
                  value={additionalYearlyBenefits}
                  sign="positive"
                  variant="subtotal"
                >
                  <ul className="w-full">
                    {additionalMonthlyBenefitsList.map(({ label, value }) => {
                      return (
                        <li className="w-full">
                          <Statistic
                            title={label}
                            value={value * 12}
                            variant="item"
                            sign="positive"
                            // valueLabel="/ month"
                          />
                        </li>
                      );
                    })}
                  </ul>
                </Statistic>

                <Statistic
                  title="Total Base"
                  value={totalBase}
                  variant="total"
                />
              </StatSection>
            </Section>

            <Section title="Equity">
              <Field
                hidden={defaultValues.fourYearRSU === undefined}
                name="fourYearRSU"
                label="RSU"
                control={control}
              >
                <CurrencyField />
              </Field>
              <Field
                hidden={defaultValues.fourYearRSU === undefined}
                name="rsuGrowth"
                className="mt-6"
                control={control}
              >
                {({ field }) => (
                  <Slider
                    label={"RSU Growth"}
                    formatOptions={{
                      style: "percent",
                      maximumFractionDigits: 1,
                    }}
                    maxValue={3}
                    minValue={-1}
                    defaultValue={field.value}
                    step={0.01}
                    onChange={(v) => {
                      console.log("V", v);
                      if (!isNaN(v) && v) {
                        field.onChange(v);
                      }
                    }}
                  />
                )}
              </Field>
              <Field
                hidden={defaultValues.valuation === undefined}
                name="equityPercent"
                label="% Equity"
                control={control}
              >
                <PercentField />
              </Field>
              <Field
                hidden={defaultValues.valuation === undefined}
                name="valuation"
                className="mt-6"
                control={control}
              >
                {({ field }) => (
                  <Slider
                    label={"Valuation"}
                    outputLabel={
                      <div className="text-emerald-500">
                        / {currencyFormat(equityValue, compactCurrencyFormat)}
                      </div>
                    }
                    formatOptions={compactCurrencyFormat}
                    maxValue={2_000_000_000}
                    defaultValue={field.value}
                    step={1_000_000}
                    onChange={(v) => {
                      field.onChange(v);
                    }}
                  />
                )}
              </Field>

              <StatSection>
                {defaultValues.fourYearRSU ? (
                  <Statistic
                    title="Yearly RSU"
                    value={yearlyRSU}
                    sign="positive"
                    variant="total"
                  />
                ) : null}
                {defaultValues.valuation ? (
                  <Statistic
                    title="Yearly Equity"
                    value={yearlyEquity}
                    sign="positive"
                    variant="total"
                  />
                ) : null}
              </StatSection>
            </Section>
            <div className="mt-auto grow flex flex-col justify-end">
              <div className=" bg-muted/30 rounded-sm -mx-2 p-2">
                <Statistic
                  title="Total Yearly Comp"
                  value={salaryWithEquity}
                  variant="total"
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const compactCurrencyFormat: Intl.NumberFormatOptions = {
  style: "currency",
  maximumFractionDigits: 0,
  currency: "USD",
  notation: "compact",
  compactDisplay: "short",
  maximumSignificantDigits: 3,
};

const SectionElement = classed("div", "flex flex-col gap-2 w-full grow");

const Section = ({
  children,
  title,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <SectionElement>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </SectionElement>
  );
};

const StatSection = classed(
  "div",
  "flex flex-col border-y border-muted/30  empty:hidden first:mt-0 mt-6",
  "divide-y",
  "divide-muted/30"
);

const FormRow = classed("div", "flex gap-4");

const StatTitle = classed("p", "font-normal leading-none", {
  variants: {
    variant: {
      subtotal: "text-base text-muted-foreground",
      total: "text-lg",
      item: "text-xs text-muted font-normal",
    },
  },
});

const StatValue = classed(
  "div",
  "ml-auto font-medium flex gap-2 items-center font-mono",
  {
    defaultVariants: {
      sign: "standard",
    },
    variants: {
      variant: {
        subtotal: "text-lg",
        total: "text-xl",
        item: "text-sm text-muted !text-opacity-30",
      },
      sign: {
        negative: "text-red-500",
        positive: "text-emerald-500",
        zero: "text-muted",
        standard: "text-primary",
      },
    },
  }
);

function Statistic({
  title,

  value,
  subtitle,
  sign: signProp,
  variant,
  valuePrefix: valuePrefix,
  valuePostfix,
  children,
}: {
  title: React.ReactNode;
  variant: "total" | "subtotal" | "item";
  subtitle?: React.ReactNode;
  value: React.ReactNode;
  sign?: "negative" | "positive";
  children?: React.ReactNode;
  valuePrefix?: React.ReactNode;
  valuePostfix?: React.ReactNode;
}) {
  function getSign(): {
    sign?: "negative" | "positive" | "zero";
    signUnit?: string;
  } {
    const sign = signProp;
    if (value === 0) return { sign: "zero" };
    if (signProp === "negative") return { sign, signUnit: "-" };
    if (signProp === "positive") return { sign, signUnit: "+" };
    return { signUnit: undefined };
  }

  const { sign, signUnit } = getSign();

  return (
    <div className="flex flex-col divide-y divide-muted/30">
      <div className="flex items-center py-2">
        <div className="space-y-1">
          <StatTitle variant={variant}>{title}</StatTitle>
          {subtitle && (
            <p className="text-base text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <StatValue
          className="min-w-[28%] flex justify-between"
          sign={sign}
          variant={variant}
        >
          <div className="text-xs text-muted/75 text-left empty:invisible">
            {valuePrefix}
          </div>
          <div />
          {/* {signUnit} */}
          <span className="text-right">{currencyFormat(value)}</span>
          {valuePostfix && (
            <div className="text-xs opacity-75 text-right">{valuePostfix}</div>
          )}
        </StatValue>
      </div>
      {children}
    </div>
  );
}

function percentFormat(v: number, format?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
    ...format,
  }).format(v);
}

const currencyFormatOption = {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
};

function currencyFormat(v: number, format?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", {
    ...currencyFormatOption,
    ...format,
  }).format(v);
}

export const InputExamplePage = () => {
  return (
    <div className="flex gap-4 flex-nowrap">
      <Breakdown
        title="Carta Inc"
        description="San Fransisco"
        additionalMonthlyBenefitsList={[
          { label: "Cell", value: 100 },
          { label: "Internet", value: 100 },
          { label: "401k", value: 5_000 / 12 },
        ]}
        additionalTaxes={[
          { percentage: 0.61, label: "State Disability Insurance Tax" },
        ]}
        defaultValues={{
          basePay: 190_000,
          monthlyRent1: 2_000,
          monthlyRent2: 3_000,
          stateIncomeTaxRate: 0.092,
          fourYearRSU: 360_000,
          rsuGrowth: -0.3,
        }}
      />

      <Breakdown
        title="AnyTeam"
        description="Remote Texas"
        defaultValues={{
          basePay: 150_000,
          monthlyRent1: 2_000,
          valuation: 0,
          monthlyRent2: 0,
          stateIncomeTaxRate: 0,
          additionalMonthlyBenefits: 0,
          equityPercent: 0.008,
        }}
      />
    </div>
  );
};

const SectionTitle = classed(
  "h1",
  "font-semibold text-2xl pb-4 mb-4 border-b border-primary/5",
  {
    variants: {
      variant: {
        subtitle: "text-lg",
      },
    },
  }
);
