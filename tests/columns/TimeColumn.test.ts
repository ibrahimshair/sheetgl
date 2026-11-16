// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { TimeColumnPlugin } from '../../src/datagrid/columns/types/TimeColumn/index';
import { paintTime } from '../../src/datagrid/columns/types/TimeColumn/TimePainter';
import { TimeEditor } from '../../src/datagrid/columns/types/TimeColumn/TimeEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('TimeColumnPlugin & paintTime', () => {
  const defaultColumn: ColumnDef = {
    id: 'start_time',
    title: 'Başlangıç Saati',
    width: 130,
    type: 'time',
  };

  describe('Plugin Definition', () => {
    it('should have type time, TimeEditor and paintTime', () => {
      expect(TimeColumnPlugin.type).toBe('time');
      expect(TimeColumnPlugin.editorComponent).toBe(TimeEditor);
      expect(TimeColumnPlugin.paint).toBe(paintTime);
    });
  });

  describe('onPointerDown (Subtle Clock Icon Hit)', () => {
    it('should open editor when clicking clock trigger zone on the right (localX > width - 28)', () => {
      const result = TimeColumnPlugin.onPointerDown?.({
        localX: 110, // width=130, 130 - 28 = 102
        localY: 17,
        value: '14:30',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        openEditor: vi.fn(),
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: true });
    });

    it('should return handled: false when clicking elsewhere on the cell', () => {
      const result = TimeColumnPlugin.onPointerDown?.({
        localX: 50,
        localY: 17,
        value: '14:30',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        openEditor: vi.fn(),
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('onKeyDown', () => {
    it('should open editor on Enter or Space key', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const enterHandled = TimeColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '10:00',
      });
      expect(enterHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith();

      openEditor.mockClear();
      preventDefault.mockClear();

      const spaceHandled = TimeColumnPlugin.onKeyDown?.({
        event: { key: ' ', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '10:00',
      });
      expect(spaceHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith();
    });

    it('should open editor with digit key when number is pressed without modifiers', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = TimeColumnPlugin.onKeyDown?.({
        event: { key: '1', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '09:00',
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('1');
    });

    it('should ignore letter keys and modifier combinations', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const letterHandled = TimeColumnPlugin.onKeyDown?.({
        event: { key: 't', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '',
      });
      expect(letterHandled).toBe(false);

      const ctrlHandled = TimeColumnPlugin.onKeyDown?.({
        event: { key: '1', ctrlKey: true, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '',
      });
      expect(ctrlHandled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard & formatClipboard', () => {
    it('should trim string on parseClipboard', () => {
      expect(TimeColumnPlugin.parseClipboard?.('  15:45  ')).toBe('15:45');
    });

    it('should format clipboard as string or empty', () => {
      expect(TimeColumnPlugin.formatClipboard?.('08:30')).toBe('08:30');
      expect(TimeColumnPlugin.formatClipboard?.(null as any)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare time strings ascending', () => {
      expect(TimeColumnPlugin.comparator?.('08:00', '14:30')).toBeLessThan(0);
      expect(TimeColumnPlugin.comparator?.('21:00', '09:00')).toBeGreaterThan(0);
      expect(TimeColumnPlugin.comparator?.('12:00', '12:00')).toBe(0);
    });
  });

  describe('paintTime (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        arc: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render time text and clock icon with hands', () => {
      const ctx = createMockContext();
      paintTime({
        ctx,
        value: '16:45',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 130,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalledTimes(2);
      expect(ctx.restore).toHaveBeenCalledTimes(2);

      // Text rendering
      expect(ctx.fillText).toHaveBeenCalledWith('16:45', 8, 17);

      // Clock circle
      expect(ctx.arc).toHaveBeenCalledWith(130 - 14, 17, 5.5, 0, Math.PI * 2);
      // Clock hands: center to top, center to right
      expect(ctx.moveTo).toHaveBeenCalledTimes(2);
      expect(ctx.lineTo).toHaveBeenCalledTimes(2);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should highlight clock icon stroke with accent color when hovered or selected', () => {
      const ctx = createMockContext();
      paintTime({
        ctx,
        value: '18:00',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 130,
        height: 34,
        isHovered: true,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.strokeStyle).toBe(appleLight.dom.accentColor);
    });

    it('should not render clock icon if width <= 55', () => {
      const ctx = createMockContext();
      paintTime({
        ctx,
        value: '09:00',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 50,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.arc).not.toHaveBeenCalled();
    });
  });
});
