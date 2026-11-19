// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { HeaderFilterPopover } from '../../src/datagrid/overlays/HeaderFilterPopover';
import { ColumnDef } from '../../src/datagrid/types/grid';
import { IDataStore } from '../../src/datagrid/types/store';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';

describe('HeaderFilterPopover Component', () => {
  const defaultCol: ColumnDef = {
    id: 'status',
    title: 'Status',
    type: 'text',
    width: 120,
  };

  const anchorRect = { x: 200, y: 100, width: 120, height: 32 };

  const createMockStore = (items: { value: any; count: number }[]): IDataStore => ({
    getRowCount: () => items.reduce((sum, i) => sum + i.count, 0),
    getViewRow: (idx: number) => ({ type: 'data', index: idx, data: {} } as any),
    getRawData: () => [],
    getDistinctValues: vi.fn().mockResolvedValue(items),
  } as unknown as IDataStore);

  it('should render header with column title, type, and sort buttons', async () => {
    const store = createMockStore([
      { value: 'Active', count: 5 },
      { value: 'Pending', count: 3 },
    ]);
    const onSort = vi.fn();
    const onClose = vi.fn();

    render(
      <HeaderFilterPopover
        column={defaultCol}
        anchorRect={anchorRect}
        theme={appleLight}
        locale={enUS}
        store={store}
        onApply={vi.fn()}
        onSort={onSort}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('text')).toBeDefined();
    expect(screen.getByText('Sort A → Z')).toBeDefined();
    expect(screen.getByText('Sort Z → A')).toBeDefined();

    fireEvent.click(screen.getByText('Sort A → Z'));
    expect(onSort).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalled();
  });

  it('should render distinct value checkboxes from store', async () => {
    const store = createMockStore([
      { value: 'Active', count: 5 },
      { value: 'Pending', count: 3 },
    ]);

    render(
      <HeaderFilterPopover
        column={defaultCol}
        anchorRect={anchorRect}
        theme={appleLight}
        locale={enUS}
        store={store}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeDefined();
      expect(screen.getByText('Pending')).toBeDefined();
    });
  });

  it('should filter item list based on search query', async () => {
    const store = createMockStore([
      { value: 'Apple', count: 2 },
      { value: 'Banana', count: 4 },
      { value: 'Cherry', count: 1 },
    ]);

    render(
      <HeaderFilterPopover
        column={defaultCol}
        anchorRect={anchorRect}
        theme={appleLight}
        locale={enUS}
        store={store}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'ban' } });

    expect(screen.getByText('Banana')).toBeDefined();
    expect(screen.queryByText('Apple')).toBeNull();
    expect(screen.queryByText('Cherry')).toBeNull();
  });

  it('should toggle all items when clicking Select All checkbox', async () => {
    const store = createMockStore([
      { value: 'Active', count: 5 },
      { value: 'Pending', count: 3 },
    ]);

    render(
      <HeaderFilterPopover
        column={defaultCol}
        anchorRect={anchorRect}
        theme={appleLight}
        locale={enUS}
        store={store}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeDefined();
    });

    const selectAllText = screen.getByText(/select all/i);
    expect(selectAllText).toBeDefined();

    // Click select all to deselect everything
    fireEvent.click(selectAllText);

    // Apply button preview row count becomes 0
    expect(screen.getByText(/Apply \(0\)/i)).toBeDefined();
  });

  it('should call onApply with selected values on Apply button click', async () => {
    const store = createMockStore([
      { value: 'Active', count: 5 },
      { value: 'Pending', count: 3 },
    ]);
    const onApply = vi.fn();
    const onClose = vi.fn();

    render(
      <HeaderFilterPopover
        column={defaultCol}
        anchorRect={anchorRect}
        theme={appleLight}
        locale={enUS}
        store={store}
        onApply={onApply}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeDefined();
    });

    const applyBtn = screen.getByText(/Apply/i);
    fireEvent.click(applyBtn);

    expect(onApply).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onApply(null) and onClose on Clear button click', async () => {
    const store = createMockStore([
      { value: 'Active', count: 5 },
    ]);
    const onApply = vi.fn();
    const onClose = vi.fn();

    render(
      <HeaderFilterPopover
        column={defaultCol}
        anchorRect={anchorRect}
        theme={appleLight}
        locale={enUS}
        store={store}
        onApply={onApply}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeDefined();
    });

    const clearBtn = screen.getByText('Clear');
    fireEvent.click(clearBtn);

    expect(onApply).toHaveBeenCalledWith(null);
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose on Cancel button click or Escape key press', async () => {
    const store = createMockStore([
      { value: 'Active', count: 5 },
    ]);
    const onClose = vi.fn();

    render(
      <HeaderFilterPopover
        column={defaultCol}
        anchorRect={anchorRect}
        theme={appleLight}
        locale={enUS}
        store={store}
        onApply={vi.fn()}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeDefined();
    });

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Escape on popover container
    fireEvent.keyDown(cancelBtn, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
