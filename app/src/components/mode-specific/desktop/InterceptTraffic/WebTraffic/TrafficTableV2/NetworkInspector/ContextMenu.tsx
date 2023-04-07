import React, { ReactNode, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { copyToClipBoard } from '../../../../../../../utils/Misc';
import { actions } from 'store';
import { RuleType } from 'types';
import { getIsTrafficTableTourCompleted } from 'store/selectors';
import {
  TrackTrafficTableDropdownClicked,
  trackTrafficTableRequestRightClicked,
} from 'modules/analytics/events/desktopApp';
import './index.css';

interface ContextMenuProps {
  log: any;
  children: ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children, log }) => {
  const dispatch = useDispatch();
  const isTrafficTableTourCompleted = useSelector(getIsTrafficTableTourCompleted);

  const handleOnClick = useCallback(
    (menuInfo: Parameters<MenuProps['onClick']>[0], log: any) => {
      dispatch(
        actions.toggleActiveModal({
          newValue: true,
          modalName: 'ruleEditorModal',
          newProps: {
            ruleData: log,
            ruleType: menuInfo.key,
          },
        })
      );
      TrackTrafficTableDropdownClicked(menuInfo.key);
    },
    [dispatch]
  );

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'copy_curl',
        label: 'Copy cURL',
        onClick: () => {
          copyToClipBoard(log.requestShellCurl, 'cURL copied to clipboard');
          TrackTrafficTableDropdownClicked('copy_curl');
        },
      },
      {
        key: 'copy_url',
        label: 'Copy URL',
        onClick: () => {
          copyToClipBoard(log.url, 'URL copied to clipboard');
          TrackTrafficTableDropdownClicked('copy_url');
        },
      },
      {
        key: RuleType.REDIRECT,
        label: 'Redirect URL(Map local/Remote)',
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.RESPONSE,
        label: 'Modify Response Body',
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.REQUEST,
        label: 'Modify Request Body',
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.HEADERS,
        label: 'Modify Headers',
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.REPLACE,
        label: 'Replace part of URL',
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        label: 'More modification options',
        key: 'more_options',
        children: [
          {
            key: RuleType.CANCEL,
            label: 'Cancel Request',
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.SCRIPT,
            label: 'Insert Custom Script',
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.DELAY,
            label: 'Delay Request',
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.QUERYPARAM,
            label: 'Modify Query Params',
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.USERAGENT,
            label: 'Modify User Agent',
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
        ],
      },
    ],
    [log, handleOnClick]
  );

  const handleDropdownOpenChange = (open: boolean) => {
    if (open) {
      trackTrafficTableRequestRightClicked();
      if (!isTrafficTableTourCompleted) {
        dispatch(actions.updateTrafficTableTourCompleted({}));
      }
    }
  };

  return (
    <Dropdown
      menu={{ items }}
      trigger={['contextMenu']}
      overlayClassName="traffic-table-context-menu"
      destroyPopupOnHide={true}
      onOpenChange={handleDropdownOpenChange}
    >
      {children}
    </Dropdown>
  );
};
