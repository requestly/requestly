import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientLocalMeta, EnvironmentInterface, EnvironmentListenerParams } from "../../interfaces";

export class LocalEnvSync implements EnvironmentInterface<ApiClientLocalMeta> {
	constructor(readonly meta: ApiClientLocalMeta) {

	}
	createNonGlobalEnvironment(environmentName: string): Promise<EnvironmentData> {
		throw new Error("Method not implemented.");
	}
	createGlobalEnvironment(): Promise<EnvironmentData> {
		throw new Error("Method not implemented.");
	}
	deleteEnvironment(envId: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	updateEnvironment(environmentId: string, updates: Partial<Pick<EnvironmentData, "name" | "variables">>): Promise<void> {
		throw new Error("Method not implemented.");
	}
	removeVariableFromEnvironment(environmentId: string, key: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	duplicateEnvironment(environmentId: string, allEnvironments: EnvironmentMap): Promise<EnvironmentData> {
		throw new Error("Method not implemented.");
	}
	attachListener(params: EnvironmentListenerParams): () => any {
		throw new Error("Method not implemented.");
	}
}
