// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { MultiSelectEditor } from '../../src/datagrid/columns/types/MultiSelectColumn/MultiSelectEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef, SelectOption } from '../../src/datagrid/types/grid';

describe('MultiSelectEditor Component', () => {
  const defaultRect = { x: 50, y: 100, width: 220, height: 34 };

  const sampleOptions: SelectOption[] = [
    { value: 'react', label: 'React', bg: '#dbeafe', fg: '#1e40af' },
    { value: 'vue', label: 'Vue.js', bg: '#dcfce7', fg: '#166534' },
    { value: 'angular', label: 'Angular', bg: '#fee2e2', fg: '#991b1b' },
    { value: 'svelte', label: 'Svelte', bg: '#ffedd5', fg: '#9a3412' },
  ];

  const defaultColumn: ColumnDef = {
    id: 'frameworks',
    title: 'Frameworks',
    width: 220,
    type: 'multiselect',
    options: sampleOptions,
  };

  let onCommit: any;
  let onCancel: any;

  beforeEach(() => {
    onCommit = vi.fn();
    onCancel = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render search box with auto-focus and show initial selected count in TR locale', () => {
    render(
      <MultiSelectEditor
        value={['react', 'vue']}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={trTR}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('Çoklu seçim ara...') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(document.activeElement).toBe(input);
    expect(screen.getByText('2 seçildi')).toBeDefined();
  });

  it('should render search box with EN locale placeholder and selected count', () => {
    render(
      <MultiSelectEditor
        value={['react']}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    expect(screen.getByPlaceholderText('Search multiple choices...')).toBeDefined();
    expect(screen.getByText('1 selected')).toBeDefined();
  });

  it('should support initialChar and pre-fill search input', () => {
    render(
      <MultiSelectEditor
        value={[]}
        initialChar="ang"
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('Search multiple choices...') as HTMLInputElement;
    expect(input.value).toBe('ang');
    expect(screen.getByText('Angular')).toBeDefined();
    expect(screen.queryByText('React')).toBeNull();
  });

  it('should filter options based on search query', () => {
    render(
      <MultiSelectEditor
        value={[]}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('Search multiple choices...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'vue' } });

    expect(screen.getByText('Vue.js')).toBeDefined();
    expect(screen.queryByText('React')).toBeNull();
    expect(screen.queryByText('Angular')).toBeNull();
  });

  it('should show no matching options message when search query yields 0 results', () => {
    render(
      <MultiSelectEditor
        value={[]}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('Search multiple choices...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'nonexistent-framework' } });

    expect(screen.getByText(enUS.noMatches || 'No matching options')).toBeDefined();
  });

  it('should toggle options when clicking on option rows', () => {
    render(
      <MultiSelectEditor
        value={['react']}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    // Initial count is 1 selected
    expect(screen.getByText('1 selected')).toBeDefined();

    // Click on Vue.js to add it
    const vueOption = screen.getByText('Vue.js').closest('div[style*="cursor: pointer"]')!;
    fireEvent.click(vueOption);
    expect(screen.getByText('2 selected')).toBeDefined();

    // Click on React to remove it
    const reactOption = screen.getByText('React').closest('div[style*="cursor: pointer"]')!;
    fireEvent.click(reactOption);
    expect(screen.getByText('1 selected')).toBeDefined();
  });

  it('should select all options when clicking Select All button', () => {
    render(
      <MultiSelectEditor
        value={[]}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('0 selected')).toBeDefined();

    const selectAllBtn = screen.getByText('Select All');
    fireEvent.click(selectAllBtn);

    expect(screen.getByText('4 selected')).toBeDefined();
  });

  it('should clear all selected options when clicking Clear button', () => {
    render(
      <MultiSelectEditor
        value={['react', 'vue', 'angular']}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('3 selected')).toBeDefined();

    const clearBtn = screen.getByText('Clear');
    fireEvent.click(clearBtn);

    expect(screen.getByText('0 selected')).toBeDefined();
  });

  it('should commit with direction down on Enter key', () => {
    render(
      <MultiSelectEditor
        value={['react', 'svelte']}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('Search multiple choices...') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith('react, svelte', 'down');
  });

  it('should commit with direction right or left on Tab key', () => {
    render(
      <MultiSelectEditor
        value={['react']}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('Search multiple choices...') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: false });
    expect(onCommit).toHaveBeenCalledWith('react', 'right');

    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
    expect(onCommit).toHaveBeenCalledWith('react', 'left');
  });

  it('should cancel on Escape key or Cancel button', () => {
    render(
      <MultiSelectEditor
        value={['react']}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('Search multiple choices...') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('should commit as array when saveAsArray is true and value was an array', () => {
    const arrayCol: ColumnDef = {
      ...defaultColumn,
      saveAsArray: true,
    } as any;

    render(
      <MultiSelectEditor
        value={['react', 'vue']}
        column={arrayCol}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('Search multiple choices...') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith(['react', 'vue'], 'down');
  });

  it('should respect custom separator when committing delimited string', () => {
    const customSepCol: ColumnDef = {
      ...defaultColumn,
      separator: ' | ',
    } as any;

    render(
      <MultiSelectEditor
        value="react | vue"
        column={customSepCol}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('Search multiple choices...') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith('react | vue', 'down');
  });

  it('should toggle highlighted option when pressing Space key with empty search', () => {
    render(
      <MultiSelectEditor
        value={[]}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const input = screen.getByPlaceholderText('Search multiple choices...') as HTMLInputElement;

    // Initially 0 selected, highlighted index is 0 (React)
    fireEvent.keyDown(input, { key: ' ' });
    expect(screen.getByText('1 selected')).toBeDefined();

    // Arrow down to highlight index 1 (Vue.js) and press Space
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: ' ' });
    expect(screen.getByText('2 selected')).toBeDefined();

    // Arrow up to index 0 and press Space to uncheck React
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: ' ' });
    expect(screen.getByText('1 selected')).toBeDefined();
  });

  it('should commit on clicking outside the container', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <MultiSelectEditor
          value={['angular']}
          column={defaultColumn}
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

    expect(onCommit).toHaveBeenCalledWith('angular', 'none');
  });

  it('should commit on clicking Apply button', () => {
    render(
      <MultiSelectEditor
        value={['react', 'svelte']}
        column={defaultColumn}
        rect={defaultRect}
        theme={appleLight}
        locale={enUS}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );

    const applyBtn = screen.getByText('Apply (2)');
    fireEvent.click(applyBtn);

    expect(onCommit).toHaveBeenCalledWith(['react', 'svelte'], 'none');
  });
});
