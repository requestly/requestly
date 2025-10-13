export namespace AIChat {
  export type Role = "system" | "user" | "model";

  export enum ActionType {
    CREATE_REQUEST = "create_request",
    CREATE_COLLECTION = "create_collection",
    CREATE_ENVIRONMENT = "create_environment",
  }

  // TEMPORARY: This will be replaced with the actual action types
  export type Action = {
    type: ActionType;
    payload: any;
  };
  export type Message = {
    role: Role;
    text: string;
    createdAt: number;
  };

  export type UserMessage = Message;

  export type ModelMessage = Message & {
    actions: Action[];
  };

  export type Session = {
    id: string;
    messages: Message[];
  };

  export type SessionsMap = Record<Session["id"], Session>;
}
