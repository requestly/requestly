import { createContext, useEffect, useState } from "react";

import { KeyValuePair } from "features/apiClient/types";
import { RQAPI } from "../../../../../../types";

/**
 * This class maintains body state for different content types.
 */
export class RequestBodyStateManager {
  private text: string;
  private form: KeyValuePair[];
  private multiPartForm: RQAPI.FormDataKeyValuePair[];

  constructor(params: RQAPI.RequestBodyContainer) {
    // defaults are set since some databases like firestore don't handle "undefined"
    this.text = params?.text || "";
    this.form = params?.form || [];
    this.multiPartForm = params?.multiPartForm || [];
  }

  setText(text: string) {
    this.text = text;
  }

  setForm(form: KeyValuePair[]) {
    this.form = form;
  }

  setMultiPartForm(multiPartForm: RQAPI.FormDataKeyValuePair[]) {
    this.multiPartForm = multiPartForm;
  }

  getText() {
    return this.text;
  }

  getForm() {
    return this.form;
  }

  getMultiPartForm() {
    return this.multiPartForm;
  }

  serialize(): RQAPI.RequestBodyContainer {
    return {
      text: this.text,
      form: this.form,
      multiPartForm: this.multiPartForm,
    };
  }
}

/**
 * This is a utility hook which enables syncing react state and 'RequestBodyStateManager'
 */
export function useMultiPartFormBody(requestBodyStateManager: RequestBodyStateManager) {
  const [multiPartForm, _setMultiPartFormBody] = useState<RQAPI.MultipartFormBody>(
    requestBodyStateManager.getMultiPartForm() || []
  );
  return {
    multiPartForm,
    setMultiPartForm(multipartForm: RQAPI.MultipartFormBody) {
      requestBodyStateManager.setMultiPartForm(multipartForm);
      _setMultiPartFormBody(multipartForm);
    },
  };
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
