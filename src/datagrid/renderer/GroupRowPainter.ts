import { VirtualRow } from '../types/group';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { IGridLocale } from '../i18n/IGridLocale';
import { ColumnDef } from '../types/grid';
import { FilterEngine } from '../core/FilterEngine';

export class GroupRowPainter {
  public static paintGroupRow(
    ctx: CanvasRenderingContext2D,
    groupRow: Extract<VirtualRow, { type: 'group' }>,
    y: number,
    width: number,
    height: number,
    theme: IGridThemeTokens,
    locale: IGridLocale,
    columns?: ColumnDef[],
    isHovered?: boolean
  ): void {
    ctx.save();

    // 1. Background
    ctx.fillStyle = isHovered
      ? theme.isDark
        ? 'rgba(56, 189, 248, 0.14)'
        : 'rgba(2, 132, 199, 0.09)'
      : theme.canvas.groupRowBg;
    ctx.fillRect(0, y, width, height);

    // 2. Bottom Border
    ctx.strokeStyle = theme.canvas.groupRowBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + height - 0.5);
    ctx.lineTo(width, y + height - 0.5);
    ctx.stroke();

    // 3. Left Accent Bar by Level
    ctx.fillStyle = theme.dom.accentColor;
    ctx.fillRect(groupRow.level * 6, y, 4, height);

    // 4. Interactive Expand/Collapse Button Box + Chevron (▶ / ▼)
    const indent = 16 + groupRow.level * 22;
    const midY = y + height / 2;
    const boxSize = 18;

    ctx.fillStyle = groupRow.isExpanded
      ? theme.dom.accentColor
      : theme.isDark
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(0,0,0,0.07)';
    ctx.beginPath();
    ctx.roundRect(indent - boxSize / 2, midY - boxSize / 2, boxSize, boxSize, 4);
    ctx.fill();

    ctx.fillStyle = groupRow.isExpanded ? '#FFFFFF' : theme.canvas.groupRowText;
    ctx.beginPath();
    if (groupRow.isExpanded) {
      ctx.moveTo(indent - 4, midY - 2);
      ctx.lineTo(indent + 4, midY - 2);
      ctx.lineTo(indent, midY + 3);
    } else {
      ctx.moveTo(indent - 2, midY - 4);
      ctx.lineTo(indent - 2, midY + 4);
      ctx.lineTo(indent + 3, midY);
    }
    ctx.closePath();
    ctx.fill();

    // 5. Resolve human-readable Column Title & Value Label
    const colDef = columns?.find((c) => c.id === groupRow.field);
    const colTitle = colDef ? colDef.title.replace(' ⚡', '') : groupRow.field.toUpperCase();

    let displayVal = String(groupRow.value ?? locale.emptyText);
    if ((colDef?.type === 'select' || colDef?.type === 'dropdown') && colDef.options) {
      const opt = colDef.options.find((o) => o.value === groupRow.value);
      if (opt) displayVal = opt.label;
    } else if (colDef?.type === 'multiselect' && colDef.options) {
      displayVal = String(groupRow.value ?? '')
        .split(',')
        .map((s) => s.trim())
        .map((v) => colDef.options?.find((o) => o.value === v)?.label || v)
        .join(', ');
    } else if (colDef?.type === 'boolean' || colDef?.type === 'switch') {
      displayVal = groupRow.value ? locale.trueText : locale.falseText;
    } else if (
      (colDef?.type === 'date' || colDef?.type === 'datetime') &&
      groupRow.value &&
      groupRow.value !== '(Blank)'
    ) {
      displayVal = FilterEngine.formatLocalizedDate(
        groupRow.value,
        locale.code,
        colDef.type === 'datetime'
      );
    }

    // 6. Group Header Title + Count Badge
    ctx.fillStyle = theme.canvas.groupRowText;
    ctx.font = `700 ${theme.fontSize}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const title = `${colTitle}: ${displayVal}`;
    ctx.fillText(title, indent + 16, midY);

    const titleW = ctx.measureText(title).width;
    const countText = `${locale.groupRecordCount(groupRow.rowCount)}`;
    ctx.font = `600 ${theme.fontSize - 2}px ${theme.fontFamily}`;
    const countW = ctx.measureText(countText).width + 12;
    const badgeX = indent + 24 + titleW;

    ctx.fillStyle = theme.dom.badgeBg;
    ctx.beginPath();
    ctx.roundRect(badgeX, midY - 9, countW, 18, 9);
    ctx.fill();

    ctx.fillStyle = theme.dom.badgeText;
    ctx.textAlign = 'center';
    ctx.fillText(countText, badgeX + countW / 2, midY);

    // 7. Group Summaries on the right
    if (groupRow.summaries && Object.keys(groupRow.summaries).length > 0) {
      const summaryText = Object.entries(groupRow.summaries)
        .slice(0, 4)
        .map(([k, v]) => {
          const sCol = columns?.find((c) => c.id === k);
          const sTitle = sCol ? sCol.title.replace(' ⚡', '') : k;
          const sType = groupRow.summaryTypes?.[k] || 'sum';
          const numStr = Number(v).toLocaleString(locale.code, {
            maximumFractionDigits: 2,
          });
          return `${sTitle} (${sType.toUpperCase()}): ${sCol?.currencySymbol || ''}${numStr}`;
        })
        .join('   •   ');

      ctx.fillStyle = theme.isDark ? '#98989D' : '#6E6E73';
      ctx.font = `600 ${theme.fontSize - 1}px ${theme.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(summaryText, width - 24, midY);
    }

    ctx.restore();
  }
}
