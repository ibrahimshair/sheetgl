// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorEditor } from '../../src/datagrid/columns/types/ColorColumn/ColorEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('ColorEditor Component', () => {
  const defaultColumn: ColumnDef = {
    id: 'color',
    title: 'Renk',
    width: 140,
    type: 'color',
  };

  const defaultProps = {
    column: defaultColumn,
    row: {},
    rowIndex: 0,
    rect: { x: 50, y: 100, width: 140, height: 34 },
    theme: appleLight,
    locale: trTR,
    onCommit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render preset color buttons and text input with initial hex value', () => {
    render(<ColorEditor {...defaultProps} value="#10B981" />);

    // 12 preset color buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(12);

    const textInput = screen.getByDisplayValue('#10B981');
    expect(textInput).toBeDefined();
  });

  it('should commit immediately when a preset color button is clicked', () => {
    const onCommit = vi.fn();
    render(<ColorEditor {...defaultProps} value="#38BDF8" onCommit={onCommit} />);

    const buttons = screen.getAllByRole('button');
    // Click the emerald color (#10B981) which is index 10 in PRESET_COLORS
    fireEvent.click(buttons[10]);

    expect(onCommit).toHaveBeenCalledWith('#10B981', 'none');
  });

  it('should update text input value when typing and commit on Enter', () => {
    const onCommit = vi.fn();
    render(<ColorEditor {...defaultProps} value="#38BDF8" onCommit={onCommit} />);

    const textInput = screen.getByDisplayValue('#38BDF8');
    fireEvent.change(textInput, { target: { value: '#FF00AA' } });

    expect(screen.getByDisplayValue('#FF00AA')).toBeDefined();

    fireEvent.keyDown(textInput, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith('#FF00AA', 'down');
  });

  it('should cancel on Escape key in text input', () => {
    const onCancel = vi.fn();
    render(<ColorEditor {...defaultProps} value="#38BDF8" onCancel={onCancel} />);

    const textInput = screen.getByDisplayValue('#38BDF8');
    fireEvent.keyDown(textInput, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('should commit on outside click', () => {
    const onCommit = vi.fn();
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <ColorEditor {...defaultProps} value="#8B5CF6" onCommit={onCommit} />
      </div>
    );

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(onCommit).toHaveBeenCalledWith('#8B5CF6', 'none');
  });
});
