// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { TimeEditor } from '../../src/datagrid/columns/types/TimeColumn/TimeEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('TimeEditor Component', () => {
  const defaultRect = { x: 100, y: 150, width: 140, height: 32 };
  const mockColumn: ColumnDef = { id: 'time', title: 'Time', width: 140, type: 'time' };

  let onCommit: any;
  let onCancel: any;

  beforeEach(() => {
    onCommit = vi.fn();
    onCancel = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render inline input with initial value and auto-focus', () => {
    render(
      <TimeEditor
        value="14:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('HH:mm') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('14:30');
    expect(document.activeElement).toBe(input);
  });

  it('should fallback to 09:00 when value is empty or not provided', () => {
    render(
      <TimeEditor
        value=""
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('HH:mm') as HTMLInputElement;
    expect(input.value).toBe('09:00');
  });

  it('should commit with direction down on Enter key', () => {
    render(
      <TimeEditor
        value="11:15"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('HH:mm');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith('11:15', 'down');
  });

  it('should commit with direction right on Tab and left on Shift+Tab', () => {
    const { unmount } = render(
      <TimeEditor
        value="16:45"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('HH:mm');
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: false });
    expect(onCommit).toHaveBeenCalledWith('16:45', 'right');

    unmount();

    render(
      <TimeEditor
        value="16:45"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input2 = screen.getByPlaceholderText('HH:mm');
    fireEvent.keyDown(input2, { key: 'Tab', shiftKey: true });
    expect(onCommit).toHaveBeenCalledWith('16:45', 'left');
  });

  it('should cancel editing on Escape key', () => {
    render(
      <TimeEditor
        value="12:00"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('HH:mm');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('should update input when clicking quick preset chips', () => {
    render(
      <TimeEditor
        value="09:00"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const presetBtn = screen.getByRole('button', { name: '14:30' });
    fireEvent.click(presetBtn);

    expect(onCommit).toHaveBeenCalledWith('14:30', 'none');
  });

  it('should clear value when clicking Clear button', () => {
    render(
      <TimeEditor
        value="10:00"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const clearBtn = screen.getByRole('button', { name: 'Clear' });
    fireEvent.click(clearBtn);

    expect(onCommit).toHaveBeenCalledWith('', 'none');
  });

  it('should apply current time when clicking Now button', () => {
    render(
      <TimeEditor
        value="08:00"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const nowBtn = screen.getByRole('button', { name: 'Now' });
    fireEvent.click(nowBtn);

    expect(onCommit).toHaveBeenCalled();
    const committedVal = onCommit.mock.calls[0][0];
    expect(committedVal).toMatch(/^\d{2}:\d{2}$/);
    expect(onCommit.mock.calls[0][1]).toBe('none');
  });

  it('should apply selected value when clicking Apply button', () => {
    render(
      <TimeEditor
        value="17:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const applyBtn = screen.getByRole('button', { name: 'Apply' });
    fireEvent.click(applyBtn);

    expect(onCommit).toHaveBeenCalledWith('17:30', 'none');
  });

  it('should display Turkish labels when locale is trTR', () => {
    render(
      <TimeEditor
        value="10:00"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('SAAT')).toBeDefined();
    expect(screen.getByText('DAKİKA')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Temizle' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Şimdi' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Uygula' })).toBeDefined();
  });

  it('should commit value on outside click', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <TimeEditor
          value="15:00"
          column={mockColumn}
          rect={defaultRect}
          theme={appleLight}
          locale={enUS}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      </div>
    );

    const outside = screen.getByTestId('outside-element');
    fireEvent.mouseDown(outside);

    expect(onCommit).toHaveBeenCalledWith('15:00', 'none');
  });
});
