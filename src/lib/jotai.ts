/* eslint-disable @typescript-eslint/no-explicit-any */
import { Getter, WritableAtom, atom, useAtom } from "jotai";
import { atomWithDefault, loadable } from "jotai/utils";
import { Loadable } from "jotai/vanilla/utils/loadable";

type Updater<T> = T | ((prev: T) => T);

export type LoadableWritableAtom<T> = WritableAtom<
  Loadable<T>,
  [Updater<Promise<T>>],
  void
>;
export const writableAtomWithLoadable = <T>(
  fn: (get: Getter) => Promise<T>
): LoadableWritableAtom<T> => {
  const asyncAtom = atomWithDefault(fn);
  const loadableAtom = loadable(asyncAtom);

  const finalAtom: WritableAtom<
    Loadable<T>,
    [Updater<Promise<T>>],
    void
  > = atom(
    (get) => get(loadableAtom),
    (_, set, update: Updater<Promise<T>>) => {
      if (typeof update === "function") {
        set(asyncAtom, (promise) => promise.then(update as any));
      } else {
        set(asyncAtom, update);
      }
    }
  );

  return finalAtom;
};

export function useLoadableWritableAtom<T>(atom: LoadableWritableAtom<T>) {
  const [value, setValue] = useAtom(atom);
  const loading = value.state === "loading";
  const hasError = value.state === "hasError";
  const data = value.state === "hasData" ? value.data : undefined;

  const result = { data, loading, hasError };
  return [result, setValue] as [typeof result, typeof setValue];
}
