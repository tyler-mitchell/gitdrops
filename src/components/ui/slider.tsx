import * as React from "react";
import {
  Label,
  Slider as SliderComponent,
  SliderOutput,
  SliderProps,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";

import { cn } from "@/lib/utils";

const Slider = ({
  className,
  label = "Label",
  outputLabel,
  ...props
}: SliderProps<number> & { outputLabel?: React.ReactNode }) => (
  <SliderComponent
    className={cn(
      "relative flex w-full touch-none select-none items-center pt-5",
      className
    )}
    {...props}>
    {label && <Label className="-top-3 absolute">{label}</Label>}
    <div className="absolute h-full right-0 -top-3 flex gap-2">
      <SliderOutput />

      {outputLabel}
    </div>
    <SliderTrack className="relative py-1 w-full grow  rounded-full bg-secondary">
      <SliderThumb className="mx-2 block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderTrack>
  </SliderComponent>
);

export { Slider };
