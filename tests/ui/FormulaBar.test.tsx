// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { FormulaBar } from '../../src/datagrid/ui/FormulaBar';
import { ColumnDef } from '../../src/datagrid/types/grid';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';

describe('FormulaBar Component', () => {
  const defaultCol: ColumnDef = {
    id: 'name',
    title: 'Full Name',
    type: 'text',
    width: 150,
  };

  it('should render active cell address accurately in Excel format (e.g. A1, C5)', () => {
    const { rerender } = render(
      <FormulaBar
        activeCoords={{ row: 0, col: 0 }}
        column={defaultCol}
        currentValue="John Doe"
        theme={appleLight}
        locale={enUS}
      />
    );

    expect(screen.getByText(/A1 \(R1:C1\)/i)).toBeDefined();

    rerender(
      <FormulaBar
        activeCoords={{ row: 4, col: 2 }} // 3rd col = C, 5th row = 5 -> C5
        column={defaultCol}
        currentValue="John Doe"
        theme={appleLight}
        locale={enUS}
      />
    );

    expect(screen.getByText(/C5 \(R5:C3\)/i)).toBeDefined();
  });

  it('should display multi-cell selection span (e.g. 3×2) when multiple cells are selected', () => {
    render(
      <FormulaBar
        activeCoords={{ row: 1, col: 1 }}
        selectionSpan={{ rows: 3, cols: 2 }}
        column={defaultCol}
        currentValue="Some text"
        theme={appleLight}
        locale={enUS}
      />
    );

    expect(screen.getByText('3×2')).toBeDefined();
  });

  it('should render text input with initial value and call onCommitValue on blur or Enter', () => {
    const onCommitValue = vi.fn();
    render(
      <FormulaBar
        activeCoords={{ row: 0, col: 0 }}
        column={defaultCol}
        currentValue="Initial Text"
        isEditable={true}
        onCommitValue={onCommitValue}
        theme={appleLight}
        locale={enUS}
      />
    );

    const input = screen.getByDisplayValue('Initial Text') as HTMLInputElement;
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: 'Updated Text' } });
    expect(input.value).toBe('Updated Text');

    fireEvent.blur(input);
    expect(onCommitValue).toHaveBeenCalledWith('Updated Text');
  });

  it('should revert draft text on Escape key press', () => {
    const onCommitValue = vi.fn();
    render(
      <FormulaBar
        activeCoords={{ row: 0, col: 0 }}
        column={defaultCol}
        currentValue="Stable Text"
        isEditable={true}
        onCommitValue={onCommitValue}
        theme={appleLight}
        locale={enUS}
      />
    );

    const input = screen.getByDisplayValue('Stable Text') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Draft modification' } });
    expect(input.value).toBe('Draft modification');

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.value).toBe('Stable Text');
  });

  it('should trigger onCopyValue when clicking copy button', () => {
    const onCopyValue = vi.fn();
    render(
      <FormulaBar
        activeCoords={{ row: 0, col: 0 }}
        column={defaultCol}
        currentValue="Copy Me"
        onCopyValue={onCopyValue}
        theme={appleLight}
        locale={enUS}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyBtn);

    expect(onCopyValue).toHaveBeenCalledWith('Copy Me');
  });

  it('should trigger onDuplicateDown and onDuplicateRow actions', () => {
    const onDuplicateDown = vi.fn();
    const onDuplicateRow = vi.fn();

    render(
      <FormulaBar
        activeCoords={{ row: 0, col: 0 }}
        column={defaultCol}
        currentValue="Row Data"
        canDuplicate={true}
        onDuplicateDown={onDuplicateDown}
        onDuplicateRow={onDuplicateRow}
        theme={appleLight}
        locale={enUS}
      />
    );

    const dupDownBtn = screen.getByRole('button', { name: /fill down/i });
    fireEvent.click(dupDownBtn);
    expect(onDuplicateDown).toHaveBeenCalled();

    const dupRowBtn = screen.getByRole('button', { name: /clone row/i });
    fireEvent.click(dupRowBtn);
    expect(onDuplicateRow).toHaveBeenCalled();
  });

  it('should render interactive boolean toggle for boolean column', () => {
    const onCommitValue = vi.fn();
    const boolCol: ColumnDef = { id: 'active', title: 'Active', type: 'boolean', width: 80 };

    const { rerender } = render(
      <FormulaBar
        activeCoords={{ row: 0, col: 0 }}
        column={boolCol}
        currentValue={false}
        isEditable={true}
        onCommitValue={onCommitValue}
        theme={appleLight}
        locale={trTR}
      />
    );

    expect(screen.getByText('HAYIR (False)')).toBeDefined();

    const toggleBtn = screen.getByRole('button', { name: /HAYIR \(False\)/i });
    fireEvent.click(toggleBtn);
    expect(onCommitValue).toHaveBeenCalledWith(true);

    rerender(
      <FormulaBar
        activeCoords={{ row: 0, col: 0 }}
        column={boolCol}
        currentValue={true}
        isEditable={true}
        onCommitValue={onCommitValue}
        theme={appleLight}
        locale={trTR}
      />
    );

    expect(screen.getByText('EVET (True)')).toBeDefined();
  });

  it('should render interactive select dropdown for select column', () => {
    const onCommitValue = vi.fn();
    const selectCol: ColumnDef = {
      id: 'role',
      title: 'Role',
      type: 'select',
      width: 120,
      options: [
        { value: 'admin', label: 'Yönetici' },
        { value: 'user', label: 'Standart Kullanıcı' },
      ],
    };

    render(
      <FormulaBar
        activeCoords={{ row: 0, col: 0 }}
        column={selectCol}
        currentValue="admin"
        isEditable={true}
        onCommitValue={onCommitValue}
        theme={appleLight}
        locale={trTR}
      />
    );

    expect(screen.getByText('Yönetici')).toBeDefined();
  });

  it('should render date input for date column type and allow setting today', () => {
    const onCommitValue = vi.fn();
    const dateCol: ColumnDef = { id: 'created', title: 'Created', type: 'date', width: 120 };

    render(
      <FormulaBar
        activeCoords={{ row: 0, col: 0 }}
        column={dateCol}
        currentValue="2026-11-18"
        isEditable={true}
        onCommitValue={onCommitValue}
        theme={appleLight}
        locale={trTR}
      />
    );

    const dateInput = screen.getByDisplayValue('2026-11-18') as HTMLInputElement;
    expect(dateInput).toBeDefined();

    const todayBtn = screen.getByText('Bugün');
    fireEvent.click(todayBtn);
    expect(onCommitValue).toHaveBeenCalled();
  });
});
