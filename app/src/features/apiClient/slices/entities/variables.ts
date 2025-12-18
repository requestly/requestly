import { EnvironmentVariables } from "backend/environment/types";
import * as lodash from 'lodash';
type Variable = EnvironmentVariables[0];

export class ApiClientVariables<T> {
  constructor(
    readonly getVar: (entity: T) => EnvironmentVariables,
    readonly unsafePatch: (patcher: (state: T) => void) => void,
  ) {

  }
  add(params: Omit<Variable, 'id'>) {
    params.type
  }

  set(params: Pick<Variable, 'id'> & Partial<Omit<Variable, 'id'>>) {
    params.id;
  }

  get() {

  }

  getAll() {

  }

  clearAll() {
    this.unsafePatch((state) => {
      const variables = this.getVar(state);
      const keys = Object.keys(variables);
      lodash.unset(variables, keys);
    })
  }
}
