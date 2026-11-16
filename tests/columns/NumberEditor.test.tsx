// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { NumberEditor } from '../../src/datagrid/columns/types/NumberColumn/NumberEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('NumberEditor Component', () => {
  const defaultRect = { x: 50, y: 100, width: 120, height: 32 };
  const mockColumn: ColumnDef = { id: 'price', title: 'Fiyat', width: 120, type: 'number' };

  let onCommit: any;
  let onCancel: any;

  beforeEach(() => {
    onCommit = vi.fn();
    onCancel = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render inline input with numeric value and auto-focus', () => {
    render(
      <NumberEditor
        value={1500}
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
    expect(input.value).toBe('1500');
    expect(document.activeElement).toBe(input);
  });

  it('should support initialChar and position cursor at end', () => {
    render(
      <NumberEditor
        value={1500}
        initialChar="8"
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('8');
    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(1);
  });

  it('should commit with direction down on Enter key', () => {
    render(
      <NumberEditor
        value={100}
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '250' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith(250, 'down');
  });

  it('should commit with direction none on Shift+Enter', () => {
    render(
      <NumberEditor
        value={100}
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(onCommit).toHaveBeenCalledWith(100, 'none');
  });

  it('should commit with direction right or left on Tab key', () => {
    render(
      <NumberEditor
        value={50}
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: false });
    expect(onCommit).toHaveBeenCalledWith(50, 'right');

    const onCommitShift = vi.fn();
    render(
      <NumberEditor
        value={50}
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommitShift}
        onCancel={onCancel}
      />
    );
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.keyDown(inputs[1], { key: 'Tab', shiftKey: true });
    expect(onCommitShift).toHaveBeenCalledWith(50, 'left');
  });

  it('should parse Turkish comma decimals and whitespace correctly', () => {
    render(
      <NumberEditor
        value={0}
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1 250,75' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith(1250.75, 'down');
  });

  it('should fallback to 0 when input is empty or non-numeric', () => {
    render(
      <NumberEditor
        value={100}
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith(0, 'down');
  });

  it('should cancel on Escape key', () => {
    render(
      <NumberEditor
        value={100}
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '9999' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('should commit with direction none on input blur', () => {
    render(
      <NumberEditor
        value={100}
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '450' } });
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledWith(450, 'none');
  });

  it('should not commit twice if blur fires after Enter', () => {
    render(
      <NumberEditor
        value={100}
        column={mockColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '300' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(300, 'down');
  });
});
