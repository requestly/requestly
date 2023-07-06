import { FileType, MockType } from "../types";
import { MockEditorDataSchema, RequestMethod } from "./types";

export const defaultEditorMock: MockEditorDataSchema = {
  id: "",
  type: MockType.API,
  fileType: null,
  name: "",
  desc: "",
  method: RequestMethod.GET,
  latency: 0,
  endpoint: "",
  statusCode: 200,
  contentType: "application/json",
  headers: {},
  body: "{}",
};

export const defaultFileBodyTemplates = {
  [FileType.JS]: "console.log('Hello World')",
  [FileType.CSS]: "body {background-color: #fff;}",
  [FileType.HTML]: `<html>\n\t<body>\n\t\t<h1>Hello World</h1>\n\t</body>\n</html>`,
};

export const defaultJsEditorMock: MockEditorDataSchema = {
  ...defaultEditorMock,
  type: MockType.FILE,
  fileType: FileType.JS,
  contentType: "application/javascript",
  body: defaultFileBodyTemplates[FileType.JS],
};

export const defaultCssEditorMock: MockEditorDataSchema = {
  ...defaultEditorMock,
  type: MockType.FILE,
  fileType: FileType.CSS,
  contentType: "text/css",
  body: defaultFileBodyTemplates[FileType.CSS],
};

export const defaultHtmlEditorMock: MockEditorDataSchema = {
  ...defaultEditorMock,
  type: MockType.FILE,
  fileType: FileType.HTML,
  contentType: "text/html",
  body: defaultFileBodyTemplates[FileType.HTML],
};

export const requestMethodDropdownOptions = [
  ...Object.keys(RequestMethod)
    .filter((key: RequestMethod) => RequestMethod[key] !== RequestMethod.OPTIONS)
    .map((key: RequestMethod) => {
      return { key: key, value: RequestMethod[key] };
    }),
];
