import { createMock } from "backend/mocks/createMock";
import APP_CONSTANTS from "config/constants";
import { isBackendEnvBeta, isBackendEnvEmulator } from "utils/EnvUtils";
import { v4 as uuidv4 } from "uuid";
import {
  defaultCssEditorMock,
  defaultEditorMock,
  defaultHtmlEditorMock,
  defaultJsEditorMock,
} from "../MockEditorIndex/constants";

import { MockEditorDataSchema } from "../MockEditorIndex/types";
import { RQMockSchema, FileType } from "../types";

export const fileTypeColorMap = {
  [FileType.JS]: "#FFCA5F",
  [FileType.HTML]: "#FF6905",
  [FileType.CSS]: "#57BEE6",
  [FileType.IMAGE]: "#00C8AF",
};

export const editorDataToMockDataConverter = (mockEditorData: MockEditorDataSchema): RQMockSchema => {
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
    password: mockEditorData.password ?? null,
  };

  return mockData;
};

export const mockDataToEditorDataAdapter = (mockData: RQMockSchema): MockEditorDataSchema => {
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
    password: mockData.password ?? "",
    collectionId: mockData.collectionId ?? "",
  };

  return mockEditorData;
};

const generateEndpointPrefix = (username: string = null, teamId?: string, collectionPath?: string) => {
  let prefix = "";

  if (isBackendEnvBeta()) {
    prefix = `${APP_CONSTANTS.mock_base_url.beta}/`;
  } else if (isBackendEnvEmulator()) {
    prefix = `${APP_CONSTANTS.mock_base_url.local}/`;
  } else {
    if (teamId) {
      prefix = `https://requestly.tech/api/mockv2/`;
    } else if (username) {
      prefix = `https://${username}.requestly.tech/`;
    } else {
      prefix = "https://requestly.tech/api/mockv2/";
    }
  }

  if (collectionPath) {
    return `${prefix}${collectionPath}/`;
  }

  return prefix;
};

const generateEndpointSuffix = (username: string, uid?: string, teamId?: string, password?: string) => {
  const searchParamsObj: Record<string, string> = {};

  if (teamId) {
    searchParamsObj["teamId"] = teamId;
  } else if (!username || isBackendEnvBeta() || isBackendEnvEmulator()) {
    searchParamsObj["rq_uid"] = uid;
  }

  if (password && password.length > 0) {
    searchParamsObj["rq_password"] = password;
  }

  const searchParams = new URLSearchParams(searchParamsObj);

  return `?${searchParams.toString()}`;
};

export const generateFinalUrlParts = ({
  endpoint,
  uid,
  teamId,
  password,
  username = null,
  collectionPath = "",
}: {
  endpoint: string;
  uid: string;
  username: string;
  teamId?: string;
  password?: string;
  collectionPath?: string;
}) => {
  let prefix = generateEndpointPrefix(username, teamId, collectionPath);
  let suffix = generateEndpointSuffix(username, uid, teamId, password);

  return {
    prefix: prefix,
    suffix: suffix,
    endpoint: endpoint,
    url: prefix + endpoint + suffix,
  };
};

export const generateFinalUrl = ({
  endpoint,
  uid,
  teamId,
  password,
  username = null,
  collectionPath = "",
}: {
  endpoint: string;
  uid: string;
  username?: string;
  teamId?: string;
  password?: string;
  collectionPath?: string;
}) => {
  return generateFinalUrlParts({ endpoint, uid, username, teamId, password, collectionPath }).url;
};

const getMockEditorDataForFile = (fileType: string, name: string, data: string) => {
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

export const createMockFromUploadedFile = async (uid: string, file: File, teamId?: string) => {
  // TODO: ADD MAX FILE SIZE CHECK HERE
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = async (e) => {
      const mockEditorData: MockEditorDataSchema = getMockEditorDataForFile(
        file.type,
        file.name,
        e.target.result.toString()
      );
      const mockData: RQMockSchema = editorDataToMockDataConverter(mockEditorData);

      await createMock(uid, mockData, teamId).then((mockId) => {
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
