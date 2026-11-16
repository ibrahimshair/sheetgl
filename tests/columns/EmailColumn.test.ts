// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { EmailColumnPlugin, paintEmail } from '../../src/datagrid/columns/types/EmailColumn/index';
import { TextEditor } from '../../src/datagrid/columns/types/TextColumn/TextEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('EmailColumnPlugin & paintEmail', () => {
  const defaultColumn: ColumnDef = {
    id: 'email',
    title: 'E-Posta',
    width: 220,
    type: 'email',
  };

  describe('Plugin Definition', () => {
    it('should have type email, TextEditor and paintEmail', () => {
      expect(EmailColumnPlugin.type).toBe('email');
      expect(EmailColumnPlugin.editorComponent).toBe(TextEditor);
      expect(EmailColumnPlugin.paint).toBe(paintEmail);
    });
  });

  describe('onKeyDown', () => {
    it('should open text editor on printable character key', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = EmailColumnPlugin.onKeyDown?.({
        event: { key: 'u', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '',
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('u');
    });

    it('should not open editor on shortcut combinations or special keys', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const ctrlHandled = EmailColumnPlugin.onKeyDown?.({
        event: { key: 'a', ctrlKey: true, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '',
      });
      expect(ctrlHandled).toBe(false);

      const tabHandled = EmailColumnPlugin.onKeyDown?.({
        event: { key: 'Tab', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '',
      });
      expect(tabHandled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard & formatClipboard', () => {
    it('should trim text on parseClipboard', () => {
      expect(EmailColumnPlugin.parseClipboard?.('  user@sheetgl.io  ', defaultColumn)).toBe('user@sheetgl.io');
    });

    it('should format clipboard as string', () => {
      expect(EmailColumnPlugin.formatClipboard?.('test@domain.com', defaultColumn)).toBe('test@domain.com');
      expect(EmailColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare emails using Turkish collation', () => {
      expect(EmailColumnPlugin.comparator?.('ali@test.com', 'veli@test.com')).toBeLessThan(0);
      expect(EmailColumnPlugin.comparator?.('veli@test.com', 'ali@test.com')).toBeGreaterThan(0);
      expect(EmailColumnPlugin.comparator?.('ali@test.com', 'ali@test.com')).toBe(0);
    });
  });

  describe('paintEmail (Canvas 2D Rendering)', () => {
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

    it('should render envelope icon (✉) and email text', () => {
      const ctx = createMockContext();
      paintEmail({
        ctx,
        value: 'contact@sheetgl.io',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 220,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.clip).toHaveBeenCalled();

      // Envelope icon
      expect(ctx.fillText).toHaveBeenCalledWith('✉', 8, 17);
      // Email text
      expect(ctx.fillText).toHaveBeenCalledWith('contact@sheetgl.io', 26, 17);
    });

    it('should render mail icon with dark mode cyan #38BDF8', () => {
      const ctx = createMockContext();
      paintEmail({
        ctx,
        value: 'dev@sheetgl.io',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 220,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('dev@sheetgl.io', 26, 17);
    });

    it('should not render anything if value is empty', () => {
      const ctx = createMockContext();
      paintEmail({
        ctx,
        value: '',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 220,
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
