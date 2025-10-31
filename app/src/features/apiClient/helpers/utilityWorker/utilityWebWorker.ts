import { expose } from "comlink";

const parseJsonText = (text: string): any => {
  return JSON.parse(text);
};

expose({ parseJsonText });
