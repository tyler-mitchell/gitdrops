/* eslint-disable @typescript-eslint/ban-types */
export type StringRecord<T> = Record<string, T>;

export type OmitNever<T> = Omit<
  T,
  { [K in keyof T]: T[K] extends never ? K : never }[keyof T]
> & {};
