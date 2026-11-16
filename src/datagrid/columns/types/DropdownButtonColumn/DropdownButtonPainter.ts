import { CellPaintContext } from '../../IColumnTypePlugin';
import { ensureMaterialSymbolsLoaded } from '../../../ui/materialIconLoader';

function resolveLabel(value: any, buttonText?: string, title?: string): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object' && value.label) return String(value.label);
  if (buttonText) return buttonText;
  return title || 'Actions';
}

function resolveIcon(value: any, buttonIcon?: string): string | undefined {
  if (value && typeof value === 'object' && value.icon) return String(value.icon);
  return buttonIcon;
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (maxWidth <= 4) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  const ellipsis = '…';
  const ellipsisWidth = ctx.measureText(ellipsis).width;
  if (ellipsisWidth >= maxWidth) return '';
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(text.slice(0, mid)).width + ellipsisWidth <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return text.slice(0, lo) + ellipsis;
}

/**
 * Paints a split-style dropdown button inside the cell:
 * `[ (icon) Label   v ]`
 */
export function paintDropdownButton({
  ctx,
  value,
  column,
  theme,
  x,
  y,
  width,
  height,
  isHovered,
  isSelected,
}: CellPaintContext<any>): void {
  const padX = 5;
  const btnH = Math.min(24, Math.max(18, height - 6));
  const btnW = width - padX * 2;
  if (btnW <= 10) return;

  const btnX = x + padX;
  const btnY = y + (height - btnH) / 2;
  const radius = 5;

  ctx.save();

  // Button surface
  ctx.fillStyle = isHovered
    ? theme.isDark
      ? '#3A3A3C'
      : '#F8FAFC'
    : theme.isDark
    ? '#2C2C2E'
    : '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, radius);
  ctx.fill();

  // Button border
  ctx.strokeStyle = isHovered
    ? theme.canvas.selectionBorder
    : isSelected
    ? theme.canvas.selectionBorder
    : theme.isDark
    ? '#3F3F46'
    : '#D1D5DB';
  ctx.lineWidth = 1;
  ctx.stroke();

  const textColor = theme.isDark ? '#F1F5F9' : '#1E293B';
  const chevronColor = isHovered
    ? theme.canvas.selectionBorder
    : theme.isDark
    ? '#94A3B8'
    : '#64748B';

  const centerY = btnY + btnH / 2;
  const chevronZoneW = 20;
  let contentLeft = btnX + 8;

  // Optional leading icon
  const icon = resolveIcon(value, column.buttonIcon);
  if (icon && btnW > 36) {
    const isMaterialIcon = /^[a-z0-9_]+$/i.test(icon);
    if (isMaterialIcon) {
      ensureMaterialSymbolsLoaded();
      const canRenderMaterial =
        typeof document !== 'undefined' &&
        'fonts' in document &&
        (document.fonts.check('14px "Material Symbols Rounded"') ||
          document.fonts.check('14px "Material Symbols Outlined"'));
      if (canRenderMaterial) {
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'normal 14px "Material Symbols Rounded", "Material Symbols Outlined"';
        ctx.fillText(icon, contentLeft + 6, centerY + 0.5);
        contentLeft += 18;
      }
    } else {
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `12px ${theme.fontFamily}`;
      ctx.fillText(icon, contentLeft + 6, centerY + 0.5);
      contentLeft += 18;
    }
  }

  // Button label
  const label = resolveLabel(value, column.buttonText, column.title);
  const maxTextW = btnX + btnW - chevronZoneW - contentLeft;
  if (maxTextW > 8 && label) {
    ctx.font = `500 11.5px ${theme.fontFamily}`;
    const fitted = truncateText(ctx, label, maxTextW);
    if (fitted) {
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(fitted, contentLeft, centerY + 0.5);
    }
  }

  // Trailing downward chevron (v)
  const cx = btnX + btnW - 11;
  const cy = centerY;
  ctx.strokeStyle = chevronColor;
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 3.5, cy - 1.5);
  ctx.lineTo(cx, cy + 2);
  ctx.lineTo(cx + 3.5, cy - 1.5);
  ctx.stroke();

  ctx.restore();
}

