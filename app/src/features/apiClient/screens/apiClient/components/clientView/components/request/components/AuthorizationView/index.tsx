import { Select } from "antd";
import { debounce, isEmpty } from "lodash";
import { useState } from "react";
import AuthorizationForm from "./AuthorizationForm";
import Description from "./Description";
import {
  AUTHORIZATION_FORM_DATA,
  AUTHORIZATION_STATIC_DATA,
  AUTHORIZATION_TYPES,
  AUTHORIZATION_TYPES_META,
} from "./authStaticData";
import React from "react";
import "./authorizationView.scss";
import { LABEL_TEXT } from "./authConstants";
import { AiOutlineExclamationCircle } from "@react-icons/all-files/ai/AiOutlineExclamationCircle";
import { MdClear } from "@react-icons/all-files/md/MdClear";

interface Props {
  prefillAuthValues: {};
  handleAuthChange: (authType: string, id?: string, value?: string) => void;
}

const AuthorizationView: React.FC<Props> = ({ prefillAuthValues, handleAuthChange }) => {
  const [selectedForm, setSelectedForm] = useState(prefillAuthValues?.currentAuthType || AUTHORIZATION_TYPES.NO_AUTH);
  const [formValues, setFormValues] = useState<Record<string, any>>(prefillAuthValues?.authOptions || {});

  const onChangeHandler = (value: string, id: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [selectedForm]: {
        ...prevValues[selectedForm],
        [id]: value,
      },
    }));

    handleAuthChange(selectedForm, id, value);
  };

  const debouncedOnChange = debounce(onChangeHandler, 500);

  return (
    <div className="authorization-view">
      <div className="type-of-authorization">
        <div className="form-selector">
          <label>{LABEL_TEXT.AUTHORIZATION_TYPE_LABEL}</label>
          <Select
            className="form-selector-dropdown"
            value={selectedForm}
            onChange={(value) => {
              setSelectedForm(value);
              if (value === AUTHORIZATION_TYPES.NO_AUTH) {
                handleAuthChange(value);
              }
            }}
            options={AUTHORIZATION_TYPES_META}
          />
          {selectedForm !== AUTHORIZATION_TYPES.NO_AUTH && (
            <div
              className="clear-icon"
              onClick={() => {
                setSelectedForm(AUTHORIZATION_TYPES.NO_AUTH);
                handleAuthChange(AUTHORIZATION_TYPES.NO_AUTH);
              }}
            >
              <MdClear color="#bbbbbb" size="12px" />
              <span>{LABEL_TEXT.CLEAR}</span>
            </div>
          )}
        </div>
      </div>
      <div className="form-and-description">
        {!isEmpty(AUTHORIZATION_FORM_DATA[selectedForm]) && (
          <div className="form-view">
            <p className="info-text">
              <AiOutlineExclamationCircle size={"12px"} color="#8f8f8f" />
              <span>{LABEL_TEXT.INFO_TEXT}</span>
            </p>
            <AuthorizationForm
              formData={AUTHORIZATION_FORM_DATA[selectedForm]}
              formType={selectedForm}
              onChangeHandler={debouncedOnChange}
              formvalues={formValues[selectedForm] || {}}
            />
          </div>
        )}
        {!isEmpty(AUTHORIZATION_STATIC_DATA[selectedForm]?.description) && (
          <Description
            data={AUTHORIZATION_STATIC_DATA[selectedForm]?.description}
            wrapperClass={`${selectedForm === AUTHORIZATION_TYPES.NO_AUTH ? "no-auth" : ""}`}
          />
        )}
      </div>
    </div>
  );
};

export default AuthorizationView;
