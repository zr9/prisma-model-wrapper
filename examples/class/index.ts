import { Prisma, PrismaClient } from "@prisma/client";
import {prismaWrapper} from "prisma-model-wrapper";

const prisma = new PrismaClient();

type yourWrapperType = {
  validate(): boolean;
}

class UserWrapper{
  constructor(ret:yourWrapperType, model: string, client: any){
    Object.assign(this, ret);
  }

  validate() {
    return true;  //just for example always valid
  }
}

const wrappers = {
  [Prisma.ModelName.users]: UserWrapper
}

const prismaNew = prismaWrapper(prisma, wrappers);

//... somewhere else
const example = async () => {
  const user = await prismaNew.users.findUnique({where: {id: 1}});
  console.log('validation', user?.validate());
}

example();
