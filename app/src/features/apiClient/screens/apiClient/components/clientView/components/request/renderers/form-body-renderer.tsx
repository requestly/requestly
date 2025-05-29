import { EnvironmentVariables } from "backend/environment/types";
import { KeyValuePair, RequestContentType } from "features/apiClient/types";
import { useCallback, useContext } from "react";
import { RequestBodyContext, useFormUrlEncodedBody, useMultiPartFormBody } from "../request-body-state-manager";
import { RequestBodyProps } from "../request-body-types";
import { KeyValueTable } from "../components/KeyValueTable/KeyValueTable";

export function FormBody(props: {
  environmentVariables: EnvironmentVariables;
  setRequestEntry: RequestBodyProps["setRequestEntry"];
  contentType: RequestContentType;
}) {
  const { environmentVariables, setRequestEntry } = props;
  const { requestBodyStateManager } = useContext(RequestBodyContext);
  //const { formBody, setFormBody } = useFormBody(requestBodyStateManager);
  const { formUrlEncodedBody, setFormUrlEncodedBody } = useFormUrlEncodedBody(requestBodyStateManager);
  const { multipartFormBody, setMultiPartFormBody } = useMultiPartFormBody(requestBodyStateManager);

  const handleFormUrlEncodedChange = useCallback(
    (updatedPairs: KeyValuePair[]) => {
      setRequestEntry((prev) => {
        setFormUrlEncodedBody(updatedPairs);
        return {
          ...prev,
          request: {
            ...prev.request,
            body: updatedPairs,
            bodyContainer: requestBodyStateManager.serialize(),
          },
        };
      });
    },
    [setRequestEntry, setFormUrlEncodedBody, requestBodyStateManager]
  );

  //complete this
  const handleMultipartFormChange = useCallback(
    (updatedPairs: KeyValuePair[]) => {
      setRequestEntry((prev) => {
        setMultiPartFormBody(updatedPairs);
        return {
          ...prev,
          request: {
            ...prev.request,
            body: updatedPairs,
            bodyContainer: requestBodyStateManager.serialize(),
          },
        };
      });
    },
    [requestBodyStateManager, setMultiPartFormBody, setRequestEntry]
  );

  if (RequestContentType.MULTIPART_FORM === props.contentType) {
    return (
      <KeyValueTable
        data={multipartFormBody}
        variables={environmentVariables}
        onChange={handleMultipartFormChange}
        isMultipartForm={true}
      />
    );
  }
  return (
    <KeyValueTable
      data={formUrlEncodedBody}
      variables={environmentVariables}
      onChange={handleFormUrlEncodedChange}
      isMultipartForm={false}
    />
  );
}
