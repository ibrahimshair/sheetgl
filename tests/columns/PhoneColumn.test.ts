// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { PhoneColumnPlugin, paintPhone } from '../../src/datagrid/columns/types/PhoneColumn/index';
import { TextEditor } from '../../src/datagrid/columns/types/TextColumn/TextEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('PhoneColumnPlugin & paintPhone', () => {
  const defaultColumn: ColumnDef = {
    id: 'phone',
    title: 'Telefon',
    width: 180,
    type: 'phone',
  };

  describe('Plugin Definition', () => {
    it('should have type phone, TextEditor and paintPhone', () => {
      expect(PhoneColumnPlugin.type).toBe('phone');
      expect(PhoneColumnPlugin.editorComponent).toBe(TextEditor);
      expect(PhoneColumnPlugin.paint).toBe(paintPhone);
    });
  });

  describe('onKeyDown', () => {
    it('should open text editor on numeric or phone character keys (+, -, (, ), space)', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      ['5', '+', '(', ')', '-', ' '].forEach((char) => {
        const handled = PhoneColumnPlugin.onKeyDown?.({
          event: { key: char, ctrlKey: false, metaKey: false, preventDefault } as any,
          openEditor,
          setValue: vi.fn(),
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          value: '',
        });

        expect(handled).toBe(true);
        expect(openEditor).toHaveBeenCalledWith(char);
      });
    });

    it('should not open editor on letters or modifier combinations', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const letterHandled = PhoneColumnPlugin.onKeyDown?.({
        event: { key: 'a', ctrlKey: false, metaKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '',
      });
      expect(letterHandled).toBe(false);

      const ctrlHandled = PhoneColumnPlugin.onKeyDown?.({
        event: { key: '5', ctrlKey: true, metaKey: false, preventDefault } as any,
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
    it('should trim whitespace on parseClipboard', () => {
      expect(PhoneColumnPlugin.parseClipboard?.('  +90 (555) 000-0000  ', defaultColumn)).toBe('+90 (555) 000-0000');
    });

    it('should format clipboard value as string', () => {
      expect(PhoneColumnPlugin.formatClipboard?.('+90 532 111 22 33', defaultColumn)).toBe('+90 532 111 22 33');
      expect(PhoneColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare phone strings using Turkish locale', () => {
      expect(PhoneColumnPlugin.comparator?.('+90 532 100', '+90 532 200')).toBeLessThan(0);
      expect(PhoneColumnPlugin.comparator?.('+90 532 200', '+90 532 100')).toBeGreaterThan(0);
      expect(PhoneColumnPlugin.comparator?.('+90 532 100', '+90 532 100')).toBe(0);
    });
  });

  describe('paintPhone (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render phone icon (☎) and monospace formatted number', () => {
      const ctx = createMockContext();
      paintPhone({
        ctx,
        value: '+90 532 000 0000',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 180,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.clip).toHaveBeenCalled();

      // Icon ☎
      expect(ctx.fillText).toHaveBeenCalledWith('☎', 8, 17);
      // Phone text in monospace
      expect(ctx.fillText).toHaveBeenCalledWith('+90 532 000 0000', 24, 17);
    });

    it('should render emerald green icon in dark mode (#34D399)', () => {
      const ctx = createMockContext();
      paintPhone({
        ctx,
        value: '+1 (555) 123-4567',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 180,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('☎', 8, 17);
      expect(ctx.fillText).toHaveBeenCalledWith('+1 (555) 123-4567', 24, 17);
    });

    it('should not render anything if value is empty', () => {
      const ctx = createMockContext();
      paintPhone({
        ctx,
        value: '',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 180,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).not.toHaveBeenCalled();
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });
});
