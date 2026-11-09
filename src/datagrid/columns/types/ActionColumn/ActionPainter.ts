import { CellPaintContext } from '../../IColumnTypePlugin';
import { ensureMaterialSymbolsLoaded } from '../../../ui/materialIconLoader';

export function paintAction({ ctx, column, theme, x, y, width, height, isHovered }: CellPaintContext): void {
  const isIconOnly =
    column.buttonText === 'settings' ||
    column.buttonText === 'more_vert' ||
    column.buttonText === 'more_horiz' ||
    column.buttonText === '⚙️' ||
    column.buttonText === '⋯' ||
    !column.buttonText;

  const pad = 2;
  const btnH = 22;
  const btnY = y + (height - btnH) / 2;
  const btnW = isIconOnly ? Math.min(26, width - 4) : Math.max(22, width - pad * 2);
  const btnX = isIconOnly ? x + (width - btnW) / 2 : x + pad;
  if (btnW <= 4) return;

  ctx.save();

  // Buton arka planı
  ctx.fillStyle = isHovered
    ? theme.canvas.selectionBorder
    : theme.isDark
    ? '#2C2C2E'
    : '#F2F2F7';
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 5);
  ctx.fill();

  // Buton çerçevesi
  ctx.strokeStyle = isHovered
    ? theme.canvas.selectionBorder
    : theme.isDark
    ? '#3A3A3C'
    : '#E5E5EA';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Buton metni veya İkonu
  const textColor = isHovered ? '#FFFFFF' : (theme.isDark ? '#E5E5EA' : '#475569');
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const label = column.buttonText || 'settings';

  // Material Icon Ligatures
  const isMaterialIcon =
    label === 'settings' ||
    label === 'more_vert' ||
    label === 'more_horiz' ||
    label === 'tune' ||
    label === 'edit' ||
    label === 'delete' ||
    label === 'visibility' ||
    label === 'download' ||
    label === '⚙️' ||
    label === '⋯';

  if (isMaterialIcon) {
    ensureMaterialSymbolsLoaded();
    const iconName =
      label === '⚙️' || label === 'settings'
        ? 'settings'
        : label === '⋯' || label === 'more_horiz'
        ? 'more_horiz'
        : label;

    ctx.font = 'normal 15px "Material Symbols Rounded", "Material Symbols Outlined"';
    ctx.fillText(iconName, btnX + btnW / 2, btnY + btnH / 2 + 0.5);
  } else {
    ctx.font = `500 11px ${theme.fontFamily}`;
    ctx.fillText(label, btnX + btnW / 2, btnY + btnH / 2);
  }

  ctx.restore();
}
