import React, { useEffect, useState } from "react";
import { Link, Params, useMatches } from "react-router-dom";
import { MdOutlineChevronRight } from "@react-icons/all-files/md/MdOutlineChevronRight";
import { Input, Skeleton, Typography } from "antd";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import "./RQBreadcrumb.scss";
import { useCurrentWorkspaceUserRole } from "hooks";

interface Props {
  loading?: boolean;
  disabled?: boolean;
  onBlur?: (updatedRecordName: string) => void;
  recordName?: string;
  placeholder?: string;
  onRecordNameUpdate?: (updatedRecordName: string) => void;
  autoFocus?: boolean;
}

interface MatchedRoute {
  id: string;
  pathname: string;
  params: Params<string>;
  data?: unknown;
  handle?: {
    breadcrumb?: {
      label: string;
      disabled?: boolean;
      isEditable?: boolean;
    };
  };
}

export const RQBreadcrumb: React.FC<Props> = ({
  onBlur,
  loading = false,
  disabled = false,
  recordName,
  placeholder,
  onRecordNameUpdate,
  autoFocus = false,
}) => {
  const [name, setName] = useState(recordName || "");
  const [isEditRecord, setIsEditRecord] = useState(false);
  const matchedRoutes = useMatches() as MatchedRoute[];
  const { isReadRole } = useCurrentWorkspaceUserRole();

  useEffect(() => {
    setName(recordName);
  }, [recordName]);

  useEffect(() => {
    if (autoFocus) {
      setIsEditRecord(true);
    }
  }, [autoFocus]);

  const breadcrumbs: ({
    pathname: MatchedRoute["pathname"];
  } & MatchedRoute["handle"]["breadcrumb"])[] = matchedRoutes.reduce((result, route) => {
    return route.handle?.breadcrumb ? [...result, { ...route.handle.breadcrumb, pathname: route.pathname }] : result;
  }, []);

  const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const updatedValue = e.target.value;

    if (!updatedValue) {
      // TODO: show toast
    }

    setName(updatedValue);
    onRecordNameUpdate?.(updatedValue);
  };

  const handleOnBlur = () => {
    setIsEditRecord(false);
    onBlur?.(name);

    if (!name) {
      setName(recordName);
    }
  };

  const handleRecordNameEditClick = () => {
    if (disabled || isReadRole) {
      return;
    }

    setIsEditRecord(true);
  };

  return breadcrumbs.length > 0 ? (
    <ol className="rq-breadcrumb">
      {loading ? (
        <Skeleton.Input active size="small" block />
      ) : (
        breadcrumbs.map(({ label, isEditable, pathname, disabled: isPathDisabled }, index) => {
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
                    <Typography.Text className="record-name" ellipsis={true} onClick={handleRecordNameEditClick}>
                      {name || placeholder}
                    </Typography.Text>
                    {disabled || isReadRole ? null : (
                      <MdOutlineEdit className="edit-icon" onClick={handleRecordNameEditClick} />
                    )}
                  </div>
                )
              ) : (
                <>
                  {isPathDisabled || isReadRole ? (
                    <li key={index} className="rq-breadcrumb-item">
                      {label}
                    </li>
                  ) : (
                    <Link key={index} to={pathname} className="rq-breadcrumb-item">
                      {label}
                    </Link>
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
        })
      )}
    </ol>
  ) : null;
};
