// interface TestResult {
//   name: string;
//   passed: boolean;
//   error?: string;
// }

export class ResponseScriptParser {
  private script: string;
  private responseBody: any;
  private environmentManager: any;

  constructor(script: string, responseBody: any, environmentManager: any) {
    this.script = script;
    this.responseBody = responseBody;
    this.environmentManager = environmentManager;
  }

  parse() {
    const sandbox = {
      rq: {
        response: {
          body: this.responseBody,
        },
        environment: {
          set: (key: string, value: string) => {
            const currentVars = this.environmentManager.getCurrentEnvironmentVariables();
            const { currentEnvironmentId } = this.environmentManager.getCurrentEnvironment();
            const newVars = {
              ...currentVars,
              [key]: {
                syncValue: value,
                localValue: value,
              },
            };
            this.environmentManager.setVariables(currentEnvironmentId, newVars);
          },
          get: (key: string) => {
            const currentVars = this.environmentManager.getCurrentEnvironmentVariables();
            return currentVars[key];
          },
        },
      },
    };

    try {
      const scriptFunction = new Function(
        "rq",
        `
        "use strict";
        try {
          ${this.script}
        } catch (error) {
          console.error('Script error:', error);
          throw error;
        }
        `
      );

      scriptFunction(sandbox.rq);
      // return this.testResults;
    } catch (error) {
      console.log("!!!debug", "error", error);
      return [
        {
          name: "Script Execution",
          passed: false,
          error: error.message,
        },
      ];
    }
  }
}

// Usage example:
// const script = `
//   pm.test("Response has user data", () => {
//     return pm.response.body.userId === 1 &&
//            pm.response.body.name === "John";
//   });
// `;

// const responseBody = {
//   userId: 1,
//   name: "John",
//   email: "john@example.com"
// };

// const parser = new ResponseScriptParser(script, responseBody);
// const results = parser.parse();
// console.log('Test Results:', results);
