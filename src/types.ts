import { PrismaPromise, Prisma } from "@prisma/client";
import { PrismaGenericTypes } from "./prismaGenericTypes";


// NOTE: Original type is already covered on `ChangeThenArgs`
//       so we can go recursive here in special cases
//      |
//      A - Wrapper arguments
//      R - Return type(thenable), W - wrappers, B - input, M - model name
//      R, W, B, M - to pass in case of recursion
type ExpandCustomTypes<A, R, W, B, M extends string> = A extends object
  ? {
    [K in keyof A]: A[K] extends (...args: infer TA) => unknown
      ? (...args: TA) => A[K] extends (...args: [unknown]) => infer TR
        ? TR extends P_SELF
          ? R
          : TR extends P_SELF_RECURSIVE
            ? ChangeThenArgs<R, W, B, M>
            : TR
        : A[K]
      : A[K]
  }
  : A;

//NOTE: OA - Original Arguments
//      A - Wrapper Arguments
//      R - Return type(thenable), W - wrappers, B - input, M - model name
//      R, W, B, M - to pass in case of recursion
type FullfillArgs<OA, A, R, W, B, M extends string> =
  CheckNullable<OA, (
    M extends keyof PrismaGenericTypes<unknown>
      ? PrismaGenericTypes<B>[M]
      : {}
    ) & ExpandCustomTypes<A, R, W, B, M>>;

//NOTE: OA - Original Arguments
//      A - Wrapper Arguments
//      R - Return type(thenable), W - wrappers, B - input, M - model name
//      R, W, B, M - to pass in case of recursion
type ChangeFulfillArgs<OA, A, R, W, B, M extends string> =
  A extends ExtractGeneric<R>
    // NOTE: wrapper extends original type, override
    ? (a: A) => unknown
    // NOTE: wrapper planned as addition, extend
    : NonNullable<OA> extends Array<any>
      ? (a: Array<FullfillArgs<ExtractArray<OA>, A, R, W, B, M>>) => unknown
      : (a: FullfillArgs<OA, A, R, W, B, M>) => unknown;

//NOTE: R - Return type(thenable), W - wrappers, B - input, M - model name
//      (...args: B) => R - we operate on it
//      R => PromiseLike
type ChangeThenArgs<R, W, B, M extends string> =
  R extends object
    ? {
      [PR in keyof R]: PR extends "then"
        ? R[PR] extends (fulfill?: infer FA, reject?: infer RA) => unknown
          ? (
            fulfill?: FA extends (a: infer FAA) => unknown
              ? W extends (a1: infer WAA, a2?: any, a3?: any) => unknown
                ? ChangeFulfillArgs<FAA, WAA, R, W, B, M>

                : W extends { new(a1: infer WAA, a2?: any, a3?: any): unknown }
                  ? ChangeFulfillArgs<FAA, WAA, R, W, B, M>
                  : FA
              : FA,
            reject?: RA
          ) => R[PR] extends (args: unknown) => infer RR ? RR : R[PR]
          : R[PR]
        : R[PR]
    }
    : R;

//NOTE: T - client, K - keys, W - wrappers
type PrismaWrapper<T, K, W> = {
  [P in keyof T]: {
    [P2 in keyof T[P]]: P2 extends K
      ?
      T[P][P2] extends (args: infer B) => any
        // NOTE: idea loses `implement members` without double infer, 2nd must be in return
        ? <D extends B>(args?: D) => T[P][P2] extends (args: any) => infer R
          ? P extends keyof W
            ? ChangeThenArgs<R, W[P], D, (string & P)>
            : Capitalize<string & P> extends keyof W
              ? ChangeThenArgs<R, W[Capitalize<string & P>], D, Capitalize<string & P>>
              : R
          : T[P][P2]
        : T[P][P2]
      : T[P][P2]
  }
}

type Callable = (...args: any) => any;
type Instantiable = { new(...args: any[]): any };
type WrapperInstance = Callable | Instantiable;
type CheckNullable<T, R> = T extends null ? (NonNullable<T> & R) | null : T & R;

type WrapperKeys = keyof typeof Prisma.ModelName
type WrapperObject = {
  [key in WrapperKeys]?: WrapperInstance
};

// NOTE: special types to expand later on
type P_SELF = '_self'
type P_SELF_RECURSIVE = '_self_recursive'


type NoExtraProperties<T, U extends T = T> = U & Record<Exclude<keyof U, keyof T>, never>;
type ExtractArray<Type> = Type extends Array<infer X> ? X : never
type ExtractGeneric<Type> = Type extends PrismaPromise<infer X> ? X : never
type PrismaKeys = "findFirst" | "findUnique" | "findMany";

export type {
  NoExtraProperties,
  PrismaWrapper,
  PrismaKeys,
  P_SELF,
  P_SELF_RECURSIVE,
  Callable,
  Instantiable,
  WrapperObject,
}
