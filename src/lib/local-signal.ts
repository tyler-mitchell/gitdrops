import { effect, signal } from "@preact/signals";
import { safeParse } from "./utils";

export function localSignal<V, K extends string = string>(
  key: K,
  initialValue: V
) {
  const localValue = safeParse(localStorage.getItem(key));

  const sig = signal(localValue ?? initialValue);

  effect(() => {
    return localStorage.setItem(key, JSON.stringify(sig.value));
  });

  return sig;
}
