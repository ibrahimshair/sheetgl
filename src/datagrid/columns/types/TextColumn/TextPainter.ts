import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintText({ ctx, value, theme, x, y, width, height, column, isHovered }: CellPaintContext<string>): void {
  const padX = 10;
  const maxW = width - padX * 2;
  if (maxW <= 0) return;

  const isValEmpty = value === null || value === undefined || value === '' || typeof value === 'function';

  if (isValEmpty) {
    if (column?.placeholder) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + padX, y, maxW, height);
      ctx.clip();

      ctx.fillStyle = isHovered
        ? (theme.isDark ? '#60A5FA' : '#2563EB')
        : (theme.isDark ? '#64748B' : '#94A3B8');
      ctx.font = `italic ${theme.fontSize}px ${theme.fontFamily}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(column.placeholder, x + padX, y + height / 2);

      ctx.restore();
    }
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + padX, y, maxW, height);
  ctx.clip();

  if (column?.onCellClick) {
    ctx.fillStyle = isHovered
      ? (theme.isDark ? '#93C5FD' : '#1D4ED8')
      : (theme.isDark ? '#E2E8F0' : '#0F172A');
    ctx.font = `600 ${theme.fontSize}px ${theme.fontFamily}`;
  } else {
    ctx.fillStyle = theme.canvas.cellText;
    ctx.font = `normal ${theme.fontSize}px ${theme.fontFamily}`;
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), x + padX, y + height / 2);

  ctx.restore();
}
