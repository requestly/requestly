/**
 * Sample usage examples for EventLogger
 */

import { useAPILogger } from './eventLogger';
import { useEffect } from 'react';

// Example 1: Using the logger in a React component
export const APIRequestComponent = () => {
  const logger = useAPILogger();

  const makeAPIRequest = async () => {
    // Log the request
    logger.logRequest({
      request: {
        payload: {
          method: 'GET',
          url: 'https://api.example.com/users',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token123'
          },
          body: null
        }
      },
      tag: {
        source: 'user-dashboard',
        userId: 'user-123'
      }
    });

    try {
      // Make the actual API call
      const response = await fetch('https://api.example.com/users');
      const data = await response.json();

      // Log the response
      logger.logResponse({
        response: {
          payload: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: data,
            time: 245 // response time in ms
          }
        },
        tag: {
          source: 'user-dashboard',
          userId: 'user-123',
          success: true
        }
      });

      return data;
    } catch (error) {
      // Log error response
      logger.logResponse({
        response: {
          payload: {
            status: 0,
            statusText: 'Network Error',
            headers: {},
            body: { error: error.message },
            time: 0
          }
        },
        tag: {
          source: 'user-dashboard',
          userId: 'user-123',
          success: false,
          error: error.message
        }
      });

      throw error;
    }
  };

  useEffect(() => {
    makeAPIRequest();
  }, []);

  return <div>Check console for logged events</div>;
};

// Example 2: Using the logger in a custom hook
export const useAPICall = (url: string) => {
  const logger = useAPILogger();

  const fetchData = async (options?: RequestInit) => {
    // Log request
    logger.logRequest({
      request: {
        payload: {
          method: options?.method || 'GET',
          url,
          headers: options?.headers || {},
          body: options?.body || null
        }
      }
    });

    const startTime = Date.now();
    const response = await fetch(url, options);
    const endTime = Date.now();
    const data = await response.json();

    // Log response
    logger.logResponse({
      response: {
        payload: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: data,
          time: endTime - startTime
        }
      }
    });

    return data;
  };

  return { fetchData };
};

// Example 3: Using logger with POST request
export const CreateUserComponent = () => {
  const logger = useAPILogger();

  const createUser = async (userData: any) => {
    const requestPayload = {
      method: 'POST',
      url: 'https://api.example.com/users',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    };

    logger.logRequest({
      request: {
        payload: requestPayload
      },
      tag: {
        operation: 'create-user',
        timestamp: Date.now()
      }
    });

    const response = await fetch(requestPayload.url, {
      method: requestPayload.method,
      headers: requestPayload.headers,
      body: requestPayload.body
    });

    const responseData = await response.json();

    logger.logResponse({
      response: {
        payload: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseData,
          time: 150
        }
      },
      tag: {
        operation: 'create-user',
        success: response.ok
      }
    });

    return responseData;
  };

  return (
    <button onClick={() => createUser({ name: 'John Doe', email: 'john@example.com' })}>
      Create User
    </button>
  );
};

// Example 4: Custom EventLogger implementation for different platforms
import { EventLogger, APIClientEvent } from './eventLogger';

export class ConsoleLogger extends EventLogger {
  pushEvent(event: APIClientEvent): void {
    console.log('Event logged:', event);
  }
}

export class RemoteLogger extends EventLogger {
  private endpoint: string;

  constructor(endpoint: string) {
    super();
    this.endpoint = endpoint;
  }

  pushEvent(event: APIClientEvent): void {
    // Send events to remote server
    fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(err => console.error('Failed to log event:', err));
  }
}

// Usage of custom loggers
const consoleLogger = new ConsoleLogger();
consoleLogger.logRequest({
  request: {
    payload: {
      method: 'GET',
      url: 'https://api.example.com/data',
      headers: {},
      body: null
    }
  }
});

const remoteLogger = new RemoteLogger('https://logging-service.com/events');
remoteLogger.logResponse({
  response: {
    payload: {
      status: 200,
      statusText: 'OK',
      headers: {},
      body: { data: 'result' },
      time: 100
    }
  },
  tag: { environment: 'production' }
});
