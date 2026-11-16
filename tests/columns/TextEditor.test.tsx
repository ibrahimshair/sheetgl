// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextEditor } from '../../src/datagrid/columns/types/TextColumn/TextEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('TextEditor Component', () => {
  const defaultColumn: ColumnDef = {
    id: 'description',
    title: 'Açıklama',
    width: 200,
    type: 'text',
  };

  const defaultProps = {
    column: defaultColumn,
    row: {},
    rowIndex: 0,
    rect: { x: 40, y: 80, width: 200, height: 32 },
    theme: appleLight,
    locale: trTR,
    onCommit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should auto-focus and select all text if no initialChar is passed', () => {
    render(<TextEditor {...defaultProps} value="Önceden Girilmiş" />);

    const input = screen.getByDisplayValue('Önceden Girilmiş') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(document.activeElement).toBe(input);
  });

  it('should replace value with initialChar and position cursor at end when initialChar is given', () => {
    render(<TextEditor {...defaultProps} value="Eski Değer" initialChar="Y" />);

    const input = screen.getByDisplayValue('Y') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(1);
  });

  it('should commit with direction down on Enter key', () => {
    const onCommit = vi.fn();
    render(<TextEditor {...defaultProps} value="Satır 1" onCommit={onCommit} />);

    const input = screen.getByDisplayValue('Satır 1');
    fireEvent.change(input, { target: { value: 'Satır 1 Güncel' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith('Satır 1 Güncel', 'down');
  });

  it('should commit with direction none on Shift+Enter key', () => {
    const onCommit = vi.fn();
    render(<TextEditor {...defaultProps} value="Satır 1" onCommit={onCommit} />);

    const input = screen.getByDisplayValue('Satır 1');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(onCommit).toHaveBeenCalledWith('Satır 1', 'none');
  });

  it('should commit with direction right on Tab key', () => {
    const onCommit = vi.fn();
    render(<TextEditor {...defaultProps} value="Hücre A" onCommit={onCommit} />);

    const input = screen.getByDisplayValue('Hücre A');
    fireEvent.keyDown(input, { key: 'Tab' });

    expect(onCommit).toHaveBeenCalledWith('Hücre A', 'right');
  });

  it('should commit with direction left on Shift+Tab key', () => {
    const onCommit = vi.fn();
    render(<TextEditor {...defaultProps} value="Hücre B" onCommit={onCommit} />);

    const input = screen.getByDisplayValue('Hücre B');
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });

    expect(onCommit).toHaveBeenCalledWith('Hücre B', 'left');
  });

  it('should cancel on Escape key', () => {
    const onCancel = vi.fn();
    render(<TextEditor {...defaultProps} value="Vazgeçilecek" onCancel={onCancel} />);

    const input = screen.getByDisplayValue('Vazgeçilecek');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('should commit with direction none on blur', () => {
    const onCommit = vi.fn();
    render(<TextEditor {...defaultProps} value="Odak Kaybı" onCommit={onCommit} />);

    const input = screen.getByDisplayValue('Odak Kaybı');
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledWith('Odak Kaybı', 'none');
  });

  it('should not double-commit after Escape', () => {
    const onCommit = vi.fn();
    const onCancel = vi.fn();
    render(<TextEditor {...defaultProps} value="Tek Sefer" onCommit={onCommit} onCancel={onCancel} />);

    const input = screen.getByDisplayValue('Tek Sefer');
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.blur(input);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });
});
