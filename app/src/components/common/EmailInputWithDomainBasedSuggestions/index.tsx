import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { without } from "lodash";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getDomainFromEmail, isEmailValid } from "utils/FormattingHelper";
import CreatableSelect from "react-select/creatable";
import { MultiValue } from "react-select";
import { isCompanyEmail } from "utils/mailCheckerUtils";
import Logger from "lib/logger";

interface Props {
  autoFocus?: boolean;
  defaultValue?: string;
  onChange: (emails: string[]) => void;
  transparentBackground?: boolean;
}

const EmailInputWithDomainBasedSuggestions: React.FC<Props> = ({
  onChange,
  defaultValue = "",
  transparentBackground = false,
  autoFocus = false,
}) => {
  const user = useSelector(getUserAuthDetails);
  const userEmail = user?.details?.profile?.email;

  const [suggestionOptions, setSuggestionOptions] = useState<
    MultiValue<{
      label: string;
      value: string;
    }>
  >([]);

  const getOrganizationUsers = useMemo(() => httpsCallable(getFunctions(), "users-getOrganizationUsers"), []);

  useEffect(() => {
    if (!isCompanyEmail(user.details?.emailType)) return;

    getOrganizationUsers({ domain: getDomainFromEmail(userEmail) })
      .then((res: any) => {
        const users = res.data.users;
        const emails = users.map((user: any) => user.email);
        const suggestionOptionsFromEmails = without(emails, userEmail).map((suggestion) => {
          return {
            label: suggestion,
            value: suggestion,
          };
        });
        setSuggestionOptions(suggestionOptionsFromEmails);
      })
      .catch((err) => {
        Logger.log("Error fetching organization users", err);
        setSuggestionOptions([]);
      });
  }, [getOrganizationUsers, user.details?.emailType, userEmail]);

  useEffect(() => {
    // Set default value if it is a valid email
    if (isEmailValid(defaultValue)) {
      onChange([defaultValue]);
    }
  }, [defaultValue, onChange]);

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
      defaultValue={
        isEmailValid(defaultValue)
          ? [
              {
                label: defaultValue,
                value: defaultValue,
              },
            ]
          : []
      }
      autoFocus={autoFocus}
      isMulti={true}
      isClearable={false}
      options={suggestionOptions}
      theme={(theme) => ({
        ...theme,
        borderRadius: 4,
        border: "none",
        colors: {
          ...theme.colors,
          primary: "var(--requestly-color-surface-1)",
          primary25: "var(--requestly-color-surface-2)",
          neutral0: "var(--requestly-color-surface-1)",
          neutral10: "var(--surface-3)", // tag background color
          neutral80: "var(--requestly-color-text-default)", // tag text color
          danger: "var(--requestly-color-text-default)", // tag cancel icon color
          dangerLight: "var(--surface-3)", // tag cancel background color
        },
      })}
      isValidNewOption={(email) => isEmailValid(email)}
      noOptionsMessage={() => null}
      placeholder={"Enter emails"}
      onChange={(value) => {
        handleEmailChange(value);
      }}
      menuPlacement="top"
      formatCreateLabel={(email) => email}
      ref={emailInputRef}
      styles={{
        indicatorSeparator: (provided) => ({
          ...provided,
          display: "none",
        }),
        dropdownIndicator: (provided) => ({ ...provided, display: "none" }),
        control: (provided) => ({
          ...provided,
          boxShadow: "none",
          border: transparentBackground ? "none" : "1px solid var(--border)",
          backgroundColor: transparentBackground ? "transparent" : "var(--background)",
        }),
        container: (provided) => ({
          ...provided,
          flexGrow: 1,
        }),
      }}
    />
  );
};

export default EmailInputWithDomainBasedSuggestions;
