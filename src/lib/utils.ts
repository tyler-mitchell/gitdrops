import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

export function stringifyData(data: unknown) {
  return JSON.stringify(data, null, 2);
}

export function safeParse(value: unknown) {
  try {
    if (typeof value !== "string") return undefined;
    return JSON.parse(value);
  } catch (e) {
    return undefined;
  }
}

export function getLocalStorageItem<T>(key: string) {
  return (localStorage.getItem(key) ?? undefined) as T | undefined;
}

export function setLocalStorageItem(key: string, value: string | undefined) {
  if (value) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
  }
}
