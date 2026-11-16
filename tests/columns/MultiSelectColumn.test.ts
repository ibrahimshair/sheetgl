// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { MultiSelectColumnPlugin } from '../../src/datagrid/columns/types/MultiSelectColumn/index';
import {
  paintMultiSelect,
  normalizeMultiValue,
} from '../../src/datagrid/columns/types/MultiSelectColumn/MultiSelectPainter';
import { MultiSelectEditor } from '../../src/datagrid/columns/types/MultiSelectColumn/MultiSelectEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef, SelectOption } from '../../src/datagrid/types/grid';

describe('MultiSelectColumnPlugin & MultiSelectPainter', () => {
  const sampleOptions: SelectOption[] = [
    { value: 'react', label: 'React', bg: '#dbeafe', fg: '#1e40af' },
    { value: 'vue', label: 'Vue.js', bg: '#dcfce7', fg: '#166534', darkBg: '#064e3b', darkFg: '#6ee7b7' },
    { value: 'angular', label: 'Angular', bg: '#fee2e2', fg: '#991b1b' },
    { value: 'svelte', label: 'Svelte', bg: '#ffedd5', fg: '#9a3412' },
    { value: 'nextjs', label: 'Next.js' }, // fallback colors
  ];

  const defaultColumn: ColumnDef = {
    id: 'skills',
    title: 'Yetenekler',
    width: 220,
    type: 'multiselect',
    options: sampleOptions,
  };

  describe('Plugin Definition', () => {
    it('should have correct type and components', () => {
      expect(MultiSelectColumnPlugin.type).toBe('multiselect');
      expect(MultiSelectColumnPlugin.editorComponent).toBe(MultiSelectEditor);
      expect(MultiSelectColumnPlugin.paint).toBe(paintMultiSelect);
    });
  });

  describe('normalizeMultiValue', () => {
    it('should return empty array for null, undefined, and empty string', () => {
      expect(normalizeMultiValue(null)).toEqual([]);
      expect(normalizeMultiValue(undefined)).toEqual([]);
      expect(normalizeMultiValue('')).toEqual([]);
      expect(normalizeMultiValue('   ')).toEqual([]);
      expect(normalizeMultiValue([])).toEqual([]);
    });

    it('should normalize array of strings and trim tokens', () => {
      expect(normalizeMultiValue(['react', ' vue ', 'angular'])).toEqual([
        'react',
        'vue',
        'angular',
      ]);
    });

    it('should flatten nested arrays and remove duplicate items', () => {
      const nested = ['react', ['vue', ['angular', 'react']]];
      expect(normalizeMultiValue(nested)).toEqual(['react', 'vue', 'angular']);
    });

    it('should parse JSON array strings and escaped JSON arrays', () => {
      expect(normalizeMultiValue('["react", "vue", "svelte"]')).toEqual([
        'react',
        'vue',
        'svelte',
      ]);
      expect(normalizeMultiValue('"[\\"react\\", \\"angular\\"]"')).toEqual([
        'react',
        'angular',
      ]);
    });

    it('should parse delimited strings with comma, semicolon, pipe, and plus sign', () => {
      expect(normalizeMultiValue('react, vue, angular')).toEqual([
        'react',
        'vue',
        'angular',
      ]);
      expect(normalizeMultiValue('react; vue; angular')).toEqual([
        'react',
        'vue',
        'angular',
      ]);
      expect(normalizeMultiValue('react | vue | angular')).toEqual([
        'react',
        'vue',
        'angular',
      ]);
      expect(normalizeMultiValue('react + vue + angular')).toEqual([
        'react',
        'vue',
        'angular',
      ]);
    });

    it('should filter out null and undefined string tokens', () => {
      expect(normalizeMultiValue('react, null, undefined, vue')).toEqual([
        'react',
        'vue',
      ]);
    });

    it('should handle single scalar value by stringifying and wrapping in array', () => {
      expect(normalizeMultiValue(12345)).toEqual(['12345']);
      expect(normalizeMultiValue(true)).toEqual(['true']);
    });
  });

  describe('onPointerDown (Hit-Testing)', () => {
    it('should trigger editor when clicking on right dropdown arrow area (> width - 28)', () => {
      const result = MultiSelectColumnPlugin.onPointerDown?.({
        localX: 200, // 220 - 28 = 192 -> 200 is in dropdown arrow area
        localY: 15,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: ['react'],
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: true });
    });

    it('should not handle click when clicking inside content area (<= width - 28)', () => {
      const result = MultiSelectColumnPlugin.onPointerDown?.({
        localX: 100,
        localY: 15,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: ['react'],
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('onKeyDown', () => {
    it('should open editor on Enter or Space key', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const enterHandled = MultiSelectColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: ['react'],
      });

      expect(enterHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith();

      const spaceHandled = MultiSelectColumnPlugin.onKeyDown?.({
        event: { key: ' ', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: ['react'],
      });

      expect(spaceHandled).toBe(true);
      expect(openEditor).toHaveBeenCalledTimes(2);
    });

    it('should open editor with initial character when pressing single character key', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = MultiSelectColumnPlugin.onKeyDown?.({
        event: { key: 'v', length: 1, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: ['react'],
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('v');
    });

    it('should ignore keys with modifier keys (ctrl, meta, alt)', () => {
      const openEditor = vi.fn();

      const ctrlHandled = MultiSelectColumnPlugin.onKeyDown?.({
        event: { key: 'c', ctrlKey: true, preventDefault: vi.fn() } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: ['react'],
      });

      expect(ctrlHandled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard', () => {
    it('should return empty array for null or undefined clipboard text', () => {
      expect(MultiSelectColumnPlugin.parseClipboard?.(null as any, defaultColumn)).toEqual([]);
      expect(MultiSelectColumnPlugin.parseClipboard?.(undefined as any, defaultColumn)).toEqual([]);
    });

    it('should map clipboard text to option values by exact value or label', () => {
      const parsed = MultiSelectColumnPlugin.parseClipboard?.('React, Vue.js, Svelte', defaultColumn);
      expect(parsed).toEqual(['react', 'vue', 'svelte']);
    });

    it('should preserve unmatched items as-is', () => {
      const parsed = MultiSelectColumnPlugin.parseClipboard?.('React, TypeScript, Vue.js', defaultColumn);
      expect(parsed).toEqual(['react', 'TypeScript', 'vue']);
    });

    it('should work when column has no options defined', () => {
      const colNoOptions: ColumnDef = { id: 'tags', title: 'Tags', width: 100, type: 'multiselect' };
      const parsed = MultiSelectColumnPlugin.parseClipboard?.('Alpha, Beta, Gamma', colNoOptions);
      expect(parsed).toEqual(['Alpha', 'Beta', 'Gamma']);
    });
  });

  describe('formatClipboard', () => {
    it('should map values to option labels and join with comma', () => {
      const formatted = MultiSelectColumnPlugin.formatClipboard?.(['react', 'vue', 'angular'], defaultColumn);
      expect(formatted).toBe('React, Vue.js, Angular');
    });

    it('should fallback to raw value if label is not found in options', () => {
      const formatted = MultiSelectColumnPlugin.formatClipboard?.(['react', 'docker'], defaultColumn);
      expect(formatted).toBe('React, docker');
    });

    it('should return empty string for empty value', () => {
      expect(MultiSelectColumnPlugin.formatClipboard?.([], defaultColumn)).toBe('');
      expect(MultiSelectColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare two multi-select values using normalized comma string in Turkish collation', () => {
      const cmp = MultiSelectColumnPlugin.comparator;
      expect(cmp).toBeDefined();
      if (!cmp) return;

      expect(cmp(['react'], ['react'])).toBe(0);
      expect(cmp(['angular'], ['react'])).toBeLessThan(0);
      expect(cmp(['vue'], ['angular'])).toBeGreaterThan(0);
    });
  });

  describe('paintMultiSelect (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render pills with light theme colors', () => {
      const ctx = createMockContext();
      paintMultiSelect({
        ctx,
        value: ['react', 'vue'],
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 10,
        y: 20,
        width: 250,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: enUS,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith('React', expect.any(Number), expect.any(Number));
      expect(ctx.fillText).toHaveBeenCalledWith('Vue.js', expect.any(Number), expect.any(Number));
    });

    it('should render dark theme tag colors and borders', () => {
      const ctx = createMockContext();
      paintMultiSelect({
        ctx,
        value: ['vue', 'nextjs'],
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 10,
        y: 20,
        width: 250,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleDark,
        locale: enUS,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should render +N overflow badge when items exceed cell width', () => {
      const ctx = createMockContext();
      // Width of 130px will fit 1 pill and trigger +N overflow badge for remaining items
      paintMultiSelect({
        ctx,
        value: ['react', 'vue', 'angular', 'svelte'],
        column: { ...defaultColumn, width: 130 },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 130,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: enUS,
      });

      expect(ctx.fillText).toHaveBeenCalledWith(expect.stringMatching(/^\+\d+$/), expect.any(Number), expect.any(Number));
    });

    it('should not throw on empty or invalid value', () => {
      const ctx = createMockContext();
      expect(() => {
        paintMultiSelect({
          ctx,
          value: null as any,
        column: defaultColumn,
        row: {},
          rowIndex: 0,
          x: 0,
          y: 0,
          width: 200,
          height: 34,
          isHovered: false,
          isSelected: false,
          theme: appleLight,
        locale: enUS,
        });
      }).not.toThrow();
    });
  });
});
