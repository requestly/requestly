import { createContext, useEffect, useState } from "react";

import { KeyValuePair } from "features/apiClient/types";
import { RQAPI } from "../../../../../../types";

/**
 * This class maintains body state for different content types.
 */
export class RequestBodyStateManager {
  private text: string;
  private form: KeyValuePair[];

  constructor(params: RQAPI.RequestBodyContainer) {
    // defaults are set since some databases like firestore don't handle "undefined"
    this.text = params?.text || "";
    this.form = params?.form || [];
  }

  setText(text: string) {
    this.text = text;
  }

  setForm(form: KeyValuePair[]) {
    this.form = form;
  }

  getText() {
    return this.text;
  }

  getForm() {
    return this.form;
  }

  serialize(): RQAPI.RequestBodyContainer {
    return {
      text: this.text,
      form: this.form,
    };
  }
}

/**
 * This is a utility hook which enables syncing react state and 'RequestBodyStateManager'
 */
export function useFormBody(requestBodyStateManager: RequestBodyStateManager) {
  const [formBody, _setFormBody] = useState<RQAPI.RequestFormBody>(requestBodyStateManager.getForm() || []);
  return {
    formBody,
    setFormBody(form: RQAPI.RequestFormBody) {
      requestBodyStateManager.setForm(form);
      _setFormBody(form);
    },
  };
}

/**
 * This is a utility hook which enables syncing react state and 'RequestBodyStateManager'
 */
export function useTextBody(requestBodyStateManager: RequestBodyStateManager) {
  const [text, _setText] = useState<string>(requestBodyStateManager.getText());

  useEffect(() => {
    _setText(requestBodyStateManager.getText());
  }, [requestBodyStateManager]);

  return {
    text,
    setText(text: string) {
      requestBodyStateManager.setText(text);
      _setText(text);
    },
  };
}

export const RequestBodyContext = createContext<{
  requestBodyStateManager: RequestBodyStateManager;
}>({
  requestBodyStateManager: new RequestBodyStateManager({}),
});
