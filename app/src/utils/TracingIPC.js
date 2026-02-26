import * as Sentry from "@sentry/react";

const extractTraceContext = () => {
  const activeSpan = Sentry.getActiveSpan();
  console.log("[TracingIPC] extractTraceContext called");
  console.log("[TracingIPC] activeSpan:", activeSpan);

  if (!activeSpan) {
    console.log("[TracingIPC] No active span found!");
    return null;
  }

  const traceContext = {
    "sentry-trace": Sentry.spanToTraceHeader(activeSpan),
    baggage: Sentry.spanToBaggageHeader(activeSpan),
  };

  console.log("[TracingIPC] Extracted trace context:", traceContext);
  return traceContext;
};

export const traceIPC = {
  invokeEventInMain: (eventName, payload) => {
    console.log(`[TracingIPC] invokeEventInMain called for: ${eventName}`);
    const traceContext = extractTraceContext();

    const newPayload = {
      ...payload,
      _traceContext: traceContext,
    };

    console.log(`[TracingIPC] Calling IPC with trace context:`, traceContext ? "✓ Present" : "✗ Missing");
    return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain(eventName, newPayload);
  },

  invokeEventInBG: (eventName, payload) => {
    const traceContext = extractTraceContext();
    console.log(`[TracingIPC] invokeEventInBG called for: ${eventName}`);

    // Handle array payloads (RPC calls) vs object payloads
    let newPayload;
    if (Array.isArray(payload)) {
      // For RPC calls, append trace context as last argument
      newPayload = [...payload, { _traceContext: traceContext }];
    } else {
      // For object payloads, spread and add trace context
      newPayload = {
        ...payload,
        _traceContext: traceContext,
      };
    }

    console.log(`[TracingIPC] Calling BG IPC with trace context:`, traceContext ? "✓ Present" : "✗ Missing");
    return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG(eventName, newPayload);
  },
};
