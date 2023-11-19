import type { ReactNode } from "react";
import React, { FC, Suspense, useRef, useEffect } from "react";

type OffscreenMode = "visible" | "hidden";

interface OffscreenProps {
  mode: OffscreenMode;
  children: ReactNode;
}

export const Offscreen = (props: OffscreenProps) => {
  const { mode, children } = props;
  return (
    <Suspense>
      <Repeater mode={mode}>{children}</Repeater>
    </Suspense>
  );
};

export const Repeater = (props: OffscreenProps) => {
  // props
  const { mode, children } = props;
  // refs
  const resolveRef = useRef<() => void>();
  // methods
  const resolvePromise = () => {
    if (typeof resolveRef.current === "function") {
      resolveRef.current();
      resolveRef.current = void 0;
    }
  };
  resolvePromise();
  // effect
  useEffect(() => resolvePromise, []);
  if (mode === "hidden") {
    throw new Promise<void>((resolve) => (resolveRef.current = resolve));
  }
  return <>{children}</>;
};
