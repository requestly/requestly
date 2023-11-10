import { MenuProps } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ReactMultiEmail, isEmail } from "react-multi-email";
import _ from "lodash";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import "react-multi-email/dist/style.css";
import "./index.css";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { RQDropdown } from "lib/design-system/components";

interface Props {
  onChange: (emails: string[]) => void;
}

const EmailInputWithDomainBasedSuggestions: React.FC<Props> = ({ onChange }) => {
  const user = useSelector(getUserAuthDetails);
  const userEmail = user?.details?.profile?.email;

  const [emailInput, setEmailInput] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [allSuggestions, setAllSuggestions] = useState<string[]>([]);

  const getOrganizationUsers = useMemo(() => httpsCallable(getFunctions(), "users-getOrganizationUsers"), []);

  useEffect(() => {
    if (!isCompanyEmail(userEmail)) return;

    getOrganizationUsers({ domain: getDomainFromEmail(userEmail) }).then((res: any) => {
      const users = res.data.users;
      console.log("!!!debug", "users::", res.data);
      const emails = users.map((user: any) => user.email);
      console.log("!!!debug", "suggestions::", _.without(emails, userEmail));
      setAllSuggestions(_.without(emails, userEmail));
    });
  }, [getOrganizationUsers, userEmail]);

  const suggestions: string[] = useMemo(() => {
    if (!emailInput) return allSuggestions;

    return allSuggestions.filter((suggestion) => {
      return suggestion.includes(emailInput);
    });
  }, [emailInput, allSuggestions]);

  const optionsFromSuggestions: MenuProps["items"] = useMemo(() => {
    return suggestions.map((suggestion) => {
      return {
        label: suggestion,
        key: suggestion,
      };
    });
  }, [suggestions]);

  const handleEmailChange = useCallback(
    (newEmails: string[]) => {
      setSelectedEmails(newEmails);
      onChange(newEmails);
    },
    [onChange]
  );

  return (
    <RQDropdown
      menu={{
        multiple: true,
        items: optionsFromSuggestions,
        selectedKeys: selectedEmails,
        onClick: (e) => {
          const email = e.key;
          if (selectedEmails.includes(email)) {
            handleEmailChange(_.without(selectedEmails, email));
          } else {
            handleEmailChange([...selectedEmails, email]);
          }
          setEmailInput("");
        },
      }}
      open={!!suggestions.length && !!emailInput}
      overlayClassName="email-suggestion-dropdown"
      placement="top"
    >
      <ReactMultiEmail
        emails={selectedEmails}
        onChange={handleEmailChange}
        initialInputValue={emailInput}
        validateEmail={(emailInp) => {
          return isEmail(emailInp);
        }}
        onChangeInput={(value) => {
          return setEmailInput(value);
        }}
        placeholder="sam@amazon.com, tom@google.com"
        getLabel={(email, index, removeEmail) => (
          <div data-tag key={index} className="multi-email-tag">
            {email}
            <span title="Remove" data-tag-handle onClick={() => removeEmail(index)}>
              <img alt="remove" src="/assets/img/workspaces/cross.svg" />
            </span>
          </div>
        )}
      />
    </RQDropdown>
  );
};

export default EmailInputWithDomainBasedSuggestions;
