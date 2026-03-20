import { lazy, type ComponentType } from "react";

export function lazyNamed<T extends ComponentType<any>, K extends string>(
  loader: () => Promise<Record<K, T>>,
  exportName: K,
) {
  return lazy(async () => ({
    default: (await loader())[exportName],
  }));
}
