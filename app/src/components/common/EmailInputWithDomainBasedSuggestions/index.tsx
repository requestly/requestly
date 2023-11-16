import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import "react-multi-email/dist/style.css";
import { getDomainFromEmail, isCompanyEmail, isEmailValid } from "utils/FormattingHelper";
import CreatableSelect from "react-select/creatable";
import { MultiValue } from "react-select";

interface Props {
  onChange: (emails: string[]) => void;
  transparentBackground?: boolean;
}

const EmailInputWithDomainBasedSuggestions: React.FC<Props> = ({ onChange, transparentBackground = false }) => {
  const user = useSelector(getUserAuthDetails);
  const userEmail = user?.details?.profile?.email;

  const [allSuggestions, setAllSuggestions] = useState<string[]>([]);

  const getOrganizationUsers = useMemo(() => httpsCallable(getFunctions(), "users-getOrganizationUsers"), []);

  useEffect(() => {
    if (!isCompanyEmail(userEmail)) return;

    getOrganizationUsers({ domain: getDomainFromEmail(userEmail) }).then((res: any) => {
      const users = res.data.users;
      const emails = users.map((user: any) => user.email);
      setAllSuggestions(_.without(emails, userEmail));
    });
  }, [getOrganizationUsers, userEmail]);

  const optionsFromSuggestions = useMemo(() => {
    return allSuggestions.map((suggestion) => {
      return {
        label: suggestion,
        value: suggestion,
      };
    });
  }, [allSuggestions]);

  const handleEmailChange = useCallback(
    (
      emails: MultiValue<{
        label: string;
        value: string;
      }>
    ) => {
      const newEmails = emails.map((email) => email.value);
      onChange(newEmails);
    },
    [onChange]
  );

  const emailInputRef = useRef(null);

  return (
    <CreatableSelect
      isMulti={true}
      isClearable={false}
      options={optionsFromSuggestions}
      theme={(theme) => ({
        ...theme,
        borderRadius: 4,
        border: "none",
        colors: {
          ...theme.colors,
          primary: "#212121",
          primary25: "#2b2b2b",
          neutral0: "#212121",
          neutral10: "#323337", // tag background color
          neutral80: "whitesmoke", // tag text color
          danger: "whitesmoke", // tag cancel icon color
          dangerLight: "#323337", // tag cancel background color
        },
      })}
      styles={{
        indicatorSeparator: (provided) => ({
          ...provided,
          display: "none",
        }),
        dropdownIndicator: (provided) => ({ ...provided, display: "none" }),
        control: (provided) => ({
          ...provided,
          boxShadow: "none",
          border: transparentBackground ? "none" : "1px solid #4f5053",
          backgroundColor: transparentBackground ? "transparent" : "#212121",
        }),
        container: (provided) => ({
          ...provided,
          flexGrow: 1,
        }),
      }}
      isValidNewOption={(email) => isEmailValid(email)}
      noOptionsMessage={() => null}
      placeholder={"Enter emails to share"}
      onChange={(value) => {
        handleEmailChange(value);
      }}
      menuPlacement="top"
      formatCreateLabel={(email) => `Share with ${email}`}
      ref={emailInputRef}
    />
  );
};

export default EmailInputWithDomainBasedSuggestions;
