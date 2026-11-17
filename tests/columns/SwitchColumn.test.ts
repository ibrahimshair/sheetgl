// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { SwitchColumnPlugin } from '../../src/datagrid/columns/types/SwitchColumn';
import { paintSwitch } from '../../src/datagrid/columns/types/SwitchColumn/SwitchPainter';
import { ColumnDef } from '../../src/datagrid/types/grid';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';

describe('SwitchColumnPlugin', () => {
  const defaultColumn: ColumnDef = {
    id: 'active',
    title: 'Active',
    type: 'switch',
    width: 100,
  };

  it('should have correct plugin metadata', () => {
    expect(SwitchColumnPlugin.type).toBe('switch');
    expect(SwitchColumnPlugin.paint).toBe(paintSwitch);
    expect(SwitchColumnPlugin.editorComponent).toBeUndefined();
  });

  describe('onPointerDown', () => {
    it('should toggle boolean value from false to true and return handled: true', () => {
      const setValue = vi.fn();
      const result = SwitchColumnPlugin.onPointerDown?.({
        localX: 20,
        localY: 10,
        value: false,
        column: defaultColumn,
        setValue,
      });

      expect(setValue).toHaveBeenCalledWith(true);
      expect(result).toEqual({ handled: true });
    });

    it('should toggle boolean value from true to false and return handled: true', () => {
      const setValue = vi.fn();
      const result = SwitchColumnPlugin.onPointerDown?.({
        localX: 20,
        localY: 10,
        value: true,
        column: defaultColumn,
        setValue,
      });

      expect(setValue).toHaveBeenCalledWith(false);
      expect(result).toEqual({ handled: true });
    });
  });

  describe('onKeyDown', () => {
    it('should toggle value on Space key press and prevent default', () => {
      const setValue = vi.fn();
      const preventDefault = vi.fn();
      const event = { key: ' ', preventDefault } as unknown as React.KeyboardEvent;

      const handled = SwitchColumnPlugin.onKeyDown?.({
        event,
        value: false,
        column: defaultColumn,
        setValue,
        openEditor: vi.fn(),
      });

      expect(preventDefault).toHaveBeenCalled();
      expect(setValue).toHaveBeenCalledWith(true);
      expect(handled).toBe(true);
    });

    it('should toggle value on Enter key press and prevent default', () => {
      const setValue = vi.fn();
      const preventDefault = vi.fn();
      const event = { key: 'Enter', preventDefault } as unknown as React.KeyboardEvent;

      const handled = SwitchColumnPlugin.onKeyDown?.({
        event,
        value: true,
        column: defaultColumn,
        setValue,
        openEditor: vi.fn(),
      });

      expect(preventDefault).toHaveBeenCalled();
      expect(setValue).toHaveBeenCalledWith(false);
      expect(handled).toBe(true);
    });

    it('should ignore other keys and return false', () => {
      const setValue = vi.fn();
      const preventDefault = vi.fn();
      const event = { key: 'ArrowDown', preventDefault } as unknown as React.KeyboardEvent;

      const handled = SwitchColumnPlugin.onKeyDown?.({
        event,
        value: false,
        column: defaultColumn,
        setValue,
        openEditor: vi.fn(),
      });

      expect(preventDefault).not.toHaveBeenCalled();
      expect(setValue).not.toHaveBeenCalled();
      expect(handled).toBe(false);
    });
  });

  describe('parseClipboard', () => {
    it('should parse truthy string representations into boolean true', () => {
      expect(SwitchColumnPlugin.parseClipboard?.('true', defaultColumn)).toBe(true);
      expect(SwitchColumnPlugin.parseClipboard?.('1', defaultColumn)).toBe(true);
      expect(SwitchColumnPlugin.parseClipboard?.('evet', defaultColumn)).toBe(true);
      expect(SwitchColumnPlugin.parseClipboard?.('aktif', defaultColumn)).toBe(true);
      expect(SwitchColumnPlugin.parseClipboard?.('yes', defaultColumn)).toBe(true);
      expect(SwitchColumnPlugin.parseClipboard?.('doğru', defaultColumn)).toBe(true);
      expect(SwitchColumnPlugin.parseClipboard?.('on', defaultColumn)).toBe(true);
    });

    it('should handle whitespace and uppercase strings gracefully', () => {
      expect(SwitchColumnPlugin.parseClipboard?.('  TRUE  ', defaultColumn)).toBe(true);
      expect(SwitchColumnPlugin.parseClipboard?.(' AKTIF ', defaultColumn)).toBe(true);
      expect(SwitchColumnPlugin.parseClipboard?.(' Yes ', defaultColumn)).toBe(true);
      expect(SwitchColumnPlugin.parseClipboard?.(' EVET ', defaultColumn)).toBe(true);
      expect(SwitchColumnPlugin.parseClipboard?.(' ON ', defaultColumn)).toBe(true);
    });

    it('should parse falsy or unrecognized strings into boolean false', () => {
      expect(SwitchColumnPlugin.parseClipboard?.('false', defaultColumn)).toBe(false);
      expect(SwitchColumnPlugin.parseClipboard?.('0', defaultColumn)).toBe(false);
      expect(SwitchColumnPlugin.parseClipboard?.('hayır', defaultColumn)).toBe(false);
      expect(SwitchColumnPlugin.parseClipboard?.('pasif', defaultColumn)).toBe(false);
      expect(SwitchColumnPlugin.parseClipboard?.('no', defaultColumn)).toBe(false);
      expect(SwitchColumnPlugin.parseClipboard?.('yanlış', defaultColumn)).toBe(false);
      expect(SwitchColumnPlugin.parseClipboard?.('off', defaultColumn)).toBe(false);
      expect(SwitchColumnPlugin.parseClipboard?.('', defaultColumn)).toBe(false);
      expect(SwitchColumnPlugin.parseClipboard?.('random text', defaultColumn)).toBe(false);
    });
  });

  describe('formatClipboard', () => {
    it('should format true as DOĞRU and false as YANLIŞ', () => {
      expect(SwitchColumnPlugin.formatClipboard?.(true, defaultColumn)).toBe('DOĞRU');
      expect(SwitchColumnPlugin.formatClipboard?.(false, defaultColumn)).toBe('YANLIŞ');
      expect(SwitchColumnPlugin.formatClipboard?.(undefined as any, defaultColumn)).toBe('YANLIŞ');
      expect(SwitchColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('YANLIŞ');
    });
  });

  describe('comparator', () => {
    it('should compare booleans with false ordered before true', () => {
      expect(SwitchColumnPlugin.comparator?.(true, true)).toBe(0);
      expect(SwitchColumnPlugin.comparator?.(false, false)).toBe(0);
      expect(SwitchColumnPlugin.comparator?.(true, false)).toBe(1);
      expect(SwitchColumnPlugin.comparator?.(false, true)).toBe(-1);
    });
  });

  describe('paintSwitch (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        lineCap: '',
        lineJoin: '',
        shadowColor: '',
        shadowBlur: 0,
        shadowOffsetY: 0,
      } as unknown as CanvasRenderingContext2D;
    }

    it('should return early without painting if dimensions are too small', () => {
      const ctx = createMockContext();
      paintSwitch({
        ctx,
        value: true,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        theme: appleLight,
        locale: trTR,
        x: 0,
        y: 0,
        width: 30, // < 32
        height: 24,
        isSelected: false,
        isHovered: false,
      });

      expect(ctx.save).not.toHaveBeenCalled();
    });

    it('should paint ON switch in light theme with green track and checkmark', () => {
      const ctx = createMockContext();
      paintSwitch({
        ctx,
        value: true,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        theme: appleLight,
        locale: trTR,
        x: 10,
        y: 5,
        width: 80,
        height: 30,
        isSelected: false,
        isHovered: false,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.roundRect).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('should paint ON switch in hovered state with darker emerald color', () => {
      const ctx = createMockContext();
      paintSwitch({
        ctx,
        value: true,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        theme: appleLight,
        locale: trTR,
        x: 10,
        y: 5,
        width: 80,
        height: 30,
        isSelected: false,
        isHovered: true,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should paint OFF switch in dark theme with cross icon', () => {
      const ctx = createMockContext();
      paintSwitch({
        ctx,
        value: false,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        theme: appleDark,
        locale: trTR,
        x: 0,
        y: 0,
        width: 80,
        height: 30,
        isSelected: false,
        isHovered: false,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('should paint outer selection ring when isSelected is true', () => {
      const ctx = createMockContext();
      paintSwitch({
        ctx,
        value: true,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        theme: appleLight,
        locale: trTR,
        x: 0,
        y: 0,
        width: 80,
        height: 30,
        isSelected: true,
        isHovered: false,
      });

      expect(ctx.save).toHaveBeenCalled();
      // outer ring triggers stroke before the checkmark stroke
      expect(ctx.stroke).toHaveBeenCalledTimes(2);
      expect(ctx.roundRect).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });
});
