import { JsonEditor as Editor } from "jsoneditor-react";
import { useEffect, useRef, useState } from "react";

/**
 * The JSON Editor component used here does not handle the
 * states properly. Hence we have to separately handle both
 * the modifiedData state as well as the currentData state
 *
 * The logic for handling these is in the useEffects should
 * be in the parent component
 * (Refer RequestBodyPreview.js if using elsewhere)
 */
const JsonPreview = ({ data, updateAllowed, setModifiedData, setIsValid }) => {
  const jsonEditorRef = useRef(null);
  const [dataObj, setDataObj] = useState({});
  useEffect(() => {
    if (jsonEditorRef) {
      try {
        const _dataObj = JSON.parse(data);
        jsonEditorRef.current.update(_dataObj);
        setDataObj(_dataObj);
      } catch (err) {
        // console.log("Not a valid json");
      }
    }
  }, [jsonEditorRef, data]);

  const jsonUpdateHandler = (currentJson) => {
    setModifiedData(JSON.stringify(currentJson));
  };

  const setRef = (instance) => {
    if (instance) {
      jsonEditorRef.current = instance.jsonEditor;
    } else {
      jsonEditorRef.current = null;
    }
  };

  const setValidity = (errors) => {
    if (errors && errors.length > 0) setIsValid(false);
    else setIsValid(true);
  };

  // onEditable is true for now as JsonEditor doesn't support dynamic onEditable
  // https://github.com/josdejong/jsoneditor/issues/1386
  if (dataObj) {
    return (
      <Editor
        ref={setRef}
        // ref={jsonEditorRef}
        value={dataObj}
        onChange={jsonUpdateHandler}
        allowedModes={["tree", "text"]}
        mode="tree"
        search={true}
        onEditable={() => true}
        htmlElementProps={{ style: { height: "95%", color: "black" } }}
        onValidationError={setValidity}
      />
    );
  } else {
    return <h3>Not a valid json</h3>;
  }
};

export default JsonPreview;
