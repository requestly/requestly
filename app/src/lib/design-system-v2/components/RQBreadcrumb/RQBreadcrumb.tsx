import React, { useEffect, useRef, useState } from "react";
import { Link, Params, useMatches } from "react-router-dom";
import { MdOutlineChevronRight } from "@react-icons/all-files/md/MdOutlineChevronRight";
import { Input, Skeleton, Typography } from "antd";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import { useRBAC } from "features/rbac";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import "./RQBreadcrumb.scss";
import { CollectionViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/Collection/collectionViewTabSource";

interface Props {
  loading?: boolean;
  disabled?: boolean;
  onBlur?: (updatedRecordName: string) => void;
  recordName?: string;
  placeholder?: string;
  onRecordNameUpdate?: (updatedRecordName: string) => void;
  autoFocus?: boolean;
  defaultBreadcrumbs?: {
    pathname: string;
    label: React.ReactNode;
    disabled?: boolean;
    isEditable?: boolean;
  }[];
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
  onRecordNameUpdate = () => {},
  autoFocus = false,
  defaultBreadcrumbs = [],
}) => {
  const [name, setName] = useState(recordName || "");
  const [isEditRecord, setIsEditRecord] = useState(false);
  const matchedRoutes = useMatches() as MatchedRoute[];
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("breadcrumbs", "update");
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  const context = useApiClientFeatureContext();

  useEffect(() => {
    setName(recordName);
  }, [recordName]);

  const autoFocusRef = useRef(false);
  useEffect(() => {
    if (autoFocusRef.current) {
      return;
    }

    if (autoFocus) {
      autoFocusRef.current = true;
      setIsEditRecord(true);
    }

    return () => setIsEditRecord(false);
  }, [autoFocus]);

  const breadcrumbs =
    defaultBreadcrumbs.length > 0
      ? defaultBreadcrumbs
      : matchedRoutes.reduce((result, route) => {
          return route.handle?.breadcrumb
            ? [...result, { ...route.handle.breadcrumb, pathname: route.pathname }]
            : result;
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
    if (disabled || !isValidPermission) {
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
          const isCollection = pathname.includes("/collection/");
          const collectionId = isCollection ? pathname.split("/").pop() : null;

          return (
            <React.Fragment key={index}>
              {isEditable ? (
                isEditRecord ? (
                  <Input
                    autoFocus
                    value={name}
                    onChange={handleOnChange}
                    placeholder={placeholder}
                    className={`rq-breadcrumb-input`}
                    onBlur={handleOnBlur}
                    onPressEnter={handleOnBlur}
                  />
                ) : (
                  <div className="rq-breadcrumb-record-name" title={name || placeholder}>
                    <Typography.Text className="record-name" ellipsis={true} onClick={handleRecordNameEditClick}>
                      {name || placeholder}
                    </Typography.Text>
                    {disabled || !isValidPermission ? null : (
                      <MdOutlineEdit className="edit-icon" onClick={handleRecordNameEditClick} />
                    )}
                  </div>
                )
              ) : (
                <>
                  {isPathDisabled || !isValidPermission ? (
                    <li className="rq-breadcrumb-item">{label}</li>
                  ) : isCollection ? (
                    <span
                      className="rq-breadcrumb-item"
                      onClick={() => {
                        console.log("Opening tab for collection:", collectionId);
                        openTab(
                          new CollectionViewTabSource({
                            id: collectionId,
                            title: typeof label === "string" ? label : "Collection",
                            context: { id: context.id },
                          }),
                          { preview: true }
                        );
                      }}
                    >
                      {label}
                    </span>
                  ) : (
                    <Link to={pathname} className="rq-breadcrumb-item">
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
            </React.Fragment>
          );
        })
      )}
    </ol>
  ) : null;
};
