import { EnvironmentVariables } from "backend/environment/types";
import lodash from 'lodash';
import { v4 as uuidv4 } from "uuid";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry";
import { EntityNotFound } from "../types";

type Variable = EnvironmentVariables[0];

export class ApiClientVariables<T> {
  constructor(
    readonly getVariableObject: (entity: T) => EnvironmentVariables,
    readonly unsafePatch: (patcher: (state: T) => void) => void,
    readonly getEntityFromState: (state: ApiClientStoreState) => T,
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
      // lodash.extend(variables, {[key]: variable});
      variables[key] = variable;
    });

    return id;
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

  get(state: ApiClientStoreState, id: Variable['id']) {
    const entity = this.getEntityFromState(state);
    const variables = this.getVariableObject(entity);
    const variable = lodash.find(variables, v => v.id === id);
    if(!variable) {
      throw new EntityNotFound(id.toString(), "variable");
    }
    return variable;
  }

  getAll(state: ApiClientStoreState) {
    const entity = this.getEntityFromState(state);
    const variables = this.getVariableObject(entity);
    return variables;
  }

  clearAll() {
    this.unsafePatch((state) => {
      const variables = this.getVariableObject(state);
      const keys = Object.keys(variables);
      keys.forEach(key => lodash.unset(variables, key));
    })
  }
}
