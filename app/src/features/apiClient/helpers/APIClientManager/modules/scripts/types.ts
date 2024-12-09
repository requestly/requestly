export interface ScriptExecutedPayload {
  mutations: {
    environment: {
      $set: Record<string, string | number | boolean>;
      $unset: Record<string, "">;
    };
  };
}
