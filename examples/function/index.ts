import {Prisma, PrismaClient } from "@prisma/client";
import {
  prismaWrapper
} from "prisma-wrapper";

const prisma = new PrismaClient();

type yourWrapperType = {
  validate(): boolean;
}

const userWrapper = (ret: yourWrapperType, model: string, client: any): any => {
  return Object.assign(ret, {
    validate() {
      return true; //just for example always valid
    }
  });
}

const wrappers = {
  [Prisma.ModelName.users]: userWrapper
}

const prismaNew = prismaWrapper(prisma, wrappers);

//... somewhere else
const example = async () => {
  const user = await prismaNew.users.findUnique({where: {id: 1}});
  console.log('validation', user?.validate());
}

example();
