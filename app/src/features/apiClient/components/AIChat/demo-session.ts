import { AIChat } from "./types";

// Demo session object based on AIChat types
const demoSession: AIChat.Session = {
  id: "demo-session-003",
  messages: [
    {
      role: "system",
      text:
        "Hello! I'm your AI assistant for API testing. I can help you create requests, collections, and environments. What would you like to work on today?",
      actions: [],
      createdAt: Date.now() - 300000, // 5 minutes ago
    },
    {
      role: "user",
      text: "I need to test a POST request to create a new user account",
      actions: [],
      createdAt: Date.now() - 240000, // 4 minutes ago
    },
    {
      role: "model",
      text:
        "I'll help you create a POST request for user account creation. Let me set up the request with common fields like name, email, and password.",
      actions: [
        {
          type: "create_request",
          payload: {
            method: "POST",
            url: "https://api.example.com/users",
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              name: "{{name}}",
              email: "{{email}}",
              password: "{{password}}",
            },
          },
        },
      ],
      createdAt: Date.now() - 180000, // 3 minutes ago
    },
    {
      role: "user",
      text: "Can you also create a collection to organize this request?",
      actions: [],
      createdAt: Date.now() - 120000, // 2 minutes ago
    },
    {
      role: "model",
      text: "Absolutely! I'll create a collection called 'User Management' to organize your user-related requests.",
      actions: [
        {
          type: "create_collection",
          payload: {
            name: "User Management",
            description: "Collection for user account management requests",
            requests: ["demo-request-001"],
          },
        },
      ],
      createdAt: Date.now() - 60000, // 1 minute ago
    },
    {
      role: "user",
      text: "Perfect! Now I need an environment with test data",
      actions: [],
      createdAt: Date.now() - 30000, // 30 seconds ago
    },
    {
      role: "model",
      text: "I'll create a test environment with sample user data for you to use in your requests.",
      actions: [
        {
          type: "create_environment",
          payload: {
            name: "Test Environment",
            variables: {
              name: "John Doe",
              email: "john.doe@example.com",
              password: "securePassword123",
              baseUrl: "https://api.example.com",
            },
          },
        },
      ],
      createdAt: Date.now() - 30000, // 30 seconds ago
    },
    {
      role: "user",
      text: "Great! Can you also help me test the login endpoint?",
      actions: [],
      createdAt: Date.now() - 25000, // 25 seconds ago
    },
    {
      role: "model",
      text:
        "Of course! I'll create a login request that uses the email and password from your environment. This will test the authentication flow.",
      actions: [
        {
          type: "create_request",
          payload: {
            method: "POST",
            url: "{{baseUrl}}/auth/login",
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              email: "{{email}}",
              password: "{{password}}",
            },
          },
        },
      ],
      createdAt: Date.now() - 20000, // 20 seconds ago
    },
    {
      role: "user",
      text: "What about error handling? How do I test different scenarios?",
      actions: [],
      createdAt: Date.now() - 15000, // 15 seconds ago
    },
    {
      role: "model",
      text:
        "Great question! You can test various scenarios by creating different requests with invalid data. For example, I can create requests with:\n\n• Invalid email formats\n• Wrong passwords\n• Missing required fields\n• Rate limiting scenarios\n\nWould you like me to create some of these test cases for you?",
      actions: [],
      createdAt: Date.now() - 10000, // 10 seconds ago
    },
    {
      role: "user",
      text: "Yes, please create a few error test cases",
      actions: [],
      createdAt: Date.now() - 5000, // 5 seconds ago
    },
    {
      role: "model",
      text: "Perfect! I'll create several error test cases to help you validate your API's error handling:",
      actions: [],
      createdAt: Date.now(),
    },
  ],
};

// Demo sessions map
const demoSessionsMap: AIChat.SessionsMap = {
  "demo-session-003": demoSession,
  "demo-session-002": {
    id: "demo-session-002",
    messages: [
      {
        role: "system",
        text: "Welcome to another session! I'm here to help with your API testing needs.",
        actions: [],
        createdAt: Date.now() - 600000, // 10 minutes ago
      },
      {
        role: "user",
        text: "I need help with authentication requests",
        actions: [],
        createdAt: Date.now() - 540000, // 9 minutes ago
      },
      {
        role: "model",
        text:
          "I can help you set up authentication requests! What type of authentication are you using? JWT tokens, OAuth, API keys, or basic auth?",
        actions: [],
        createdAt: Date.now() - 480000, // 8 minutes ago
      },
      {
        role: "user",
        text: "We're using JWT tokens. I need to test both login and token refresh endpoints",
        actions: [],
        createdAt: Date.now() - 420000, // 7 minutes ago
      },
      {
        role: "model",
        text:
          "Perfect! I'll create both endpoints for you. The login will return a JWT token, and the refresh endpoint will generate a new token using the refresh token.",
        actions: [
          {
            type: "create_request",
            payload: {
              method: "POST",
              url: "https://api.example.com/auth/login",
              headers: {
                "Content-Type": "application/json",
              },
              body: {
                username: "{{username}}",
                password: "{{password}}",
              },
            },
          },
          {
            type: "create_request",
            payload: {
              method: "POST",
              url: "https://api.example.com/auth/refresh",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer {{refreshToken}}",
              },
            },
          },
        ],
        createdAt: Date.now() - 360000, // 6 minutes ago
      },
      {
        role: "user",
        text: "How do I test protected endpoints that require the JWT token?",
        actions: [],
        createdAt: Date.now() - 300000, // 5 minutes ago
      },
      {
        role: "model",
        text:
          "Great question! For protected endpoints, you'll need to include the JWT token in the Authorization header. I can create a request template that automatically uses the token from your login response.",
        actions: [
          {
            type: "create_request",
            payload: {
              method: "GET",
              url: "https://api.example.com/users/profile",
              headers: {
                Authorization: "Bearer {{accessToken}}",
              },
            },
          },
        ],
        createdAt: Date.now() - 240000, // 4 minutes ago
      },
      {
        role: "user",
        text: "Can you also create a collection for all these auth-related requests?",
        actions: [],
        createdAt: Date.now() - 180000, // 3 minutes ago
      },
      {
        role: "model",
        text:
          "Absolutely! I'll create an 'Authentication' collection to organize all your auth-related requests in one place.",
        actions: [
          {
            type: "create_collection",
            payload: {
              name: "Authentication",
              description: "Collection for authentication and authorization requests",
              requests: ["auth-login", "auth-refresh", "protected-endpoint"],
            },
          },
        ],
        createdAt: Date.now() - 120000, // 2 minutes ago
      },
      {
        role: "user",
        text: "Perfect! This will help me test the complete authentication flow",
        actions: [],
        createdAt: Date.now() - 60000, // 1 minute ago
      },
      {
        role: "model",
        text:
          "Exactly! You now have a complete authentication testing setup. You can test the full flow: login → get token → use token for protected endpoints → refresh token when needed. Is there anything else you'd like to add to your API testing suite?",
        actions: [],
        createdAt: Date.now(),
      },
    ],
  },
};

export { demoSession, demoSessionsMap };
