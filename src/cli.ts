#!/usr/bin/env node

import path from "path";
import { constants as perms } from "fs";
import { cwd } from "process";
import { access, readFile, writeFile } from "fs/promises";

const rootDir = cwd();
const packageDir = __dirname;
const dtsFileName = 'prismaGenericTypes.d.ts';
const SPACING = ' '.repeat(6);

const pkg = require(path.join(rootDir, 'package.json'));

const generateDTS = (payloads:string[]) => {
  const payloadsOut = payloads.join(';\n'+SPACING);
  
  return `
    import {
      Prisma
    } from "@prisma/client";

    declare type PrismaGenericTypes<T> = {
      ${payloadsOut}
    };
    export type { PrismaGenericTypes };
  `;
}

const generatePayload = (name:string) => {
  return `${name}: Prisma.${name}GetPayload<T>`;
}

let modelNames:string[] = [];

async function generatePayloads(){
  let file;

  if(pkg?.prisma?.schema){    
    file = path.join(rootDir, './prisma/schema.prisma');
    await access(file, perms.R_OK);
  }else{
    try{
      file = path.join(rootDir, './prisma/schema.prisma');
      await access(file, perms.R_OK);
    }catch(e){
      file = path.join(rootDir, './schema.prisma');
      await access(file, perms.R_OK);
    }
  }

  const body = await readFile(file, 'utf8');
  const lines = body.split('\n')

  for (const line of lines) {
    const modelMatch = line.match(/^model (\w+) {$/)
    
    if (modelMatch) {
      modelNames.push(modelMatch[1]);
    }
  }

  const payloads = modelNames.map((item) => {
    return generatePayload(item);
  });
  
  const payloadsDTS = generateDTS(payloads);
  await writeFile(path.join(packageDir, dtsFileName), payloadsDTS)

  console.log('Payloads generated');
}

generatePayloads();