describe("sessionRecorder", () => {
  beforeEach(() => {
    window.DOM = [];
    window.runtimeMessageListener = null;
    window.messageEventListener = null;

    spyOn(window, "postMessage");
    spyOn(chrome.runtime.onMessage, "addListener").andCallFake((listener) => {
      window.runtimeMessageListener = listener;
    });
    spyOn(window, "addEventListener").andCallFake((event, listener) => {
      if (event === "message") {
        window.messageEventListener = listener;
      }
    });
    spyOn(RQ.SessionRecorder, "isIframe").andCallFake(() => false);
  });

  afterEach(() => {
    delete window.DOM;
    delete window.runtimeMessageListener;
    delete window.messageEventListener;
  });

  it("should start with initial state", () => {
    RQ.SessionRecorder.setup();
    expect(RQ.SessionRecorder.isInitialized).toBeFalsy();
    expect(RQ.SessionRecorder.isRecording).toBeFalsy();
    expect(RQ.SessionRecorder.isExplicitRecording).toBeFalsy();
    expect(Object.keys(RQ.SessionRecorder.sendResponseCallbacks).length).toBe(0);
  });

  it("should get config and start recording on setup", () => {
    const testSessionRecordingOptions = {
      config: { maxDuration: 10 },
      previousSession: { events: { rrweb: [{ type: "test" }] } },
      explicit: true,
    };

    spyOn(RQ.SessionRecorder, "sendMessageToClient");

    RQ.SessionRecorder.setup();

    waits(100);
    window.runtimeMessageListener({
      action: "startRecording",
      payload: testSessionRecordingOptions,
    });

    runs(() => {
      expect(RQ.SessionRecorder.sendMessageToClient).toHaveBeenCalledWith("startRecording", {
        relayEventsToTop: false,
        console: true,
        network: true,
        maxDuration: testSessionRecordingOptions.config.maxDuration * 60 * 1000,
        previousSession: testSessionRecordingOptions.previousSession,
      });
      expect(RQ.SessionRecorder.isExplicitRecording).toBe(testSessionRecordingOptions.explicit);
    });
  });

  it("should start recording correctly", async () => {
    RQ.SessionRecorder.setup();
    waits(100);
    await RQ.SessionRecorder.startRecording();

    runs(() => {
      expect(window.DOM[0]).toBe("chrome-extension://requestly/libs/requestly-web-sdk.js");

      expect(window.DOM[1]).toBe(`(${RQ.SessionRecorder.bootstrapClient.toString()})('__REQUESTLY__')`);

      expect(window.postMessage).toHaveBeenCalledWith(
        {
          source: "requestly:extension",
          action: "startRecording",
          payload: {
            relayEventsToTop: false,
            console: true,
            network: true,
            maxDuration: 5 * 60 * 1000,
          },
        },
        window.location.href
      );
    });
  });

  it("should return response to runtime", () => {
    const testAction = "testAction";
    const testRequestPayload = { key: "value1" };
    const testCallback = jasmine.createSpy();

    RQ.SessionRecorder.sendMessageToClient(testAction, testRequestPayload, testCallback);

    expect(RQ.SessionRecorder.sendResponseCallbacks[testAction]).toBe(testCallback);

    const testResponsePayload = { key: "value2" };
    RQ.SessionRecorder.sendResponseToRuntime(testAction, testResponsePayload);
    expect(testCallback).toHaveBeenCalledWith(testResponsePayload);
    expect(RQ.SessionRecorder.sendResponseCallbacks[testAction]).toBeUndefined();
  });

  it("should listen runtime and client events correctly", async () => {
    spyOn(chrome.runtime, "sendMessage").andCallFake((_, callback) => callback?.({}));

    RQ.SessionRecorder.setup();

    waits(100);
    await RQ.SessionRecorder.startRecording();

    runs(() => {
      expect(window.runtimeMessageListener).not.toBe(null);
      expect(window.messageEventListener).not.toBe(null);

      const testIsRecording1 = jasmine.createSpy();
      window.runtimeMessageListener({ action: "isRecordingSession" }, null, testIsRecording1);
      expect(testIsRecording1).toHaveBeenCalledWith(false);

      // client notifies content script that recording has started
      window.messageEventListener({
        source: window,
        data: {
          source: "requestly:client",
          action: "sessionRecordingStarted",
        },
      });
      const testIsRecording2 = jasmine.createSpy();
      window.runtimeMessageListener({ action: "isRecordingSession" }, null, testIsRecording2);
      expect(testIsRecording2).toHaveBeenCalledWith(true);

      const testSessionData = { events: { rrweb: [] } };
      const testGetSessionData = jasmine.createSpy();
      // extension asks content script for session data
      window.runtimeMessageListener({ action: "getTabSession" }, null, testGetSessionData);
      // client returns session data to content script
      window.messageEventListener({
        source: window,
        data: {
          source: "requestly:client",
          action: "getSessionData",
          response: true,
          payload: testSessionData,
        },
      });
      expect(testGetSessionData).toHaveBeenCalledWith(testSessionData);
    });
  });
});
