export const demoAiResponse = {
  data: {
    text:
      'Of course. To get all the comments on a post from the Stack Overflow API, you would use one of the following API endpoints:\n\n*   `/posts/{ids}/comments`: to get comments on a set of posts (questions or answers)\n*   `/questions/{ids}/comments`: to get comments on a set of questions\n*   `/answers/{ids}/comments`: to get comments on a set of answers\n\nYou will need to provide the ID of the post you want to get the comments from. For example, to get the comments on the question with the ID `11227809`, you would make a GET request to the following URL:\n\n`https://api.stackexchange.com/2.3/questions/11227809/comments?site=stackoverflow`\n\nThis will return a JSON object containing a list of all the comments on that question, with the most recent comments first.\n\nHere is a `curl` command that you can use to make this request:\n\n`curl -X GET "https://api.stackexchange.com/2.3/questions/11227809/comments?site=stackoverflow" --compressed`\n\nThis will return a JSON object with a list of all the comments on the question, including the comment body, the author\'s display name, and the score of the comment.\n\nI hope this helps! Let me know if you have any other questions.',
    actions: [
      {
        type: "TRY_IN_EDITOR",
        payload: {
          openapi: "3.0.3",
          info: {
            title: "Stack Exchange API (Stack Overflow)",
            version: "2.3",
            description:
              "API for accessing data from Stack Overflow and other Stack Exchange sites. This spec focuses on common read-only operations for Stack Overflow.",
          },
          servers: [
            {
              url: "https://api.stackexchange.com/2.3",
            },
          ],
          paths: {
            "/search/advanced": {
              get: {
                summary: "Search Stack Overflow for questions",
                description:
                  "Performs an advanced search for questions on Stack Overflow, allowing for filtering by tags, keywords, and more.",
                tags: ["Search"],
                parameters: [
                  {
                    name: "site",
                    in: "query",
                    required: true,
                    schema: {
                      type: "string",
                      default: "stackoverflow",
                    },
                    description: "The Stack Exchange site to search on.",
                  },
                  {
                    name: "q",
                    in: "query",
                    schema: {
                      type: "string",
                    },
                    description: "A free text query.",
                  },
                  {
                    name: "tagged",
                    in: "query",
                    schema: {
                      type: "string",
                    },
                    description: "A semicolon-delimited list of tags that must be on the questions.",
                  },
                  {
                    name: "sort",
                    in: "query",
                    schema: {
                      type: "string",
                      default: "activity",
                      enum: ["activity", "votes", "creation", "relevance"],
                    },
                    description: "How to sort the results.",
                  },
                  {
                    name: "order",
                    in: "query",
                    schema: {
                      type: "string",
                      default: "desc",
                      enum: ["asc", "desc"],
                    },
                    description: "The direction of the sort.",
                  },
                  {
                    $ref: "#/components/parameters/PageSize",
                  },
                  {
                    $ref: "#/components/parameters/Filter",
                  },
                  {
                    $ref: "#/components/parameters/ApiKey",
                  },
                ],
                responses: {
                  "200": {
                    description: "A list of questions matching the search criteria.",
                    content: {
                      "application/json": {
                        schema: {
                          $ref: "#/components/schemas/QuestionListWrapper",
                        },
                        example: {
                          items: [
                            {
                              tags: ["javascript", "reactjs", "api"],
                              owner: {
                                account_id: 123,
                                reputation: 101,
                                user_id: 456,
                                user_type: "registered",
                                profile_image: "https://i.stack.imgur.com/....jpg",
                                display_name: "Example User",
                                link: "https://stackoverflow.com/users/456/example-user",
                              },
                              is_answered: true,
                              view_count: 42,
                              answer_count: 1,
                              score: 5,
                              last_activity_date: 1678886400,
                              creation_date: 1678882800,
                              question_id: 1234567,
                              content_license: "CC BY-SA 4.0",
                              link: "https://stackoverflow.com/questions/1234567/example-question-title",
                              title: "Example question title",
                            },
                          ],
                          has_more: true,
                          quota_max: 10000,
                          quota_remaining: 9998,
                        },
                      },
                    },
                  },
                },
              },
            },
            "/questions/{ids}": {
              get: {
                summary: "Get details for specific questions",
                description: "Retrieves detailed information about a set of questions, identified by their IDs.",
                tags: ["Questions"],
                parameters: [
                  {
                    name: "ids",
                    in: "path",
                    required: true,
                    schema: {
                      type: "string",
                    },
                    description: "A semicolon-delimited list of question IDs.",
                  },
                  {
                    name: "site",
                    in: "query",
                    required: true,
                    schema: {
                      type: "string",
                      default: "stackoverflow",
                    },
                    description: "The Stack Exchange site to query.",
                  },
                  {
                    $ref: "#/components/parameters/Filter",
                  },
                  {
                    $ref: "#/components/parameters/ApiKey",
                  },
                ],
                responses: {
                  "200": {
                    description: "A list of the requested questions.",
                    content: {
                      "application/json": {
                        schema: {
                          $ref: "#/components/schemas/QuestionListWrapper",
                        },
                      },
                    },
                  },
                },
              },
            },
            "/users/{ids}": {
              get: {
                summary: "Get profiles for specific users",
                description: "Retrieves profile information for a set of users, identified by their IDs.",
                tags: ["Users"],
                parameters: [
                  {
                    name: "ids",
                    in: "path",
                    required: true,
                    schema: {
                      type: "string",
                    },
                    description: "A semicolon-delimited list of user IDs.",
                  },
                  {
                    name: "site",
                    in: "query",
                    required: true,
                    schema: {
                      type: "string",
                      default: "stackoverflow",
                    },
                    description: "The Stack Exchange site to query.",
                  },
                  {
                    $ref: "#/components/parameters/Filter",
                  },
                  {
                    $ref: "#/components/parameters/ApiKey",
                  },
                ],
                responses: {
                  "200": {
                    description: "A list of the requested users.",
                    content: {
                      "application/json": {
                        schema: {
                          $ref: "#/components/schemas/UserListWrapper",
                        },
                        example: {
                          items: [
                            {
                              badge_counts: {
                                bronze: 50,
                                silver: 30,
                                gold: 5,
                              },
                              account_id: 123,
                              is_employee: false,
                              last_modified_date: 1678886400,
                              last_access_date: 1678887000,
                              reputation_change_year: 2000,
                              reputation_change_quarter: 500,
                              reputation_change_month: 100,
                              reputation_change_week: 20,
                              reputation_change_day: 5,
                              reputation: 10500,
                              creation_date: 1577836800,
                              user_type: "registered",
                              user_id: 456,
                              location: "Example City",
                              website_url: "http://example.com",
                              link: "https://stackoverflow.com/users/456/example-user",
                              profile_image: "https://i.stack.imgur.com/....jpg",
                              display_name: "Example User",
                            },
                          ],
                          has_more: false,
                          quota_max: 10000,
                          quota_remaining: 9997,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          components: {
            schemas: {
              QuestionListWrapper: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Question",
                    },
                  },
                  has_more: {
                    type: "boolean",
                  },
                  quota_max: {
                    type: "integer",
                  },
                  quota_remaining: {
                    type: "integer",
                  },
                },
              },
              UserListWrapper: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                  has_more: {
                    type: "boolean",
                  },
                  quota_max: {
                    type: "integer",
                  },
                  quota_remaining: {
                    type: "integer",
                  },
                },
              },
              Question: {
                type: "object",
                properties: {
                  tags: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  owner: {
                    $ref: "#/components/schemas/ShallowUser",
                  },
                  is_answered: {
                    type: "boolean",
                  },
                  view_count: {
                    type: "integer",
                  },
                  answer_count: {
                    type: "integer",
                  },
                  score: {
                    type: "integer",
                  },
                  creation_date: {
                    type: "integer",
                    format: "int64",
                  },
                  question_id: {
                    type: "integer",
                  },
                  link: {
                    type: "string",
                    format: "uri",
                  },
                  title: {
                    type: "string",
                  },
                },
              },
              User: {
                type: "object",
                properties: {
                  badge_counts: {
                    type: "object",
                    properties: {
                      bronze: {
                        type: "integer",
                      },
                      silver: {
                        type: "integer",
                      },
                      gold: {
                        type: "integer",
                      },
                    },
                  },
                  reputation: {
                    type: "integer",
                  },
                  user_id: {
                    type: "integer",
                  },
                  location: {
                    type: "string",
                  },
                  website_url: {
                    type: "string",
                  },
                  link: {
                    type: "string",
                    format: "uri",
                  },
                  profile_image: {
                    type: "string",
                    format: "uri",
                  },
                  display_name: {
                    type: "string",
                  },
                },
              },
              ShallowUser: {
                type: "object",
                properties: {
                  reputation: {
                    type: "integer",
                  },
                  user_id: {
                    type: "integer",
                  },
                  user_type: {
                    type: "string",
                  },
                  profile_image: {
                    type: "string",
                    format: "uri",
                  },
                  display_name: {
                    type: "string",
                  },
                  link: {
                    type: "string",
                    format: "uri",
                  },
                },
              },
            },
            parameters: {
              PageSize: {
                name: "pagesize",
                in: "query",
                description: "The number of results to return per page.",
                schema: {
                  type: "integer",
                  minimum: 0,
                  maximum: 100,
                  default: 30,
                },
              },
              Filter: {
                name: "filter",
                in: "query",
                description:
                  "A filter to control which fields are returned by the API. See API documentation for details.",
                schema: {
                  type: "string",
                  default: "default",
                },
              },
              ApiKey: {
                name: "key",
                in: "query",
                description: "An API key obtained from stackapps.com to increase the request quota.",
                schema: {
                  type: "string",
                },
              },
              AccessToken: {
                name: "access_token",
                in: "query",
                description: "An OAuth 2.0 access token for making authenticated requests.",
                schema: {
                  type: "string",
                },
              },
            },
            securitySchemes: {
              ApiKeyAuth: {
                type: "apiKey",
                name: "key",
                in: "query",
              },
              OAuth2Auth: {
                type: "apiKey",
                in: "query",
                name: "access_token",
                description:
                  "Stack Exchange API uses a custom implementation where the OAuth 2.0 access token is passed as a query parameter.",
              },
            },
          },
          security: [
            {
              ApiKeyAuth: [],
            },
          ],
        },
      },
    ],
  },
};
