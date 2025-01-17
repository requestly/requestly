import { wrap, proxy, Remote } from "comlink";

export class ScriptExecutor {
  private worker: Worker;
  private workerApi: Remote<any>;

  constructor(workerObject: any) {
    this.worker = new workerObject();
    this.workerApi = wrap(this.worker);
  }

  public async executePreRequestScript(
    script: string,
    initialState: any,
    onStateUpdate: (key: string, value: any) => void
  ): Promise<void> {
    try {
      await this.workerApi.executeScript(
        script,
        initialState,
        proxy((key: string, value: any) => {
          console.log("preRequestState update:", key, value);
          onStateUpdate(key, value);
        })
      );
    } catch (error) {
      console.error("preRequest script execution error:", error);
      throw error;
    } finally {
      this.cleanup();
    }
  }

  public async executePostResponseScript(
    script: string,
    initialState: any,
    onStateUpdate: (key: string, value: any) => void
  ): Promise<void> {
    try {
      await this.workerApi.executeScript(
        script,
        initialState,
        proxy((key: string, value: any) => {
          console.log("postResponseState update:", key, value);
          onStateUpdate(key, value);
        })
      );
    } catch (error) {
      console.error("postResponse script execution error:", error);
      throw error;
    } finally {
      this.cleanup();
    }
  }

  private cleanup(): void {
    this.worker.terminate();
  }
}
