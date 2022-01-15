# Prisma model wrapper

This module extends [Prisma ORM](https://github.com/prisma/prisma).
It allows instantiating your own types & logic on top of prisma default.

## Installation

``` bash
npm install prisma-model-wrapper
```

## Payloads generation

> Payloads generation is only required if you plan to use `prisma` with relations.
> Due to TS & prisma limitations it is not possible to load relations directly, so we need to pre-generate payloads to reach them.

``` bash
npx prisma-model-wrapper
```

## Usage

You can specify both functions & classes as a wrapper.

``` ts
import {Prisma, PrismaClient } from "@prisma/client";
import {prismaWrapper} from "prisma-wrapper"; 

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
const user = await prismaNew.users.findUnique({where: {id: 1}});
user.validate();
```

## Usage with function

``` ts
import {Prisma, PrismaClient } from "@prisma/client";
import {prismaWrapper} from "prisma-wrapper";

const prisma = new PrismaClient();

type yourWrapperType = {
  validate(): boolean;
}

const userWrapper = (ret: yourWrapperType, model: string, client: any): any => {
  return Object.assign(ret, {
    validate(): {
      return true; //just for example always valid
    }
  });
}

const wrappers = {
  [Prisma.ModelName.users]: userWrapper
}

const prismaNew = prismaWrapper(prisma, wrappers);

//... somewhere else
const user = await prismaNew.users.findUnique({where: {id: 1}});
user.validate();
```

## Wrappers partial types

If the type on your wrapper doesn't include the original type, then original **will be extended** like `result = Original & Yours`, otherwise original type **will be overwritten**

## Usage with AR like save

Just define your wrapper with `arLikeSave`

``` ts
import {arLikeSave,} from "prisma-wrapper";

const wrappers = {
  [Prisma.ModelName.users]: arLikeSave
}

//... somewhere else
const user = await prismaNew.users.findUnique({where: {id: 1}});
user.name = 'new name';
await user.save(); //model saved
```

## Examples
[Examples to dive in](./examples/)