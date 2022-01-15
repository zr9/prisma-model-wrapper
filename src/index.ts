import { PrismaClient } from "@prisma/client";
import { Callable, Instantiable, NoExtraProperties, PrismaKeys, PrismaWrapper, WrapperObject } from "./types";


const isInstantiable = (fn: Callable | Instantiable): fn is Instantiable => {
  return !!fn.prototype && !!fn.prototype.constructor.name;
}

const prismaWrapper = <C extends PrismaClient,
  W extends WrapperObject>(client: C, wrappers: NoExtraProperties<WrapperObject, W>): PrismaWrapper<C, PrismaKeys, W> => {

  client.$use(async (params, next) => {
    const result = await next(params);

    if (params.model){
      const wrapper = wrappers[params.model];

      if (wrapper) {
        if (isInstantiable(wrapper)) {
          return new wrapper(result, params.model, client);
        }
  
        return wrapper(result, params.model, client);
      }
    }
    

    return result;
  });

  //@ts-ignore
  return client;
}

export type {
  P_SELF,
  P_SELF_RECURSIVE
} from "./types"

export {
  arLikeSave
} from "./ormLikeSaveWrapper"

export {
  prismaWrapper
}