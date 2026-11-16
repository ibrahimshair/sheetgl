// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { DateTimeEditor } from '../../src/datagrid/columns/types/DateTimeColumn/DateTimeEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('DateTimeEditor Component', () => {
  const defaultRect = { x: 50, y: 100, width: 180, height: 34 };
  const mockColumn: ColumnDef = { id: 'created_at', title: 'Oluşturulma', width: 180, type: 'datetime' };

  let onCommit: any;
  let onCancel: any;

  beforeEach(() => {
    onCommit = vi.fn();
    onCancel = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render inline input with localized value and auto-focus', () => {
    render(
      <DateTimeEditor
        value="2026-11-16 14:30"
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
    expect(input.value).toContain('14:30');
    expect(document.activeElement).toBe(input);
  });

  it('should render correct placeholder for TR vs EN locale', () => {
    const { unmount } = render(
      <DateTimeEditor
        value=""
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );
    expect(screen.getByPlaceholderText('GG.AA.YYYY SS:DD')).toBeDefined();
    unmount();

    render(
      <DateTimeEditor
        value=""
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );
    expect(screen.getByPlaceholderText('MM/DD/YYYY HH:mm')).toBeDefined();
  });

  it('should update day and input text when clicking on a calendar day', () => {
    render(
      <DateTimeEditor
        value="2026-11-16 14:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;

    // Day 20 is the first button matching '20' (calendar day is index 0)
    const day20Btn = screen.getAllByRole('button', { name: '20' })[0];
    fireEvent.click(day20Btn);

    expect(input.value).toMatch(/20[/.]11[/.]2026/);
  });

  it('should immediately commit when double-clicking on a day button', () => {
    render(
      <DateTimeEditor
        value="2026-11-16 14:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    // Day 25 in calendar
    const day25Btn = screen.getAllByRole('button', { name: '25' })[0];
    fireEvent.doubleClick(day25Btn);

    expect(onCommit).toHaveBeenCalledWith('2026-11-25 14:30', 'none');
  });

  it('should update hour and minute when clicking hour/minute buttons', () => {
    render(
      <DateTimeEditor
        value="2026-11-16 14:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;

    // Hour '18' is index 1 (index 0 is calendar day 18)
    const hour18Btn = screen.getAllByRole('button', { name: '18' })[1];
    fireEvent.click(hour18Btn);
    expect(input.value).toContain('18:30');

    // Minute '45' only exists in minute column
    const min45Btn = screen.getByRole('button', { name: '45' });
    fireEvent.click(min45Btn);
    expect(input.value).toContain('18:45');
  });

  it('should navigate months when clicking previous and next buttons', () => {
    render(
      <DateTimeEditor
        value="2026-11-16 14:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    const buttons = screen.getAllByRole('button');
    // Button 0 is prev month, Button 1 is next month in header
    fireEvent.click(buttons[0]); // Go to October
    expect(input.value).toMatch(/16[/.]10[/.]2026/);

    fireEvent.click(buttons[1]); // Go back to November
    expect(input.value).toMatch(/16[/.]11[/.]2026/);
  });

  it('should commit on Enter key with direction down', () => {
    render(
      <DateTimeEditor
        value="2026-11-16 14:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith(expect.stringMatching(/2026-11-16 14:30/), 'down');
  });

  it('should commit on Tab key with direction right or left', () => {
    render(
      <DateTimeEditor
        value="2026-11-16 14:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: false });
    expect(onCommit).toHaveBeenCalledWith(expect.stringMatching(/2026-11-16 14:30/), 'right');

    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
    expect(onCommit).toHaveBeenCalledWith(expect.stringMatching(/2026-11-16 14:30/), 'left');
  });

  it('should cancel on Escape key', () => {
    render(
      <DateTimeEditor
        value="2026-11-16 14:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('should commit empty string when clicking Temizle/Clear button', () => {
    render(
      <DateTimeEditor
        value="2026-11-16 14:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const clearBtn = screen.getByRole('button', { name: 'Temizle' });
    fireEvent.click(clearBtn);

    expect(onCommit).toHaveBeenCalledWith('', 'none');
  });

  it('should commit current date and time when clicking Şimdi/Now button', () => {
    render(
      <DateTimeEditor
        value="2026-11-16 14:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const nowBtn = screen.getByRole('button', { name: 'Şimdi' });
    fireEvent.click(nowBtn);

    expect(onCommit).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/), 'none');
  });

  it('should commit on clicking Apply/Uygula button', () => {
    render(
      <DateTimeEditor
        value="2026-11-16 14:30"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const applyBtn = screen.getByRole('button', { name: 'Uygula' });
    fireEvent.click(applyBtn);

    expect(onCommit).toHaveBeenCalledWith(expect.stringContaining('14:30'), 'none');
  });

  it('should commit on outside click', () => {
    render(
      <div>
        <div data-testid="outside-area">Outside</div>
        <DateTimeEditor
          value="2026-11-16 14:30"
          column={mockColumn}
          rect={defaultRect}
          theme={appleLight}
          locale={trTR}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      </div>
    );

    const outside = screen.getByTestId('outside-area');
    fireEvent.mouseDown(outside);

    expect(onCommit).toHaveBeenCalledWith(expect.stringContaining('2026-11-16'), 'none');
  });
});
