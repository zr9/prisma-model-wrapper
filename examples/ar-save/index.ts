import {Prisma, PrismaClient } from "@prisma/client";
import {arLikeSave, prismaWrapper} from "prisma-model-wrapper";

const prisma = new PrismaClient();

const wrappers = {
  [Prisma.ModelName.users]: arLikeSave
}

const prismaNew = prismaWrapper(prisma, wrappers);

//... somewhere else
const example = async () => {
  const user = await prismaNew.users.findUnique({where: {id: 1}});
  
  if(user){
    user.name = 'test3';
    await user.save();
  }

  console.log('user', user);
}

example();
