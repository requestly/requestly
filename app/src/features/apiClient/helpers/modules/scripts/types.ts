export interface ScriptExecutedPayload {
  mutations: {
    environment: {
      $set: Record<string, string | number | boolean>;
      $unset: Record<string, "">;
    };
    globals: {
      $set: Record<string, string | number | boolean>;
      $unset: Record<string, "">;
    };
    collectionVariables: {
      $set: Record<string, string | number | boolean>;
      $unset: Record<string, "">;
    };
  };
}
