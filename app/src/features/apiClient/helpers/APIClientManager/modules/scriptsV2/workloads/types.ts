export type SandboxAPI = {
  environment: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
    unset: (key: string) => void;
  };
  globals: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
    unset: (key: string) => void;
  };
  collectionVariables: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
    unset: (key: string) => void;
  };
};
