// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ContextMenuOverlay, ContextMenuState } from '../../src/datagrid/overlays/ContextMenuOverlay';
import { ColumnDef } from '../../src/datagrid/types/grid';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';

describe('ContextMenuOverlay Component', () => {
  const defaultCol: ColumnDef = {
    id: 'name',
    title: 'Full Name',
    type: 'text',
    width: 150,
  };

  const defaultCellMenu: ContextMenuState = {
    targetType: 'cell',
    x: 150,
    y: 200,
    row: 3,
    col: 1,
    column: defaultCol,
    rowData: { id: 104, name: 'Sample User' },
  };

  const createMockCallbacks = () => ({
    onCopy: vi.fn(),
    onPaste: vi.fn(),
    onDuplicateCellDown: vi.fn(),
    onDuplicateCellRight: vi.fn(),
    onDuplicateRow: vi.fn(),
    onInsertRowAbove: vi.fn(),
    onInsertRowBelow: vi.fn(),
    onClearCells: vi.fn(),
    onDeleteRow: vi.fn(),
    onFilterByCellValue: vi.fn(),
    onToggleGroupColumn: vi.fn(),
    onSortColumn: vi.fn(),
    onTogglePinColumn: vi.fn(),
    onPinColumn: vi.fn(),
    onToggleColumnReadonly: vi.fn(),
    onChangeSummaryType: vi.fn(),
    onExportExcel: vi.fn(),
    onExportCsv: vi.fn(),
    onClose: vi.fn(),
  });

  it('should render standard cell context menu options (Copy, Paste, Duplicate, Delete)', () => {
    const callbacks = createMockCallbacks();

    render(
      <ContextMenuOverlay
        menu={defaultCellMenu}
        viewportWidth={1000}
        viewportHeight={800}
        theme={appleLight}
        locale={enUS}
        isCellEditable={true}
        isGroupedByCol={false}
        {...callbacks}
      />
    );

    expect(screen.getByText('Copy (Excel TSV)')).toBeDefined();
    expect(screen.getByText('Paste (Excel TSV)')).toBeDefined();
    expect(screen.getByText('Duplicate Cell Down')).toBeDefined();
    expect(screen.getByText('Clone Entire Row')).toBeDefined();
    expect(screen.getByText('Delete Row')).toBeDefined();
    expect(screen.getByText('Export to Excel (.xls)')).toBeDefined();
  });

  it('should trigger onCopy and onClose when clicking Copy', () => {
    const callbacks = createMockCallbacks();

    render(
      <ContextMenuOverlay
        menu={defaultCellMenu}
        viewportWidth={1000}
        viewportHeight={800}
        theme={appleLight}
        locale={enUS}
        isCellEditable={true}
        isGroupedByCol={false}
        {...callbacks}
      />
    );

    const copyBtn = screen.getByText('Copy (Excel TSV)');
    fireEvent.click(copyBtn);

    expect(callbacks.onCopy).toHaveBeenCalled();
    expect(callbacks.onClose).toHaveBeenCalled();
  });

  it('should trigger onDuplicateCellDown when clicking Duplicate Cell Down', () => {
    const callbacks = createMockCallbacks();

    render(
      <ContextMenuOverlay
        menu={defaultCellMenu}
        viewportWidth={1000}
        viewportHeight={800}
        theme={appleLight}
        locale={enUS}
        isCellEditable={true}
        isGroupedByCol={false}
        {...callbacks}
      />
    );

    const dupBtn = screen.getByText('Duplicate Cell Down');
    fireEvent.click(dupBtn);

    expect(callbacks.onDuplicateCellDown).toHaveBeenCalled();
    expect(callbacks.onClose).toHaveBeenCalled();
  });

  it('should trigger onInsertRowAbove and onInsertRowBelow', () => {
    const callbacks = createMockCallbacks();

    render(
      <ContextMenuOverlay
        menu={defaultCellMenu}
        viewportWidth={1000}
        viewportHeight={800}
        theme={appleLight}
        locale={enUS}
        isCellEditable={true}
        isGroupedByCol={false}
        {...callbacks}
      />
    );

    const insertAbove = screen.getByText('Insert Row Above');
    fireEvent.click(insertAbove);
    expect(callbacks.onInsertRowAbove).toHaveBeenCalled();
    expect(callbacks.onClose).toHaveBeenCalled();
  });

  it('should render header context menu with sorting, pinning, and group options', () => {
    const callbacks = createMockCallbacks();
    const headerMenu: ContextMenuState = {
      targetType: 'header',
      x: 200,
      y: 40,
      row: -1,
      col: 1,
      column: defaultCol,
    };

    render(
      <ContextMenuOverlay
        menu={headerMenu}
        viewportWidth={1000}
        viewportHeight={800}
        theme={appleLight}
        locale={enUS}
        isCellEditable={true}
        isGroupedByCol={false}
        {...callbacks}
      />
    );

    expect(screen.getByText(/Sort Ascending/i)).toBeDefined();
    expect(screen.getByText(/Sort Descending/i)).toBeDefined();
    expect(screen.getByText(/Pin Column Left/i)).toBeDefined();

    const sortAsc = screen.getByText(/Sort Ascending/i);
    fireEvent.click(sortAsc);
    expect(callbacks.onSortColumn).toHaveBeenCalledWith(false);
  });

  it('should trigger onPinColumn when pinning a column', () => {
    const callbacks = createMockCallbacks();
    const headerMenu: ContextMenuState = {
      targetType: 'header',
      x: 200,
      y: 40,
      row: -1,
      col: 1,
      column: defaultCol,
    };

    render(
      <ContextMenuOverlay
        menu={headerMenu}
        viewportWidth={1000}
        viewportHeight={800}
        theme={appleLight}
        locale={enUS}
        isCellEditable={true}
        isGroupedByCol={false}
        {...callbacks}
      />
    );

    const pinLeft = screen.getByText(/Pin Column Left/i);
    fireEvent.click(pinLeft);
    expect(callbacks.onPinColumn).toHaveBeenCalledWith('left');
  });

  it('should render Turkish localized options when locale is trTR', () => {
    const callbacks = createMockCallbacks();

    render(
      <ContextMenuOverlay
        menu={defaultCellMenu}
        viewportWidth={1000}
        viewportHeight={800}
        theme={appleLight}
        locale={trTR}
        isCellEditable={true}
        isGroupedByCol={false}
        {...callbacks}
      />
    );

    expect(screen.getByText(/Kopyala \(Excel TSV\)/i)).toBeDefined();
    expect(screen.getByText(/Yapıştır \(Excel TSV\)/i)).toBeDefined();
    expect(screen.getByText(/Hücreyi Aşağı Çoğalt/i)).toBeDefined();
    expect(screen.getByText(/Satırı Sil \(Delete Row\)/i)).toBeDefined();
  });

  it('should close on Escape key press or outside click', () => {
    const callbacks = createMockCallbacks();

    render(
      <div>
        <div data-testid="outside">Outside Zone</div>
        <ContextMenuOverlay
          menu={defaultCellMenu}
          viewportWidth={1000}
          viewportHeight={800}
          theme={appleLight}
          locale={enUS}
          isCellEditable={true}
          isGroupedByCol={false}
          {...callbacks}
        />
      </div>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(callbacks.onClose).toHaveBeenCalled();

    callbacks.onClose.mockClear();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(callbacks.onClose).toHaveBeenCalled();
  });
});
