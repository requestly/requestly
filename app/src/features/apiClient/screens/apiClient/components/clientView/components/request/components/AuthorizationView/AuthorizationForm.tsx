import { Select } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQSingleLineEditor } from "features/apiClient/screens/environment/components/SingleLineEditor/SingleLineEditor";

const getFields = (field, index, currentEnvironmentVariables, formType, onChangeHandler, value) => {
  const { type = "", placeholder = "", options = [], id = "", defaultValue = "", className } = field;

  switch (type) {
    case "RQ_SINGLE_LINE_EDITOR":
      return (
        <RQSingleLineEditor
          key={`${formType}-${index}`}
          className={className}
          placeholder={placeholder}
          defaultValue={value}
          onChange={(value) => onChangeHandler(value, id)}
          variables={currentEnvironmentVariables}
        />
      );
    case "SELECT":
      return <Select value={value} options={options} defaultValue={defaultValue} className={className} />;
    default:
      break;
  }
};

const AuthorizationForm = ({ formData = [], formType = "", onChangeHandler, formvalues = {} }) => {
  const { getCurrentEnvironmentVariables } = useEnvironmentManager();
  const currentEnvironmentVariables = getCurrentEnvironmentVariables();

  return (
    <div className="form">
      {formData.map((formField, index) => (
        <div className="field-group">
          <label>{formField.label}</label>
          <div className="field">
            {getFields(
              formField,
              index,
              currentEnvironmentVariables,
              formType,
              onChangeHandler,
              formvalues[formField.id]
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorizationForm;
