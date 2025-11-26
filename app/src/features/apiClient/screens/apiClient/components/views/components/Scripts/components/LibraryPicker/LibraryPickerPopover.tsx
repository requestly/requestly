import React, { useState, useMemo, useCallback } from "react";
import { Popover, Input, Select } from "antd";
import { MdSearch } from "@react-icons/all-files/md/MdSearch";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { RiBox3Line } from "@react-icons/all-files/ri/RiBox3Line";
import { RiGithubLine } from "@react-icons/all-files/ri/RiGithubLine";
import { PackageListItem } from "./PackageListItem";
import "./libraryPickerPopover.scss";
import { getPackageRegistry } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/scriptExecutionWorker/globals/packageRegistry";
import { ExternalPackage } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/scriptExecutionWorker/globals/packageTypes";

export interface LibraryPickerPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPackageSelect: (pkg: ExternalPackage) => void;
  children: React.ReactNode;
}

type FilterKey = "all" | "builtin" | "npm" | "jsr";

interface FilterOption {
  value: FilterKey;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "builtin", label: "Built-in" },
  { value: "npm", label: "NPM" },
  { value: "jsr", label: "JSR" },
];

const GITHUB_ISSUE_URL = "https://github.com/nicjac/requestly-api-client/issues";

export const LibraryPickerPopover: React.FC<LibraryPickerPopoverProps> = ({
  open,
  onOpenChange,
  onPackageSelect,
  children,
}) => {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const packages = useMemo(() => {
    const registry = getPackageRegistry();
    return registry.listAllPackages();
  }, []);

  const filteredPackages = useMemo(() => {
    let result = packages;

    if (filter === "builtin") {
      result = result.filter((pkg) => pkg.source === "builtin");
    } else if (filter === "npm" || filter === "jsr") {
      return [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((pkg) => {
        const matchesName = pkg.name.toLowerCase().includes(query);
        const matchesId = pkg.id.toLowerCase().includes(query);
        const matchesDescription = pkg.description?.toLowerCase().includes(query);
        const matchesTags = pkg.tags?.some((tag) => tag.toLowerCase().includes(query));
        const matchesCategory = pkg.category?.toLowerCase().includes(query);

        return matchesName || matchesId || matchesDescription || matchesTags || matchesCategory;
      });
    }

    return result;
  }, [packages, searchQuery, filter]);

  const handlePackageClick = useCallback(
    (pkg: ExternalPackage) => {
      onPackageSelect(pkg);
      onOpenChange(false);
      setSearchQuery("");
    },
    [onPackageSelect, onOpenChange]
  );

  const handleDocsClick = useCallback((pkg: ExternalPackage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pkg.docsUrl) {
      window.open(pkg.docsUrl, "_blank");
    }
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleFilterChange = useCallback((value: FilterKey) => {
    setFilter(value);
    setSearchQuery("");
  }, []);

  const isComingSoon = filter === "npm" || filter === "jsr";
  const hasNoResults = !isComingSoon && filteredPackages.length === 0 && searchQuery.trim();

  const renderPackageList = () => (
    <div className="library-picker-listing">
      {filteredPackages.map((pkg) => (
        <PackageListItem
          key={pkg.id}
          package={pkg}
          onClick={() => handlePackageClick(pkg)}
          onDocsClick={(e: React.MouseEvent) => handleDocsClick(pkg, e)}
        />
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="library-picker-empty">
      <RiBox3Line className="library-picker-empty-icon" />
      <div className="library-picker-empty-content">
        <div className="library-picker-empty-title">No results for "{searchQuery}"</div>
        <div className="library-picker-empty-description">Try another package name or check your spelling.</div>
        <button className="library-picker-empty-clear-btn" onClick={handleClearSearch}>
          <MdClose />
          <span>Clear search</span>
        </button>
      </div>
    </div>
  );

  const renderComingSoon = () => {
    const sourceName = filter === "npm" ? "NPM" : "JSR";
    return (
      <div className="library-picker-coming-soon">
        <RiBox3Line className="library-picker-coming-soon-icon" />
        <div className="library-picker-coming-soon-content">
          <div className="library-picker-coming-soon-title">{sourceName} packages coming soon</div>
          <div className="library-picker-coming-soon-description">
            Support for importing packages from {sourceName} is in progress.
            <br />
            Follow the GitHub issue for updates.
          </div>
          <button className="library-picker-coming-soon-btn" onClick={() => window.open(GITHUB_ISSUE_URL, "_blank")}>
            <RiGithubLine />
            <span>Track on Github</span>
          </button>
        </div>
      </div>
    );
  };

  const content = (
    <div className="library-picker-popover">
      <div className="library-picker-header">
        <div className="library-picker-title">Add Packages</div>
      </div>
      <div className="library-picker-controls">
        <Input
          prefix={<MdSearch className="library-picker-search-icon" />}
          placeholder="Search packages"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          className="library-picker-search-input"
          autoFocus
        />
        <Select
          value={filter}
          size="small"
          onChange={handleFilterChange}
          options={FILTER_OPTIONS}
          className="library-picker-filter-select"
        />
      </div>
      <div className="library-picker-content">
        {isComingSoon && renderComingSoon()}
        {hasNoResults && renderEmptyState()}
        {!isComingSoon && !hasNoResults && renderPackageList()}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      open={open}
      onOpenChange={onOpenChange}
      trigger="click"
      placement="bottomLeft"
      overlayClassName="library-picker-popover-overlay"
      destroyTooltipOnHide
      align={{ offset: [0, -12] }}
    >
      {children}
    </Popover>
  );
};
