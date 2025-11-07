import { ExecutionContext } from "features/apiClient/helpers/httpRequestExecutor/scriptExecutionContext";
import { LocalScope } from "modules/localScope";

export class IterationData {
  private iterationData: ExecutionContext["iterationData"];
  constructor(private readonly localScope: LocalScope) {
    this.iterationData = this.localScope.get("iterationData");
  }

  get(key: string) {
    return this.iterationData[key]?.localValue;
  }

  has(key: string) {
    return key in this.iterationData;
  }

  // only unsets in the current class instance, does not modify the localScope
  unset(key: string) {
    const variables = this.iterationData;
    delete variables[key];
  }

  toObject() {
    const result: Record<string, any> = {};
    for (const key in this.iterationData) {
      result[key] = this.iterationData[key]?.localValue;
    }
    return result;
  }
}
