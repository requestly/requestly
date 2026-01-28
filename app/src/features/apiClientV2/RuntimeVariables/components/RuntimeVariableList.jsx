import {
  Button,
  Hyperlink,
  InputField,
  SelectMenu,
  SelectMenuOptionGroup,
  SelectMenuOptionItem,
  SelectMenuTrigger,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip
} from '@browserstack/design-stack';
import { MdInfoOutline } from '@browserstack/design-stack-icons';
import LINKS from 'config/constants/sub/links';
import { getRadixRootDiv } from 'features/apiClientV2/utils/radixRootDiv';
import React from 'react';
import useRuntimeVariableList from '../hooks/useRuntimeVariableList';
import {
  BOOL_OPTIONS,
  VARIABLE_TYPE_OPTIONS
} from 'features/apiClientV2/constants/requestVariables';
import { MdAdd } from '@browserstack/design-stack-icons';

function RuntimeVariableList({ searchValue = '' }) {
  const {
    variablesData,
    addNewRow,
    handleVariableChange
  } = useRuntimeVariableList({
    searchValue
  });
  console.log('variablesData', variablesData);
  return (
    <Table hasBorder>
      <TableHead wrapperClassName="sticky top-0 bg-neutral-default shadow-sm">
        <TableRow>
          <TableCell variant="header">Key</TableCell>
          <TableCell variant="header">Type</TableCell>
          <TableCell variant="header">Current Value</TableCell>
          <TableCell variant="header">
            <div className="flex items-center gap-1">
              Persistent{' '}
              <Tooltip
                placementSide="top"
                placementAlign="center"
                triggerAsChild
                container={getRadixRootDiv()}
                content={
                  <>
                    Runtime variables allow you to store and reuse values
                    throughout the app. These values reset when the API client
                    is closed, unless they’re marked as persistent.{' '}
                    <Hyperlink
                      href={LINKS.REQUESTLY_RUNTIME_VARIABLES_DOCS}
                      target="_blank"
                      rel="noreferrer"
                      wrapperClassName="text-sm"
                    >
                      Learn more
                    </Hyperlink>
                  </>
                }
              >
                <MdInfoOutline />
              </Tooltip>
            </div>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.values(variablesData).map((variable) => (
          <TableRow key={variable.id}>
            <TableCell>
              <InputField
                value={variable.key}
                density="compact"
                placeholder="Add new variable"
                onChange={(e) => {
                  handleVariableChange(variable, 'key', e.target.value);
                }}
              />
            </TableCell>
            <TableCell align="right">
              <SelectMenu
                density="compact"
                value={VARIABLE_TYPE_OPTIONS[variable.type]}
                onChange={(e) => {
                  handleVariableChange(variable, 'type', e.value);
                }}
              >
                <SelectMenuTrigger
                  placeholder="String"
                  aria-label="Select type"
                />
                <SelectMenuOptionGroup container={getRadixRootDiv()}>
                  {Object.values(VARIABLE_TYPE_OPTIONS).map((option) => (
                    <SelectMenuOptionItem key={option.value} option={option} />
                  ))}
                </SelectMenuOptionGroup>
              </SelectMenu>
            </TableCell>
            <TableCell align="right">
              {variable.type === 'boolean' ? (
                <SelectMenu
                  density="compact"
                  value={BOOL_OPTIONS[variable.localValue]}
                  onChange={(e) => {
                    handleVariableChange(variable, 'localValue', e.value);
                  }}
                >
                  <SelectMenuTrigger
                    placeholder="Select value"
                    aria-label="Select boolean value"
                  />
                  <SelectMenuOptionGroup container={getRadixRootDiv()}>
                    {Object.values(BOOL_OPTIONS).map((option) => (
                      <SelectMenuOptionItem
                        key={option.value}
                        option={option}
                      />
                    ))}
                  </SelectMenuOptionGroup>
                </SelectMenu>
              ) : (
                <InputField
                  value={variable.localValue}
                  type={variable.type === 'secret' ? 'password' : variable.type}
                  density="compact"
                  placeholder="Enter value"
                  onChange={(e) => {
                    handleVariableChange(
                      variable,
                      'localValue',
                      e.target.value
                    );
                  }}
                />
              )}
            </TableCell>
            <TableCell align="right">
              <Switch
                density="compact"
                checked={variable.isPersisted}
                onChange={(checked) => {
                  handleVariableChange(variable, 'isPersisted', checked);
                }}
              />
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell
            colSpan={4}
            align="left"
            className="text-sm text-neutral-500"
          >
            <Button
              variant="primary"
              colors="white"
              icon={<MdAdd />}
              density="compact"
              onClick={addNewRow}
            >
              Add More
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default RuntimeVariableList;
