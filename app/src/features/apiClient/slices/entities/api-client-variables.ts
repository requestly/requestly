import { EnvironmentVariables } from "backend/environment/types";
import lodash from 'lodash';
import { v4 as uuidv4 } from "uuid";

type Variable = EnvironmentVariables[0];

export class ApiClientVariables<T> {
  constructor(
    readonly getVariableObject: (entity: T) => EnvironmentVariables,
    readonly unsafePatch: (patcher: (state: T) => void) => void,
  ) {

  }

  add(params: Omit<Variable, 'id'> & {key: string}) {
    const id = uuidv4();
    const {key, ...variableData} = params;
    const variable: Variable = {
      id,
      ...variableData,
    };
    this.unsafePatch(s => {
      const variables = this.getVariableObject(s);
      variables[key] = variable;
    });
  }

  set(params: Pick<Variable, 'id'> & Partial<Omit<Variable, 'id'>>) {
    const {id, ...variableData} = params;
    this.unsafePatch(s => {
      debugger;
      const variables = this.getVariableObject(s);
      let variable = lodash.find(variables, (v) => v.id === params.id);
      if(!variable) {
        return;
      }
      lodash.extend(variable, variableData);
    });
  }

  get() {

  }

  getAll() {

  }

  clearAll() {
    this.unsafePatch((state) => {
      const variables = this.getVariableObject(state);
      const keys = Object.keys(variables);
      lodash.unset(variables, keys);
    })
  }
}
