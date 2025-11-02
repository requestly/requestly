import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Params, useMatches, matchPath } from "react-router-dom";
import { MdOutlineChevronRight } from "@react-icons/all-files/md/MdOutlineChevronRight";
import { Dropdown, Input, Skeleton, Typography } from "antd";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import { useRBAC } from "features/rbac";
import "./RQBreadcrumb.scss";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { tabRoutes } from "componentsV2/Tabs/routes";

interface Props {
  loading?: boolean;
  disabled?: boolean;
  onBlur?: (updatedRecordName: string) => void;
  recordName?: string;
  recordIcon?: React.ReactNode;
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

interface Breadcrumb {
  label: React.ReactNode;
  pathname: string;
  disabled?: boolean;
  isEditable?: boolean;
}

export const RQBreadcrumb: React.FC<Props> = ({
  onBlur,
  loading = false,
  disabled = false,
  recordName = "",
  recordIcon,
  placeholder,
  onRecordNameUpdate = () => {},
  autoFocus = false,
  defaultBreadcrumbs = [],
}) => {
  const matchedRoutes = useMatches() as MatchedRoute[];
  const breadcrumbRef = useRef<HTMLOListElement>(null);
  const measurementRef = useRef<HTMLOListElement>(null);
  const [isCollapsedBreadcrumbs, setIsCollapsedBreadcrumbs] = useState<boolean>(false);
  const [name, setName] = useState(recordName || "");
  const [isEditRecord, setIsEditRecord] = useState(false);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("breadcrumbs", "update");
  const [openTab, setIgnorePath] = useTabServiceWithSelector((state) => [state.openTab, state.setIgnorePath]);
  const [visibleBreadcrumbsCount, setVisibleBreadcrumbsCount] = useState(1);

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

  useEffect(() => {
    setName(recordName);
  }, [recordName]);

  const breadcrumbs: Breadcrumb[] = useMemo(() => {
    if (defaultBreadcrumbs.length > 0) {
      return defaultBreadcrumbs;
    }

    return matchedRoutes.reduce<Breadcrumb[]>((result, route) => {
      if (route.handle?.breadcrumb) {
        return [...result, { ...route.handle.breadcrumb, pathname: route.pathname }];
      }
      return result;
    }, []);
  }, [defaultBreadcrumbs, matchedRoutes]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const checkOverflow = () => {
      const containerWidth = breadcrumbRef.current?.offsetWidth ?? 0;
      const fullBreadcrumbWidth = measurementRef.current?.scrollWidth ?? 0;

      const shouldCollapse = fullBreadcrumbWidth > containerWidth && breadcrumbs.length > 5;
      setIsCollapsedBreadcrumbs(shouldCollapse);

      if (fullBreadcrumbWidth - containerWidth < 100) setVisibleBreadcrumbsCount(4);
      else if (fullBreadcrumbWidth - containerWidth < 150) setVisibleBreadcrumbsCount(3);
      else if (fullBreadcrumbWidth - containerWidth < 250) setVisibleBreadcrumbsCount(2);
      else setVisibleBreadcrumbsCount(1);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [breadcrumbs, setIsEditRecord, loading, name, placeholder]);

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

  const handleBreadcrumbClick = (e: React.MouseEvent<HTMLAnchorElement>, pathname: string) => {
    e.preventDefault();
    for (const route of tabRoutes) {
      const matchedPath = matchPath(route.path, pathname);
      if (matchedPath) {
        setIgnorePath(true);
        const tabSource = route.tabSourceFactory(matchedPath);
        openTab(tabSource);
        break;
      }
    }
  };

  const renderBreadcrumbItem = (item: Breadcrumb, index: number) => {
    const { label, pathname, disabled: isItemDisabled, isEditable } = item;

    if (isEditable) {
      return isEditRecord ? (
        <div key={index} className="rq-breadcrumb-record-name">
          {recordIcon && <span className="record-icon">{recordIcon}</span>}
          <Input
            autoFocus
            value={name}
            onChange={handleOnChange}
            placeholder={placeholder}
            className="rq-breadcrumb-input"
            onBlur={handleOnBlur}
            onPressEnter={handleOnBlur}
          />
        </div>
      ) : (
        <div key={index} className="rq-breadcrumb-record-name" title={name || placeholder}>
          {recordIcon && <span className="record-icon">{recordIcon}</span>}
          <Typography.Text
            className="record-name"
            ellipsis={{
              tooltip: {
                title: name || placeholder,
                color: "var(--requestly-color-black)",
                placement: "bottom",
              },
            }}
            onClick={handleRecordNameEditClick}
          >
            {name || placeholder}
          </Typography.Text>
          {disabled || !isValidPermission ? null : (
            <MdOutlineEdit className="edit-icon" onClick={handleRecordNameEditClick} />
          )}
        </div>
      );
    }

    if (isItemDisabled || !isValidPermission) {
      return (
        <li key={index} className="rq-breadcrumb-item">
          {label}
        </li>
      );
    }

    return (
      <Link
        key={index}
        onClick={(e) => handleBreadcrumbClick(e, pathname)}
        to={pathname}
        className="rq-breadcrumb-item"
      >
        {label}
      </Link>
    );
  };

  const renderExpandedBreadcrumbs = () =>
    breadcrumbs.map((bc, index) => (
      <React.Fragment key={`expanded-${index}`}>
        {renderBreadcrumbItem(bc, index)}
        {index !== breadcrumbs.length - 1 && (
          <span className="rq-breadcrumb-separator">
            <MdOutlineChevronRight />
          </span>
        )}
      </React.Fragment>
    ));

  const renderBreadcrumbs = () => {
    if (breadcrumbs.length <= 5 || !isCollapsedBreadcrumbs) {
      return renderExpandedBreadcrumbs();
    }

    const firstItem = breadcrumbs[0];
    const collapsedItems = breadcrumbs.slice(1, -visibleBreadcrumbsCount);
    const lastItems = breadcrumbs.slice(-visibleBreadcrumbsCount);

    const dropdownItems = collapsedItems.map((item, index) => {
      return {
        key: index,
        label: item.disabled ? (
          <span>{item.label}</span>
        ) : (
          <Link to={item.pathname} onClick={(e) => handleBreadcrumbClick(e, item.pathname)}>
            {item.label}
          </Link>
        ),
      };
    });

    return (
      <>
        {renderBreadcrumbItem(firstItem, 0)}
        <span className="rq-breadcrumb-separator">
          <MdOutlineChevronRight />
        </span>
        <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
          <li className="rq-breadcrumb-item rq-breadcrumb-ellipsis">
            <MdOutlineMoreHoriz />
          </li>
        </Dropdown>
        {lastItems.map((item, index) => (
          <React.Fragment key={index + 3}>
            <span className="rq-breadcrumb-separator">
              <MdOutlineChevronRight />
            </span>
            {renderBreadcrumbItem(item, index + 3)}
          </React.Fragment>
        ))}
      </>
    );
  };

  return breadcrumbs.length > 0 ? (
    <>
      <ol ref={breadcrumbRef} className="rq-breadcrumb">
        {loading ? <Skeleton.Input active size="small" block /> : renderBreadcrumbs()}
      </ol>

      {/* This is a Transparent/Hidden breadcrumb used to measure width we have, based on the width we will
       have then we can decide collapsed state or how many breadcrumbs elements to be rendered */}
      {!loading && (
        <ol ref={measurementRef} className="rq-breadcrumb rq-breadcrumb-measurement" aria-hidden="true">
          {renderExpandedBreadcrumbs()}
        </ol>
      )}
    </>
  ) : null;
};
