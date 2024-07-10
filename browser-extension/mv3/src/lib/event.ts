class Event {
  private listeners: Function[] = [];

  /**
   * @param listener: Accepts a method which is listend
   * @returns: Returns unsub method which can be called to remove the listener
   */
  addListener = (listener: Function): Function => {
    const i = this.listeners.push(listener);
    console.debug({ newLength: i, listeners: this.listeners });

    return () => {
      this.removeListener(listener);
    };
  };

  removeListener = (listenerToRemove: Function) => {
    if (!this.listeners) return;

    this.listeners = this.listeners.filter((listener) => {
      if (listener === listenerToRemove) {
        console.debug("Listener Removed");
        return true;
      }
      return false;
    });
  };
}

export default Event;
