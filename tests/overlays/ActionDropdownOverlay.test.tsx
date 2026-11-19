// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ActionDropdownOverlay } from '../../src/datagrid/overlays/ActionDropdownOverlay';
import { ActionMenuItem } from '../../src/datagrid/types/grid';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';

describe('ActionDropdownOverlay Component', () => {
  const sampleRow = { id: 101, name: 'Product A' };
  const mockOnClose = vi.fn();

  it('should return null when items array is empty', () => {
    const { container } = render(
      <ActionDropdownOverlay
        x={100}
        y={100}
        width={80}
        height={30}
        items={[]}
        row={sampleRow}
        rowIndex={0}
        theme={appleLight}
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render menu items and handle click with row and rowIndex arguments', () => {
    const onItemClick = vi.fn();
    const items: ActionMenuItem[] = [
      { id: 'edit', label: 'Edit Item', icon: 'edit', onClick: onItemClick },
      { id: 'view', label: 'View Details', icon: 'visibility' },
    ];

    render(
      <ActionDropdownOverlay
        x={100}
        y={100}
        width={80}
        height={30}
        items={items}
        row={sampleRow}
        rowIndex={2}
        theme={appleLight}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Edit Item')).toBeDefined();
    expect(screen.getByText('View Details')).toBeDefined();

    const editBtn = screen.getByText('Edit Item');
    fireEvent.click(editBtn);

    expect(onItemClick).toHaveBeenCalledWith(sampleRow, 2);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not trigger onClick or onClose when disabled item is clicked', () => {
    const onDisabledClick = vi.fn();
    const onClose = vi.fn();
    const items: ActionMenuItem[] = [
      { id: 'archive', label: 'Archive', disabled: true, onClick: onDisabledClick },
    ];

    render(
      <ActionDropdownOverlay
        x={100}
        y={100}
        width={80}
        height={30}
        items={items}
        row={sampleRow}
        rowIndex={0}
        theme={appleLight}
        onClose={onClose}
      />
    );

    const archiveBtn = screen.getByText('Archive');
    fireEvent.click(archiveBtn);

    expect(onDisabledClick).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should render danger item with destructive styling', () => {
    const items: ActionMenuItem[] = [
      { id: 'delete', label: 'Delete Item', danger: true },
    ];

    render(
      <ActionDropdownOverlay
        x={100}
        y={100}
        width={80}
        height={30}
        items={items}
        row={sampleRow}
        rowIndex={0}
        theme={appleLight}
        onClose={mockOnClose}
      />
    );

    const deleteItem = screen.getByRole('menuitem', { name: /Delete Item/i });
    expect(deleteItem.style.color).toBe('rgb(239, 68, 68)');
  });

  it('should render divider element between items', () => {
    const items: ActionMenuItem[] = [
      { id: 'opt1', label: 'Option 1' },
      { id: 'sep', label: '', divider: true },
      { id: 'opt2', label: 'Option 2' },
    ];

    const { container } = render(
      <ActionDropdownOverlay
        x={100}
        y={100}
        width={80}
        height={30}
        items={items}
        row={sampleRow}
        rowIndex={0}
        theme={appleLight}
        onClose={mockOnClose}
      />
    );

    // Separator has height: 1px
    expect(container.querySelector('div[style*="height: 1px"]')).toBeDefined();
  });

  it('should call onClose on Escape key press', () => {
    const onClose = vi.fn();
    const items: ActionMenuItem[] = [{ id: 'opt', label: 'Option' }];

    render(
      <ActionDropdownOverlay
        x={100}
        y={100}
        width={80}
        height={30}
        items={items}
        row={sampleRow}
        rowIndex={0}
        theme={appleLight}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose on outside mouse down', () => {
    const onClose = vi.fn();
    const items: ActionMenuItem[] = [{ id: 'opt', label: 'Option' }];

    render(
      <div>
        <div data-testid="outside-area">Outside</div>
        <ActionDropdownOverlay
          x={100}
          y={100}
          width={80}
          height={30}
          items={items}
          row={sampleRow}
          rowIndex={0}
          theme={appleLight}
          onClose={onClose}
        />
      </div>
    );

    const outside = screen.getByTestId('outside-area');
    fireEvent.mouseDown(outside);

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose on window scroll and resize', () => {
    const onClose = vi.fn();
    const items: ActionMenuItem[] = [{ id: 'opt', label: 'Option' }];

    render(
      <ActionDropdownOverlay
        x={100}
        y={100}
        width={80}
        height={30}
        items={items}
        row={sampleRow}
        rowIndex={0}
        theme={appleLight}
        onClose={onClose}
      />
    );

    fireEvent.scroll(window);
    expect(onClose).toHaveBeenCalled();

    onClose.mockClear();
    fireEvent(window, new Event('resize'));
    expect(onClose).toHaveBeenCalled();
  });
});
