import { ApiClientFeatureContext } from "features/apiClient/contexts/meta";

export const sampleCmd1 = (ctx: ApiClientFeatureContext, arg1: number) => {
  console.log("sampleCmd1 ctx", ctx);
  console.log("sampleCmd1 arg1", arg1);
};

export const sampleCmd2 = (ctx: ApiClientFeatureContext, arg1: boolean, arg2: boolean) => {
  console.log("sampleCmd2 ctx", ctx);
  console.log("sampleCmd2 arg1", arg1);
  console.log("sampleCmd2 arg2", arg2);
  return arg2;
};

export const sampleCmd3 = (ctx: ApiClientFeatureContext, arg1: string) => {
  console.log("sampleCmd3 ctx", ctx);
  console.log("sampleCmd3 arg1", arg1);
};

export const sampleCmd4 = (ctx: ApiClientFeatureContext, arg1: object) => {
  console.log("sampleCmd4 ctx", ctx);
  console.log("sampleCmd4 arg1", arg1);
};

export const sampleCmd5 = (ctx: ApiClientFeatureContext, arg1: any[], arg2: string) => {
  console.log("sampleCmd5 ctx", ctx);
  console.log("sampleCmd5 arg1", arg1);
  console.log("sampleCmd5 arg2", arg2);
};
