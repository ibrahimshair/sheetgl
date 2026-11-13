// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { DateEditor } from '../../src/datagrid/columns/types/DateColumn/DateEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('DateEditor Component', () => {
  const defaultRect = { x: 100, y: 150, width: 140, height: 32 };
  const mockColumn: ColumnDef = { id: 'created_at', title: 'Tarih', width: 140, type: 'date' };

  let onCommit: any;
  let onCancel: any;

  beforeEach(() => {
    onCommit = vi.fn();
    onCancel = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render inline input with localized date value and focus', () => {
    render(
      <DateEditor
        value="2026-11-13"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('13/11/2026'); // trTR format
    expect(document.activeElement).toBe(input);
  });

  it('should support initialChar and position cursor at end', () => {
    render(
      <DateEditor
        value="2026-11-13"
        initialChar="2"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('2');
    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(1);
  });

  it('should automatically apply date mask in Turkish locale (DD.MM.YYYY)', () => {
    render(
      <DateEditor
        value=""
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;

    // Simulate typing 16021988
    fireEvent.change(input, { target: { value: '16021988' } });
    expect(input.value).toBe('16.02.1988');
  });

  it('should automatically apply date mask in English locale (MM/DD/YYYY)', () => {
    render(
      <DateEditor
        value=""
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;

    // Simulate typing 02161988
    fireEvent.change(input, { target: { value: '02161988' } });
    expect(input.value).toBe('02/16/1988');
  });

  it('should normalize and commit ISO date on Enter key', () => {
    render(
      <DateEditor
        value=""
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '13.11.2026' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith('2026-11-13', 'down');
  });

  it('should commit with right on Tab and left on Shift+Tab', () => {
    const { unmount } = render(
      <DateEditor
        value="2026-11-13"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: false });
    expect(onCommit).toHaveBeenCalledWith('2026-11-13', 'right');

    unmount();

    render(
      <DateEditor
        value="2026-11-13"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input2 = screen.getByRole('textbox');
    fireEvent.keyDown(input2, { key: 'Tab', shiftKey: true });
    expect(onCommit).toHaveBeenCalledWith('2026-11-13', 'left');
  });

  it('should cancel on Escape key without commit', () => {
    render(
      <DateEditor
        value="2026-11-13"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('should commit selected day when clicking a calendar day cell', () => {
    render(
      <DateEditor
        value="2026-11-13"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    // Find day button for 15
    const dayBtn = screen.getByRole('button', { name: '15' });
    fireEvent.click(dayBtn);

    expect(onCommit).toHaveBeenCalledWith('2026-11-15', 'none');
  });

  it('should commit today date when clicking Bugün (Today) button', () => {
    render(
      <DateEditor
        value="2026-11-13"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const todayBtn = screen.getByRole('button', { name: 'Bugün' });
    fireEvent.click(todayBtn);

    expect(onCommit).toHaveBeenCalled();
    const committedVal = onCommit.mock.calls[0][0];
    expect(committedVal).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(onCommit.mock.calls[0][1]).toBe('none');
  });

  it('should navigate months on prev/next button clicks', () => {
    render(
      <DateEditor
        value="2026-11-13"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const comboboxes = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const yearSelect = comboboxes[0];
    const monthSelect = comboboxes[1];

    // Initial year is 2026, month is 11 (Kasım)
    expect(yearSelect.value).toBe('2026');
    expect(monthSelect.value).toBe('11');

    // Navigation buttons use onMouseDown
    const chevronLeft = screen.getByText('chevron_left').closest('button')!;
    const chevronRight = screen.getAllByText('chevron_right')[1].closest('button')!;

    // Click next month -> 12 (Aralık)
    fireEvent.mouseDown(chevronRight);
    expect(monthSelect.value).toBe('12');

    // Click prev month twice -> 10 (Ekim)
    fireEvent.mouseDown(chevronLeft);
    fireEvent.mouseDown(chevronLeft);
    expect(monthSelect.value).toBe('10');
  });

  it('should commit value on outside click', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside Area</div>
        <DateEditor
          value="2026-11-13"
          column={mockColumn}
          rect={defaultRect}
          theme={appleLight}
          locale={trTR}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      </div>
    );

    const outside = screen.getByTestId('outside-element');
    fireEvent.mouseDown(outside);

    expect(onCommit).toHaveBeenCalledWith('2026-11-13', 'none');
  });
});
