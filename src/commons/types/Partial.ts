export type PartialBy<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type PartialExclude<T, K extends keyof T> = Pick<T, K> & PartialBy<T, K>;
