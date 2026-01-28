import {
  Button,
  InputField,
  Tooltip,
  Hyperlink
} from '@browserstack/design-stack';
import { MdInfoOutline } from '@browserstack/design-stack-icons';
import { MdOutlineSearch } from '@browserstack/design-stack-icons';
import LINKS from 'config/constants/sub/links';
import React from 'react';
import useRuntimeVariablesHeader from '../hooks/useRuntimeVariablesHeader';
import { getRadixRootDiv } from 'features/apiClientV2/utils/radixRootDiv';
import isEmpty from 'lodash/isEmpty';
import ConfirmationModal from 'features/apiClientV2/common/ConfirmationModal';

function RuntimeVariableHeader({
  searchValue = '',
  setSearchValue = () => {}
}) {
  const {
    handleDeleteAll,
    handleSaveVariables,
    variablesData,
    hasUnsavedChanges,
    isSaving,
    isDeleteModalOpen,
    onDeleteModalClose,
    setIsDeleteModalOpen
  } = useRuntimeVariablesHeader();
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">Runtime Variables</p>
          <Tooltip
            placementSide="top"
            placementAlign="center"
            triggerAsChild
            container={getRadixRootDiv()}
            content={
              <>
                Runtime variables allow you to store and reuse values throughout
                the app. These values reset when the API client is closed,
                unless they’re marked as persistent.{' '}
                <Hyperlink
                  href={LINKS.REQUESTLY_RUNTIME_VARIABLES_DOCS}
                  target="_blank"
                  rel="noreferrer"
                  wrapperClassName="text-sm"
                >
                  See how to use them effectively
                </Hyperlink>
              </>
            }
          >
            <MdInfoOutline />
          </Tooltip>
        </div>
        <div className="flex items-center justify-between">
          <InputField
            density="compact"
            addOnBeforeInline={<MdOutlineSearch />}
            value={searchValue}
            placeholder="Search variables"
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchValue('');
              }
            }}
          />
          <div className="flex gap-2 items-center">
            <Button
              variant="primary"
              colors="white"
              density="compact"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isEmpty(variablesData)}
            >
              Delete All
            </Button>
            <Button
              variant="primary"
              density="compact"
              onClick={handleSaveVariables}
              disabled={!hasUnsavedChanges}
              loading={isSaving}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
      <ConfirmationModal
        show={isDeleteModalOpen}
        description="This action will delete all runtime variables across the entire application. This cannot be undone. Are you sure you want to proceed?"
        onCancel={onDeleteModalClose}
        onCTAClick={handleDeleteAll}
        ctaTitle="Delete"
        title="Delete all variables?"
      />
    </>
  );
}

export default RuntimeVariableHeader;
