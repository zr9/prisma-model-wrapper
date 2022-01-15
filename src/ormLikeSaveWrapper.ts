import { P_SELF_RECURSIVE } from "./types";

type arLikeSaveType = { save(): P_SELF_RECURSIVE };

const arLikeSave = (ret: arLikeSaveType, model: string, client: any): any => {
  return Object.assign(ret, {
    async save() {
      const inputMap = client['_dmmf'].inputTypeMap;
      const whereFieldMap = inputMap[model + 'WhereUniqueInput'].fieldMap;
      const updateFieldMap = inputMap[model + 'UncheckedUpdateInput'].fieldMap;

      let where: any = {};
      let data: any = {};

      //TODO: checks?
      Object.keys(whereFieldMap).map((value) => {
        where[value] = (ret as any)[value];
      });

      Object.keys(updateFieldMap).map((value) => {
        if ((ret as any)[value]) {
          data[value] = (ret as any)[value];
        }
      });

      await client[model.toLowerCase()].update({where, data});

      return ret;
    }
  })
}

export {
  arLikeSave
}
  
  