class Event<CallbackType extends (...args: any[]) => void> {
  private listeners: CallbackType[] = [];

  /**
   * Registers an event listener callback to an event.
   * @param callback — Called when an event occurs. The parameters of this function depend on the type of event.
   * @returns: Returns unsub method which can be called to remove the listener
   */
  addListener = (callback: CallbackType): Function => {
    const i = this.listeners.push(callback);
    console.debug("[Event.addListener]", { newLength: i, listeners: this.listeners });

    return () => {
      this.removeListener(callback);
    };
  };

  removeListener = (listenerToRemove: CallbackType) => {
    if (!this.listeners) return;

    this.listeners = this.listeners.filter((listener) => {
      if (listener === listenerToRemove) {
        console.debug("[Event.removeListener] Listener Removed");
        return false;
      }
      return true;
    });
  };

  processListeners = (...args: Parameters<CallbackType>) => {
    console.debug("[Event.processListeners]", { listeners: this.listeners, args });
    if (this.listeners) {
      this.listeners.forEach((listener) => listener?.(...args));
    }
  };
}

export default Event;
