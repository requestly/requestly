// @ts-ignore
import { createMock } from "backend/mocks/createMock";
import APP_CONSTANTS from "config/constants";
import { isEnvBeta, isEnvEmulator } from "utils/EnvUtils";
import { v4 as uuidv4 } from "uuid";
import {
  defaultCssEditorMock,
  defaultEditorMock,
  defaultHtmlEditorMock,
  defaultJsEditorMock,
} from "../MockEditor/constants";

import { MockEditorDataSchema } from "../MockEditor/types";
import { RQMockSchema, FileType } from "../types";

export const fileTypeColorMap = {
  [FileType.JS]: "#FFCA5F",
  [FileType.HTML]: "#FF6905",
  [FileType.CSS]: "#57BEE6",
  [FileType.IMAGE]: "#00C8AF",
};

export const mockMethodColorMap: { [key: string]: string } = {
  GET: "#00C8AF",
  POST: "#1E69FF",
  PUT: "#FF6905",
  DELETE: "#FC6675",
  PATCH: "#FFCA5F",
  HEAD: "#BEAAFF",
  OPTIONS: "#57BEE6",
  default: "#00C8AF",
};

export const editorDataToMockDataConverter = (
  mockEditorData: MockEditorDataSchema
): RQMockSchema => {
  // Add content-type Header to Response
  mockEditorData.headers = {
    ...mockEditorData.headers,
    "content-type": mockEditorData.contentType,
  };

  const mockData: RQMockSchema = {
    id: mockEditorData.id,
    type: mockEditorData.type,
    fileType: mockEditorData?.fileType,
    name: mockEditorData.name,
    desc: mockEditorData.desc,
    method: mockEditorData.method,
    endpoint: mockEditorData.endpoint,
    responses: [
      {
        id: mockEditorData.responseId || uuidv4(),
        desc: "",
        statusCode: mockEditorData.statusCode,
        latency: mockEditorData.latency,
        headers: mockEditorData.headers,
        body: mockEditorData.body,
      },
    ],
  };

  return mockData;
};

export const mockDataToEditorDataAdapter = (
  mockData: RQMockSchema
): MockEditorDataSchema => {
  if (!mockData) {
    return null;
  }

  // TODO: handle uppercase lowercase for content-type here
  const headers = mockData.responses[0]?.headers || {};
  const contentType = headers["content-type"] || "application/json";
  delete headers["content-type"];

  const mockEditorData: MockEditorDataSchema = {
    id: mockData.id,
    type: mockData.type,
    fileType: mockData?.fileType,
    name: mockData.name,
    desc: mockData.desc as string,
    method: mockData.method,
    endpoint: mockData.endpoint,
    latency: mockData.responses[0]?.latency || 0,
    statusCode: mockData.responses[0]?.statusCode || 200,
    headers: headers,
    contentType: contentType,
    body: mockData.responses[0]?.body || "",
    responseId: mockData.responses[0]?.id,
  };

  return mockEditorData;
};

// TODO: This is temporary. Give subdomain to users based on username.
// Handle rewrites/redirect on cloudfare
export const generateFinalUrl = (
  endpoint: string,
  uid: string,
  username: string = null
) => {
  let finalUrl = `https://requestly.dev/api/mockv2/${endpoint}?rq_uid=${uid}`;

  if (isEnvBeta()) {
    finalUrl = `${APP_CONSTANTS.mock_base_url.beta}/${endpoint}?rq_uid=${uid}`;
  } else if (isEnvEmulator()) {
    finalUrl = `${APP_CONSTANTS.mock_base_url.local}/${endpoint}?rq_uid=${uid}`;
  } else {
    if (username) {
      finalUrl = `https://${username}.requestly.dev/${endpoint}`;
    }
  }

  return finalUrl;
};

const getMockEditorDataForFile = (
  fileType: string,
  name: string,
  data: string
) => {
  let mockEditorData = { ...defaultEditorMock };

  switch (fileType) {
    case "text/javascript":
      mockEditorData = { ...defaultJsEditorMock };
      break;
    case "text/css":
      mockEditorData = { ...defaultCssEditorMock };
      break;
    case "text/html":
      mockEditorData = { ...defaultHtmlEditorMock };
      break;
  }

  mockEditorData.name = name;
  mockEditorData.endpoint = name.replace(/[^\w.-]/gi, ""); //remove special characters including space
  mockEditorData.body = data;

  return mockEditorData;
};

export const createMockFromUploadedFile = async (uid: string, file: File) => {
  // TODO: ADD MAX FILE SIZE CHECK HERE
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = async (e) => {
      const mockEditorData: MockEditorDataSchema = getMockEditorDataForFile(
        file.type,
        file.name,
        e.target.result.toString()
      );
      const mockData: RQMockSchema = editorDataToMockDataConverter(
        mockEditorData
      );

      await createMock(uid, mockData).then((mockId) => {
        if (mockId) {
          mockData.id = mockId;
          return resolve(mockData);
        }
        return reject("Failure while creating mock");
      });
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
