/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect } from "react";
import { map as mapArray, collect } from "@effect/data/ReadonlyRecord";
import { map as mapRecord } from "@effect/data/ReadonlyRecord";
import {
  ScopeProvider,
  createScope,
  molecule,
  useMolecule,
} from "jotai-molecules";
import { Atom, atom, useAtom, useAtomValue, useStore } from "jotai";
import { selectAtom } from "jotai/utils";
import { DevTools, useAtomsDevtools } from "jotai-devtools";
import deepEqual from "fast-deep-equal";

import {
  Patch,
  produce,
  UnFreeze,
  enableStandardPatches,
  DraftableState,
  Producer,
  PatchCallback,
  applyPatches,
  freeze,
} from "structurajs";
import { type Molecule } from "jotai-molecules/dist/molecule";

enableStandardPatches(true);

type Simplify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

type MoleculeValue<TMolecule> = TMolecule extends Molecule<infer G> ? G : never;

type MoleculePropKey<TMolecule> = keyof MoleculeValue<TMolecule>;

export type PayloadAction<P> = {
  type: string;
  payload: P;
};

export type PayloadActionDispatch<P = void> = void extends P
  ? () => void
  : (payload: P) => void;

export type ReducerWithoutPayload<S> = (state: S) => S;

export type PayloadActionReducer<TState, P = void> = (
  state: UnFreeze<TState>,
  action: PayloadAction<P>
) => void | UnFreeze<TState>;

type DefaultDispatchMethods = {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

export interface ReducerMap<State> {
  [
    actionType: Exclude<string, keyof DefaultDispatchMethods>
  ]: PayloadActionReducer<State, any>;
}

export type ReducerDispatcherMap<TReducerMap extends ReducerMap<any>> =
  Simplify<{
    [T in keyof TReducerMap]: TReducerMap[T] extends ReducerWithoutPayload<any>
      ? PayloadActionDispatch<void>
      : TReducerMap[T] extends PayloadActionReducer<any, infer P>
      ? PayloadActionDispatch<P>
      : never;
  }>;

export type Dispatcher<TReducerMap extends ReducerMap<any>> =
  ReducerDispatcherMap<TReducerMap> & DefaultDispatchMethods;

type SubscriberName<TState> = Extract<keyof TState, string>;

type SubscriberMap<TState> = {
  [subscriberName: string]: SubscriberConfig<TState>[SubscriberName<TState>];
};

type SubscriberConfig<TState> = {
  [K in SubscriberName<TState>]: {
    listenTo: K;
    when?: (value: TState[K], props: { state: TState }) => boolean;
    onChange: (
      value: TState[K],
      props: { state: UnFreeze<TState>; subscriberName: K }
    ) => void; // Adjust the dispatch type as necessary
  };
};

type ProducerType = "reducer" | "subscriber";

type HistoryItem = { producerType: ProducerType; undo: Patch[]; redo: Patch[] };

type HistoryMap = Map<number, HistoryItem>;

type HistoryState<T> = {
  history: HistoryMap;
  currentIndex: number;
  present: T;
};

type CreateProxyReturn<
  TDefinedState extends DefinedState,
  TDispatcher extends Dispatcher<ReducerMap<object>>,
  TLocalState
> = {
  // reducers: TReducerMap;
  Provider(
    props: Partial<TDefinedState> & { children: React.ReactNode }
  ): JSX.Element;
  // useDispatcher(): Dispatcher<TReducerMap>;
  useDispatcher(): TDispatcher;
  useContext(): [TLocalState, TDispatcher];
  useContextValue(): TLocalState;
};

type DefinedState<T extends object = object> = {
  [K in keyof T as string]: T[K];
};

type A = {
  a: "";
  b: "";
};

type DerivedStateMap<TDefinedState extends DefinedState> = Omit<
  Record<string, (state: TDefinedState) => unknown>,
  keyof A
>;

type LocalState<
  TDefinedState extends DefinedState,
  TDerivedContextMap extends DerivedStateMap<TDefinedState> | undefined
> = Simplify<
  TDefinedState & {
    [K in keyof TDerivedContextMap]: ReturnType<
      Extract<TDerivedContextMap[K], (...args: any) => any>
    >;
  }
>;

export interface CreateProxyCtxOptions<
  TState extends object,
  TDefinedState extends DefinedState<TState>,
  TDerivedStateMap extends DerivedStateMap<TDefinedState>,
  TReducerMap extends ReducerMap<TDefinedState>,
  TSubscribers extends SubscriberMap<TDefinedState>
> {
  initial: TDefinedState;
  derived?: TDerivedStateMap;
  reducers: TReducerMap;
  subscribers?: TSubscribers;
  name?: string;
}

export function createLocalState<
  TState extends object,
  TDefinedState extends DefinedState<TState>,
  TDerivedStateMap extends DerivedStateMap<TDefinedState>,
  TReducerMap extends ReducerMap<TDefinedState>,
  TSubscribers extends SubscriberMap<TDefinedState>,
  TDispatcher extends Dispatcher<TReducerMap> = Dispatcher<TReducerMap>,
  THistory extends HistoryState<TDefinedState> = HistoryState<TDefinedState>,
  TLocalState extends LocalState<TDefinedState, TDerivedStateMap> = LocalState<
    TDefinedState,
    TDerivedStateMap
  >
>(
  options: CreateProxyCtxOptions<
    TState,
    TDefinedState,
    TDerivedStateMap,
    TReducerMap,
    TSubscribers
  >
): CreateProxyReturn<TDefinedState, TDispatcher, TLocalState> {
  const { initial, derived, reducers, subscribers: subscriberMap } = options;

  type TReturn = CreateProxyReturn<TDefinedState, TDispatcher, TLocalState>;

  const CtxScope = createScope(initial);

  const CtxMolecule = molecule((_, getScope) => {
    const ctxScope = getScope(CtxScope) as any as TDefinedState;

    const baseHistoryAtom = atom({
      history: new Map([]),
      currentIndex: -1,
      present: ctxScope,
    } as THistory);

    const baseStateAtom = selectAtom(
      baseHistoryAtom,
      (a) => a.present,
      deepEqual
    );

    const stateAtom = atom(
      (get) => {
        const state = get(baseStateAtom) as TDefinedState;
        return mergeState({ state, derived });
      },
      (get, set, newValue: TDefinedState) => {
        set(baseHistoryAtom, { ...get(baseHistoryAtom), present: newValue });
      }
    );

    const historyAtom = atom(
      (get) => {
        return { ...get(baseHistoryAtom), present: get(stateAtom) };
      },
      (_get, set, newValue: THistory) => {
        set(baseHistoryAtom, newValue);
      }
    );

    return { state: stateAtom, history: historyAtom };
  });

  function selectPropertyAtom<K extends keyof TDefinedState>(
    base: Atom<TDefinedState>,
    property: K
  ) {
    return selectAtom(base, (v) => v[property]);
  }

  function Provider({
    children,
    ...rest
  }: { children?: React.ReactNode } & Partial<TDefinedState>) {
    const value = rest as TDefinedState;

    console.log("VALUE", value);
    return (
      <ScopeProvider scope={CtxScope} value={{ ...initial, ...value }}>
        <InnerScope>{children}</InnerScope>
      </ScopeProvider>
    );
  }

  function InnerScope({ children }: { children?: React.ReactNode }) {
    const store = useStore();

    const stateAtom = useCtxAtom("state");

    const [state] = useAtom(stateAtom);

    console.log("STATE ATOM", state);

    const [history, setHistory] = useAtom(useCtxAtom("history"));

    const { update } = getHistoryMethods({ history, setHistory });

    useEffect(() => {
      if (!subscriberMap) return;

      const unsubs = collect(
        subscriberMap,
        (subscriberName: keyof DefinedState, { listenTo, onChange }) => {
          const propertyAtom = selectPropertyAtom(stateAtom, listenTo);

          return store.sub(propertyAtom, () => {
            const val = store.get(propertyAtom);

            const res = dispatchProduceWithPatches(
              store.get(stateAtom),
              (draftState) => {
                onChange(val as any, {
                  state: draftState,
                  subscriberName,
                });
              },
              { producerType: "subscriber" }
            );

            update(res as any);
          });
        }
      );

      return () => {
        unsubs.forEach((unsub) => {
          unsub?.();
        });
      };
    }, [store, stateAtom, update]);

    //

    return (
      <>
        <ReduxAtomDevTools />
        <DevTools store={store} />
        {children}
      </>
    );
  }

  const ReduxAtomDevTools = () => {
    const store = useStore();
    useAtomsDevtools("Create Reducer", { store });
    return null;
  };

  function useCtxMolecule() {
    return useMolecule(CtxMolecule);
  }

  function useCtxAtom<TKey extends MoleculePropKey<typeof CtxMolecule>>(
    key: TKey
  ) {
    return useCtxMolecule()[key];
  }

  function useContext() {
    const { state: stateAtom, history: historyAtom } = useCtxMolecule();

    const state = useAtomValue(stateAtom);

    const [history, setHistory] = useAtom(historyAtom);

    const { update, ...historyMethods } = getHistoryMethods({
      history,
      setHistory,
    });

    const dispatch = createDispatcher({
      state,
      reducers,
      updateHistory: update,
    });

    return [state, { ...historyMethods, ...dispatch }] as unknown as ReturnType<
      TReturn["useContext"]
    >;
  }

  function useDispatcher() {
    return useContext()[1];
  }

  function useContextValue() {
    return useContext()[0];
  }

  return {
    Provider,
    useContext,
    useContextValue,
    useDispatcher,
  };
}

type GetHistoryMethodOptions<
  T,
  THistory extends HistoryState<T> = HistoryState<T>
> = {
  history: THistory;
  setHistory: (data: any) => void;
};

function getHistoryMethods<T>({
  history,
  setHistory,
}: GetHistoryMethodOptions<T>) {
  function update({
    result,
    historyItem,
    hasChanges,
  }: DispatchProduceResult<T>) {
    if (!hasChanges) return;

    const res = produce(history, (draft) => {
      ++draft.currentIndex;
      draft.history.set(draft.currentIndex, historyItem);
      draft.present = result as UnFreeze<T>;
    }) as any as HistoryState<T>;

    setHistory(res);
  }

  function undo() {
    const res = produce(history, (draft) => {
      draft.present = applyPatches(
        history.present,
        draft.history.get(draft.currentIndex--)!.undo
      );
    });

    setHistory(res);
  }

  function redo() {
    const res = produce(history, (draft) => {
      draft.present = applyPatches(
        history.present,
        draft.history.get(++draft.currentIndex)!.redo
      );
    });

    setHistory(res);
  }

  function canRedo() {
    return true;
  }

  function canUndo() {
    return true;
  }

  return { undo, redo, canUndo, canRedo, update };
}

type CreateDispatcherOptions<
  T,
  TReducerMap extends ReducerMap<any> = ReducerMap<any>
> = {
  state: T;
  reducers: TReducerMap;
  updateHistory: ReturnType<typeof getHistoryMethods<T>>["update"];
};

function createDispatcher<T, TReducerMap extends ReducerMap<any>>({
  state,
  reducers,
  updateHistory,
}: CreateDispatcherOptions<T, TReducerMap>) {
  return mapArray(reducers, (action, actionName) => {
    const dispatchFn = (payload: any) => {
      const produceResult = dispatchProduceWithPatches(
        state,
        (draftState) => {
          action(draftState, { payload, type: actionName });
        },
        { producerType: "reducer" }
      );

      updateHistory(produceResult);
    };

    return dispatchFn;
  }) as ReducerDispatcherMap<typeof reducers>;
}

type DispatchProduceOptions = {
  producerType: ProducerType;
  condition?: boolean;
};

type DispatchProduceResult<T> = {
  result: T;
  historyItem: HistoryItem;
  hasChanges: boolean;
};

function dispatchProduceWithPatches<T>(
  state: DraftableState<T>,
  producer: Producer<T, T, false>,
  options: DispatchProduceOptions
): DispatchProduceResult<T> {
  const { condition = true, producerType } = options;

  let patches: Patch[] = [];
  let inverse: Patch[] = [];

  function setPatches(_patches: Patch[], _inverse: Patch[]) {
    if (condition) {
      patches = _patches;
      inverse = _inverse;
    }
  }

  const result = produce(state, producer, setPatches as PatchCallback<T>);

  const hasChanges = patches.length > 0 || inverse.length > 0;

  return {
    result: freeze(result) as T,
    hasChanges,
    historyItem: { producerType, undo: inverse, redo: patches },
  };
}

function mergeState<
  TDefinedState extends DefinedState,
  TDerivedStateMap extends DerivedStateMap<TDefinedState> | undefined
>({ state, derived }: { state: TDefinedState; derived: TDerivedStateMap }) {
  return {
    ...state,
    ...getDerivedState({ state, derivedStateMap: derived }),
  } as LocalState<TDefinedState, TDerivedStateMap>;
}

function getDerivedState<
  TDefinedState extends DefinedState,
  TDerivedContextMap extends DerivedStateMap<TDefinedState>
>({
  state,
  derivedStateMap,
}: {
  state: TDefinedState;
  derivedStateMap?: TDerivedContextMap;
}) {
  if (!derivedStateMap) return undefined;

  return mapRecord(derivedStateMap, (s) => {
    return s(state);
  }) as TDerivedContextMap;
}

const { useDispatcher, useContextValue } = createLocalState({
  initial: { firstName: "Jack", lastName: "Brown" },
  derived: {
    fullName: ({ firstName, lastName }) => {
      return `${firstName} ${lastName}`;
    },
  },
  // subscribers: {
  //   onActiveFileChange: {listenTo: 'test', onChange: (value) => {

  //   }}
  // },
  reducers: {
    setFirstName: (state, action: PayloadAction<string>) => {
      state.firstName = action.payload;
    },
    setLastName: (state, action: PayloadAction<string>) => {
      state.lastName = action.payload;
    },
  },
  subscribers: {
    onFirstNameChange: {
      listenTo: "firstName",
      onChange: () => {},
    },
  },
});

export const LocalStateTest = () => {
  const dispatch = useDispatcher();
  const state = useContextValue();

  const firstName = state.firstName;

  const lastName = state.lastName;

  const fullName = state.fullName;

  return (
    <>
      <button
        onClick={() => {
          dispatch.setFirstName("Abe");
          dispatch.setLastName("Lincoln");
        }}>
        {firstName}
        {lastName}
        {fullName}
      </button>
    </>
  );
};
