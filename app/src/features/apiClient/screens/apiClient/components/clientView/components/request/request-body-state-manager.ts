import { createContext, useEffect, useState } from "react";

import { KeyValuePair } from "features/apiClient/types";
import { RQAPI } from "../../../../../../types";

/**
 * This class maintains body state for different content types.
 */
export class RequestBodyStateManager {
  private text: string;
  private formUrlEncoded: KeyValuePair[];
  private multipartForm: KeyValuePair[];

  constructor(params: RQAPI.RequestBodyContainer) {
    // defaults are set since some databases like firestore don't handle "undefined"
    this.text = params?.text || "";
    this.formUrlEncoded = params?.formURLEncoded || [];
    this.multipartForm = params?.multipartForm || [];
  }

  setText(text: string) {
    this.text = text;
  }

  setFormUrlEncoded(formUrlEncoded: KeyValuePair[]) {
    this.formUrlEncoded = formUrlEncoded;
  }

  setMultiPartForm(multipartForm: KeyValuePair[]) {
    this.multipartForm = multipartForm;
  }

  getText() {
    return this.text;
  }

  getFormUrlEncoded() {
    return this.formUrlEncoded;
  }

  getMultiPartForm() {
    return this.multipartForm;
  }

  serialize(): RQAPI.RequestBodyContainer {
    return {
      text: this.text,
      formURLEncoded: this.formUrlEncoded,
      multipartForm: this.multipartForm,
    };
  }
}

/**
 * This is a utility hook which enables syncing react state and 'RequestBodyStateManager'
 */
export function useFormUrlEncodedBody(requestBodyStateManager: RequestBodyStateManager) {
  // can face issue in form parameters
  const [formUrlEncodedBody, _setFormUrlEncodedBody] = useState<RQAPI.RequestFormBody>(
    requestBodyStateManager.getFormUrlEncoded() || []
  );
  return {
    formUrlEncodedBody,
    setFormUrlEncodedBody(form: RQAPI.RequestFormBody) {
      requestBodyStateManager.setFormUrlEncoded(form);
      _setFormUrlEncodedBody(form);
    },
  };
}

/**
 * This is a utility hook which enables syncing react state and 'RequestBodyStateManager'
 */
export function useMultiPartFormBody(requestBodyStateManager: RequestBodyStateManager) {
  const [multipartFormBody, _setMultiPartFormBody] = useState<RQAPI.RequestFormBody>(
    requestBodyStateManager.getMultiPartForm() || []
  );
  return {
    multipartFormBody,
    setMultiPartFormBody(form: RQAPI.RequestFormBody) {
      requestBodyStateManager.setMultiPartForm(form);
      _setMultiPartFormBody(form);
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
