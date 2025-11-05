import { LocalScope } from "modules/localScope";

export class IterationData {
  private readonly iterationData;
  constructor(private readonly localScope: LocalScope) {
    this.iterationData = this.localScope.get("iterationData");
  }

  get(key: string) {
    return this.iterationData[key]?.localValue;
  }

  has(key: string) {
    return key in this.iterationData;
  }

  unset(key: string) {
    const variables = this.iterationData;
    variables[key] = undefined;
    this.localScope.set("iterationData", variables);
  }

  toObject() {
    const result: Record<string, any> = {};
    for (const key in this.iterationData) {
      result[key] = this.iterationData[key]?.localValue;
    }
    return result;
  }

  toJSON() {
    const result: { key: string; value: any }[] = [];
    for (const key in this.iterationData) {
      result.push({
        key,
        value: this.iterationData[key]?.localValue,
      });
    }
    return {
      values: result,
    };
  }
}
