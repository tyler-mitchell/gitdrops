/* eslint-disable @typescript-eslint/ban-types */
// types/tw-classed-react.d.ts
import { AnyComponent, JSX } from "react";

declare module "@tw-classed/react" {
  const $$ClassedProps: unique symbol;
  const $$ClassedVariants: unique symbol;

  interface ClassedComponentType<
    Type extends keyof JSX.IntrinsicElements | AnyComponent,
    Props extends {} = {},
    TComposedVariants extends {} = {}
  > extends ForwardRefComponent<Type, Props> {
    [$$ClassedProps]: Props;
    [$$ClassedVariants]: TComposedVariants;
  }

  // Export other types or values as needed
}
