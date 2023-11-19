import React, { ElementRef, forwardRef, useRef } from "react";
import {
  VirtualItem as VirtualItemType,
  Virtualizer as VirtualizerType,
} from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { O } from "ts-toolbelt";
import { Slot } from "@radix-ui/react-slot";
import { mergeRefs } from "react-merge-refs";

type VirtualizerContextType = {
  virtualizer: VirtualizerType<any, any>;
  scrollRef: React.RefObject<HTMLElement>;
  width?: React.CSSProperties["width"];
};

export const VirtualListContext = React.createContext<VirtualizerContextType>({
  virtualizer: {} as never,
  scrollRef: null as never,
});

const VirtualizerProvider = ({
  children,
  ...ctx
}: VirtualizerContextType & { children?: React.ReactNode }) => {
  return (
    <VirtualListContext.Provider value={ctx}>
      {children}
    </VirtualListContext.Provider>
  );
};

type VirtualScrollAreaProps = {
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
  height?: React.CSSProperties["height"];
  width?: React.CSSProperties["width"];
  overflow?: React.CSSProperties["overflow"];
};

const VirtualScrollArea = React.forwardRef<any, VirtualScrollAreaProps>(
  (
    {
      className,
      asChild,
      children,
      height = "200px",
      width: widthProp,
      overflow = "auto",
    },
    forwardedRef
  ) => {
    const Component = asChild ? Slot : "div";
    const { scrollRef, width } = React.useContext(VirtualListContext);

    return (
      <Component
        ref={mergeRefs([scrollRef, forwardedRef])}
        className={className}
        style={{
          height,
          width: widthProp ?? width ?? "100%",
          overflow,
        }}
      >
        {children}
      </Component>
    );
  }
);

const VirtualViewport = ({
  className,
  asChild,
  children,
}: {
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
}) => {
  const Component = asChild ? Slot : "div";
  const { virtualizer } = React.useContext(VirtualListContext);
  return (
    <Component
      className={className}
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      }}
    >
      {children}
    </Component>
  );
};

const VirtualItem = React.memo(
  forwardRef<
    ElementRef<"div">,
    {
      virtualItem: VirtualItemType;
      dynamicHeight?: boolean;
      asChild?: boolean;
      children?: React.ReactNode;
      className?: string;
      style?: React.CSSProperties;
    }
  >(
    (
      {
        virtualItem,
        dynamicHeight,
        className,
        style,
        asChild,
        children,
        ...props
      },
      forwardedRef
    ) => {
      const { virtualizer, width } = React.useContext(VirtualListContext);

      const { index, size, start } = virtualItem;

      const Component = asChild ? Slot : "div";

      return (
        <Component
          data-index={index}
          ref={
            dynamicHeight
              ? mergeRefs([forwardedRef, virtualizer.measureElement])
              : forwardedRef
          }
          className={cn("flex items-center", "py-1", className)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: `${size}px`,
            width: width ?? "100%",
            transform: `translateY(${start}px)`,
            ...style,
          }}
          {...props}
        >
          {children}
        </Component>
      );
    }
  )
);

export const Virtualizer = Object.assign(VirtualizerProvider, {
  ScrollArea: VirtualScrollArea,
  Viewport: VirtualViewport,
  Item: VirtualItem,
});
