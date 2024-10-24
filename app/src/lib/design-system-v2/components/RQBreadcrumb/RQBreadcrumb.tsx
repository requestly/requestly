import React, { useEffect, useState } from "react";
import { Link, Params, useMatches } from "react-router-dom";
import { MdOutlineChevronRight } from "@react-icons/all-files/md/MdOutlineChevronRight";
import { Input, Typography } from "antd";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import "./RQBreadcrumb.scss";

interface Props {
  disabled?: boolean;
  onBlur?: () => void;
  recordName?: string;
  placeholder?: string;
  onRecordNameUpdate?: (s: string) => void;
}

interface MatchedRoute {
  id: string;
  pathname: string;
  params: Params<string>;
  data?: unknown;
  handle?: {
    breadcrumb?: {
      label: string;
      navigateTo?: string;
      isEditable?: boolean;
    };
  };
}

export const RQBreadcrumb: React.FC<Props> = ({
  onBlur,
  disabled = false,
  recordName,
  placeholder,
  onRecordNameUpdate,
}) => {
  const [name, setName] = useState(recordName || "");
  const [isEditRecord, setIsEditRecord] = useState(false);
  const matchedRoutes = useMatches() as MatchedRoute[];

  useEffect(() => {
    setName(recordName);
  }, [recordName]);

  const breadcrumbs = matchedRoutes.reduce((result, route) => {
    return route.handle?.breadcrumb ? [...result, route.handle.breadcrumb] : result;
  }, [] as MatchedRoute["handle"]["breadcrumb"][]);

  const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const updatedValue = e.target.value;

    if (!updatedValue) {
      // TODO: show toast
    }

    setName(updatedValue);
    onRecordNameUpdate(updatedValue);
  };

  const handleOnBlur = () => {
    setIsEditRecord(false);
    onBlur?.();
  };

  return (
    <ol className="rq-breadcrumb">
      {breadcrumbs.map(({ label, navigateTo, isEditable }, index) => {
        return (
          <>
            {isEditable ? (
              isEditRecord ? (
                <Input
                  autoFocus
                  value={name}
                  onChange={handleOnChange}
                  placeholder={placeholder}
                  className={`rq-breadcrumb-input`}
                  onBlur={() => {
                    handleOnBlur();
                  }}
                  onPressEnter={() => {
                    handleOnBlur();
                  }}
                />
              ) : (
                <div className="rq-breadcrumb-record-name">
                  <Typography.Text
                    className="record-name"
                    ellipsis={true}
                    onClick={() => {
                      if (disabled) {
                        return;
                      }

                      setIsEditRecord(true);
                    }}
                  >
                    {recordName || placeholder}
                  </Typography.Text>
                  {disabled ? null : <MdOutlineEdit className="edit-icon" onClick={() => setIsEditRecord(true)} />}
                </div>
              )
            ) : (
              <>
                {navigateTo ? (
                  <Link key={index} to={navigateTo} className="rq-breadcrumb-item">
                    {label}
                  </Link>
                ) : (
                  <li key={index} className="rq-breadcrumb-item">
                    {label}
                  </li>
                )}
              </>
            )}

            {index < breadcrumbs.length - 1 ? (
              <span className="rq-breadcrumb-separator">
                <MdOutlineChevronRight />
              </span>
            ) : null}
          </>
        );
      })}
    </ol>
  );
};
