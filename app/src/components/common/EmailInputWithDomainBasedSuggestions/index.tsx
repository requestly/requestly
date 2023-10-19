import { Dropdown, MenuProps } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ReactMultiEmail, isEmail } from "react-multi-email";
import * as _ from "lodash";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
// import { BiCheck } from '@react-icons/all-files/bi/BiCheck';
import "react-multi-email/dist/style.css";
import "./index.css";

interface EmailInputWithDomainBasedSuggestionsProps {
  onChange: (emails: string[]) => void;
}

const EmailInputWithDomainBasedSuggestions: React.FC<EmailInputWithDomainBasedSuggestionsProps> = ({ onChange }) => {
  const user = useSelector(getUserAuthDetails);
  const [userEmail, userEmailDomain] = useMemo(() => {
    return [user?.details?.profile?.email, user?.details?.profile?.email?.split("@")[1]];
  }, [user?.details?.profile?.email]);

  const [emailInp, setEmailInp] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [allSuggestions, setAllSuggestions] = useState<string[]>([]);

  const getOrganizationUsers = useMemo(() => httpsCallable(getFunctions(), "users-getOrganizationUsers"), []);

  useEffect(() => {
    if (!userEmailDomain) return;

    getOrganizationUsers({ domain: userEmailDomain }).then((res: any) => {
      const users = res.data.users;
      const emails = users.map((user: any) => user.email);
      setAllSuggestions(_.without(emails, userEmail));
    });
  }, [userEmailDomain, getOrganizationUsers, userEmail]);

  const suggestions: string[] = useMemo(() => {
    if (!emailInp) return allSuggestions;

    return allSuggestions.filter((suggestion) => {
      return suggestion.includes(emailInp);
    });
  }, [emailInp, allSuggestions]);

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
    <Dropdown
      className="email-input-container"
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
        },
      }}
      // trigger={[]}
      open={!!suggestions.length && !!emailInp}
    >
      <ReactMultiEmail
        className="email-input"
        emails={selectedEmails}
        onChange={handleEmailChange}
        initialInputValue={emailInp}
        validateEmail={(emailInp) => {
          return isEmail(emailInp);
        }}
        onChangeInput={(value) => {
          return setEmailInp(value);
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
    </Dropdown>
  );
};

export default EmailInputWithDomainBasedSuggestions;
