import { Select } from "antd";
import { debounce } from "lodash";
import { useCallback, useState } from "react";
import AuthorizationForm from "./AuthorizationForm";
import Description from "./Description";
import { AUTHORIZATION_FORM_DATA, AUTHORIZATION_STATIC_DATA, AUTHORIZATION_TYPE_OPTIONS } from "./authStaticData";
import React from "react";
import { AUTHORIZATION_TYPES } from "./types";
import NoAuthBanner from "./NoAuthBanner";
import { AUTH_OPTIONS } from "./types/form";
import { getEmptyAuthOptions } from "features/apiClient/screens/apiClient/utils";

// interface NewAuthorizationViewProps {
//   defaultValues: {
//     currentAuthType?: AUTHORIZATION_TYPES;
//     authData?: AUTH_OPTIONS; // todo: could be empty, need to check // also need to add inherit from parent later
//   };
//   onAuthUpdate: (currentAuthType: AUTHORIZATION_TYPES, newAuth: AUTH_OPTIONS) => any;
// }


interface FixAuthorizationViewProps {
  defaultValues: {
    currentAuthType?: AUTHORIZATION_TYPES;
    authData?: AUTH_OPTIONS; 
  };
  onAuthUpdate: (currentAuthType: AUTHORIZATION_TYPES, updatedKey: string, updatedValue: string) => any;
}

const AuthorizationView: React.FC<FixAuthorizationViewProps> = ({
  defaultValues,
  onAuthUpdate,
}) => {
  const [currentAuthType, setCurrentAuthType] = useState(defaultValues?.currentAuthType || AUTHORIZATION_TYPES.NO_AUTH);
  const [authData, setAuthData] = useState<AUTH_OPTIONS>(defaultValues?.authData || getEmptyAuthOptions());

  const handleUserInput = useCallback(
    (value: string, id: string) => { // todo: rename this id and value to something more meaningful

      setAuthData((prevAuthData) => {
        return {
          ...prevAuthData,
          [currentAuthType]: {
            ...prevAuthData[currentAuthType],
            [id]: value,
          },
        };
      });
      onAuthUpdate(currentAuthType, id, value);
    },
    [onAuthUpdate, currentAuthType]
  );

  const handleAuthTypeChange = useCallback((newAuthType: AUTHORIZATION_TYPES) => {
    setCurrentAuthType(newAuthType);
    onAuthUpdate(newAuthType, '', '');
  }, [onAuthUpdate]);

  const debouncedOnChange = debounce(handleUserInput, 500);

  return (
    <div className="authorization-view">
      <div className="type-of-authorization">
        <div className="form-selector">
          <label>Authorization Type</label>
          <Select
            className="form-selector-dropdown"
            value={currentAuthType}
            onChange={handleAuthTypeChange}
            options={AUTHORIZATION_TYPE_OPTIONS}
          />
        </div>
      </div>
      <div className="form-and-description">
        {currentAuthType === AUTHORIZATION_TYPES.NO_AUTH ? (
          <NoAuthBanner />
        ) : (
          <>
            <div className="form-view">
              <AuthorizationForm
                formData={AUTHORIZATION_FORM_DATA[currentAuthType]}
                formType={currentAuthType}
                onChangeHandler={debouncedOnChange}
                formvalues={authData[currentAuthType]}
              />
            </div>
            <Description data={AUTHORIZATION_STATIC_DATA[currentAuthType]?.description} />
          </>
        )}
      </div>
    </div>
  );
};

export default AuthorizationView;
