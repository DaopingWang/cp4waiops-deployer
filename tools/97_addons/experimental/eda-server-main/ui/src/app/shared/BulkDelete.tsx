import React, { useMemo, useCallback, useState } from 'react';
import { Dropdown, DropdownItem, DropdownToggle, DropdownToggleCheckbox } from '@patternfly/react-core';
import { AnyObject } from '@app/shared/types/common-types';

export interface BulkSelectorProps<T> {
  itemCount?: number;
  pageItems?: T[];
  selectedItems?: T[];
  selectItems?: (items: T[]) => void;
  unselectAll?: () => void;
  keyFn: (item: T) => string | number;
  selectNoneText?: string;
}

export const BulkSelector = (props: BulkSelectorProps<AnyObject>) => {
  const [isOpen, setIsOpen] = useState(false);

  const { pageItems, selectedItems, selectItems, unselectAll } = props;

  const allPageItemsSelected =
    props.itemCount !== undefined &&
    props.itemCount > 0 &&
    pageItems &&
    pageItems.length > 0 &&
    (pageItems ?? []).every((item) => selectedItems?.includes(item));

  const onToggleCheckbox = useCallback(() => {
    if (allPageItemsSelected) {
      unselectAll?.();
    } else {
      selectItems?.(pageItems ?? []);
    }
  }, [allPageItemsSelected, unselectAll, selectItems, pageItems]);

  const toggleText = useMemo(() => {
    if (selectedItems && selectedItems.length > 0) {
      return `${selectedItems.length}`;
    }
    return '';
  }, [selectedItems]);

  const toggle = useMemo(() => {
    const selectedCount = selectedItems ? selectedItems.length : 0;
    return (
      <DropdownToggle
        splitButtonItems={[
          <DropdownToggleCheckbox
            id="select-all"
            key="select-all"
            aria-label="Select all"
            isChecked={allPageItemsSelected ? true : selectedCount > 0 ? null : false}
            onChange={onToggleCheckbox}
          >
            {toggleText}
          </DropdownToggleCheckbox>,
        ]}
        onToggle={(isOpen) => setIsOpen(isOpen)}
      />
    );
  }, [selectedItems, allPageItemsSelected, onToggleCheckbox, toggleText]);

  const selectNoneDropdownItem = useMemo(() => {
    return (
      <DropdownItem
        id="select-none"
        key="select-none"
        onClick={() => {
          unselectAll?.();
          setIsOpen(false);
        }}
      >
        {props.selectNoneText ?? 'Select none'}
      </DropdownItem>
    );
  }, [props.selectNoneText, unselectAll]);

  const selectPageDropdownItem = useMemo(() => {
    return (
      <DropdownItem
        id="select-page"
        key="select-page"
        onClick={() => {
          selectItems?.(pageItems ?? []);
          setIsOpen(false);
        }}
      >
        {`Select ${pageItems?.length ?? 0} page items`}
      </DropdownItem>
    );
  }, [selectItems, pageItems]);

  const dropdownItems = useMemo(
    () => [selectNoneDropdownItem, selectPageDropdownItem],
    [selectNoneDropdownItem, selectPageDropdownItem]
  );

  return <Dropdown isOpen={isOpen} toggle={toggle} dropdownItems={dropdownItems} style={{ zIndex: 302 }} />;
};
