// eg: type ABC = 'A' | 'B' | 'C' => ['A', 'B', 'C']
export type ExtractStrings<T> = T extends `${infer U}` ? U : never;
