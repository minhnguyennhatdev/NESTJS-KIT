// make 1 prop optional
export type PartialBy<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// make 1 prop required
export type PartialExclude<T, K extends keyof T> = Pick<T, K> & PartialBy<T, K>;
