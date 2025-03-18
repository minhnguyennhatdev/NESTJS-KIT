export interface IDemoService {
  helloWorld(): string;
}
export const IDemoService = Symbol('IDemoService');
