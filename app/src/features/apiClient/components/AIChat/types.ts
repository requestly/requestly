export namespace AIChat {
  export type Role = "system" | "user" | "model";

  // TEMPORARY: This will be replaced with the actual action types
  export type Action = {
    type: "create_request" | "create_collection" | "create_environment";
    payload: any;
  };
  export type Message = {
    role: Role;
    text: string;
    actions: Action[];
    createdAt: number;
  };

  export type Session = {
    id: string;
    messages: Message[];
  };

  export type SessionsMap = Record<Session["id"], Session>;
}
