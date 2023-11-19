import { safeParse } from "@/lib/utils";
import { Signal, effect, signal } from "@preact/signals";
import { Type } from "arktype";
import { mapValues } from "lodash-es";

export function createStore<S extends Type<object>>({
  schema,
  initial,
}: {
  schema: S;
  initial?: S["infer"];
}) {
  type SignalMap = { [K in keyof S["infer"]]-?: Signal<S["infer"][K]> };

  const definition = schema.definition as Record<keyof SignalMap, never>;

  const signalMap = mapValues(definition, (_, key) => {
    const initialValue = initial ? initial[key as never] : undefined;

    const localValue = safeParse(localStorage.getItem(key));

    const initValue = localValue ?? initialValue;

    return signal(initValue);
  }) as SignalMap;

  for (const signalKey in signalMap) {
    const signal = signalMap[signalKey as never] as Signal;

    effect(() => {
      localStorage.setItem(signalKey, signal.toJSON());
    });
  }

  return signalMap;
}
