import { AUTHORIZATION_TYPES } from "./screens/apiClient/components/clientView/components/request/components/AuthorizationView/authStaticData";
import { RQAPI } from "./types";

export const CONTENT_TYPE_HEADER = "Content-Type";

export const DEMO_API_URL = "https://app.requestly.io/echo";

export const POSTMAN_AUTH_TYPES_MAPPING = {
  inherit: AUTHORIZATION_TYPES.INHERIT,
  noauth: AUTHORIZATION_TYPES.NO_AUTH,
  apikey: AUTHORIZATION_TYPES.API_KEY,
  bearer: AUTHORIZATION_TYPES.BEARER_TOKEN,
  basic: AUTHORIZATION_TYPES.BASIC_AUTH,
};

export const POSTMAN_FIELD_MAPPING = {
  mapping: {
    in: "addTo",
    query: "QUERY",
    token: "bearer",
  },
  get(key: string): string {
    return this.mapping[key] ?? key;
  },
};

export const DUMMY_TEST_RESULT: RQAPI.TestResult[] = [
  {
    status: "passed",
    message: "Successful POST request",
  },
  {
    status: "failed",
    message: "Successful POST request | AssertionError: expected 200 to be one of [ 201, 202 ]",
  },
  {
    status: "failed",
    message: "Response time is less than 200ms | AssertionError: expected 346 to be below 200",
  },
  {
    status: "passed",
    message: "Schema is valid ",
  },
  {
    status: "skipped",
    message: "Convert XML body to JSON data",
  },
  {
    status: "skipped",
    message: "Convert XML body to JSON data",
  },
  {
    status: "skipped",
    message: "Convert XML body to JSON data",
  },
];
