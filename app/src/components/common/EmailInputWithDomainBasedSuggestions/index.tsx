import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { without } from "lodash";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getDomainFromEmail, isEmailValid } from "utils/FormattingHelper";
import CreatableSelect from "react-select/creatable";
import { MultiValue } from "react-select";
import { isCompanyEmail } from "utils/mailCheckerUtils";
import { toast } from "utils/Toast.js";
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

  const [selectedEmails, setSelectedEmails] = useState<{ label: string; value: string }[]>([]);
  const [inputValue, setInputValue] = useState("");

  const [suggestionOptions, setSuggestionOptions] = useState<
    MultiValue<{
      label: string;
      value: string;
    }>
  >([]);

  const getOrganizationUsers = useMemo(() => httpsCallable(getFunctions(), "users-getOrganizationUsers"), []);

  useEffect(() => {
    if (user.details?.emailType && !isCompanyEmail(user.details?.emailType)) {
      return;
    }

    getOrganizationUsers({ domain: getDomainFromEmail(userEmail) })
      .then((res: any) => {
        const users = res.data.users;
        const emails = users.map((user: any) => user.email);
        const suggestionOptionsFromEmails = without(emails, userEmail).map((suggestion) => {
          return {
            label: suggestion ?? "",
            value: suggestion ?? "",
          };
        });
        setSuggestionOptions(suggestionOptionsFromEmails);
      })
      .catch((err) => {
        Logger.log("Error fetching organization users", err);
        setSuggestionOptions([]);
      });
  }, [getOrganizationUsers, user.details?.emailType, userEmail]);

  const commitEmail = useCallback(
    (raw: string) => {
      const trimmed = raw.trim().replace(/,$/, "");
      if (!trimmed) return;

      if (isEmailValid(trimmed)) {
        if (selectedEmails.some((e) => e.value === trimmed)) {
          toast.error(`Email already added: ${trimmed}`);
          return;
        }
        const newEntry = { label: trimmed, value: trimmed };
        const updated = [...selectedEmails, newEntry];
        setSelectedEmails(updated);
        onChange(updated.map((e) => e.value));
        setInputValue("");
      } else {
        toast.error(`Invalid email: ${trimmed}`);
      }
    },
    [selectedEmails, onChange]
  );

  useEffect(() => {
    if (defaultValue) {
      commitEmail(defaultValue);
    }
  }, [defaultValue, commitEmail]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();
      commitEmail(inputValue);
    }
  };

  const handleBlur = () => {
    // when user clicks outside
    if (inputValue) {
      commitEmail(inputValue);
    }
  };

  const handleChange = (value: MultiValue<{ label: string; value: string }>) => {
    setSelectedEmails(value as { label: string; value: string }[]);
    onChange(value.map((v) => v.value));
  };

  const emailInputRef = useRef(null);

  return (
    <CreatableSelect
      inputValue={inputValue}
      onInputChange={(val) => setInputValue(val)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      value={selectedEmails}
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
      onChange={handleChange}
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
