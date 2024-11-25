export const responseWorkerCode = `
self.onmessage = function(e) {
  const { script, response, currentVars, currentEnvironmentId } = e.data;

  const sandbox = {
    rq: {
      response: {...response},
      environment: {
        set: (key, value) => {
          self.postMessage({
            type: 'SET_ENVIRONMENT',
            payload: { key, value, currentEnvironmentId }
          });
        },
        get: (key) => {
          const variable = currentVars[key];
          return variable?.syncValue || variable?.localValue;
        }
      }
    }
  };

  try {
    const scriptFunction = new Function(
      'rq',
      \`
      "use strict";
      try {
        \${script}
      } catch (error) {
        console.error('Script error:', error);
        throw error;
      }
      \`
    );

    scriptFunction(sandbox.rq);
    self.postMessage({ type: 'COMPLETE' });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: {
        name: 'Script Execution',
        passed: false,
        error: error.message
      }
    });
  }
};
`;
