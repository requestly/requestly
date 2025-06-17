class Box {
  private handlers: Function[] = [];
  private registeredHandlers: Map<string, Function> = new Map();

  addHandler(fn: Function) {
    this.handlers.push(fn);
  }

  registerHandler(id: string) {
    const handler = this.handlers.pop();
    if (!handler) {
      return;
    }

    this.registeredHandlers.set(id, handler);
  }

  invokeHandler(id: string) {
    const handler = this.registeredHandlers.get(id);
    if (!handler) {
      return;
    }

    handler(id);
  }
}

export const box = new Box();
