import React, { useEffect, useRef } from 'react';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { IGridLocale } from '../i18n/IGridLocale';
import { MaterialIcon } from '../ui/MaterialIcon';

export interface RowDetailPanelProps {
  rowIndex: number;
  rowKey: any;
  rowData: Record<string, any>;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  onClose: () => void;
}

export interface MasterDetailConfig {
  /** Whether the slide-over Master-Detail drawer is enabled (default: false) */
  enabled?: boolean;
  /** Custom title for the detail drawer or function returning title based on rowData */
  title?: string | ((data: Record<string, any>, rowIndex: number) => string);
  /** Width of the right-side detail drawer in pixels (default: 520) */
  drawerWidth?: number;
  /** Custom render function for the detail content (e.g. nested sub-grids, child tables, forms) */
  template?: (props: RowDetailPanelProps) => React.ReactNode;
}

export interface RowDetailDrawerProps {
  config: MasterDetailConfig;
  rowIndex: number;
  rowKey: any;
  rowData: Record<string, any>;
  theme: IGridThemeTokens;
  locale: IGridLocale;
  onClose: () => void;
}

export const RowDetailDrawer: React.FC<RowDetailDrawerProps> = ({
  config,
  rowIndex,
  rowKey,
  rowData,
  theme,
  locale,
  onClose,
}) => {
  const isTR = locale.code.startsWith('tr');
  const drawerRef = useRef<HTMLDivElement>(null);
  const width = config.drawerWidth || 540;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const computedTitle = typeof config.title === 'function'
    ? config.title(rowData, rowIndex)
    : config.title || (isTR ? `Satır Detayı (Row #${rowIndex + 1})` : `Row Details (Row #${rowIndex + 1})`);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 99990,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'sheetgl-fade-in 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={drawerRef}
        style={{
          width: '100%',
          maxWidth: width,
          height: '100%',
          backgroundColor: theme.dom.popoverBg || '#ffffff',
          color: theme.dom.popoverText || '#0f172a',
          borderLeft: `1px solid ${theme.dom.popoverBorder || '#e2e8f0'}`,
          boxShadow: '-8px 0 28px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'sheetgl-slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${theme.dom.popoverBorder || '#e2e8f0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: (theme.dom as any)?.headerBg || theme.canvas.headerBg || '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: `${theme.dom.accentColor || '#2563eb'}18`,
                color: theme.dom.accentColor || '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MaterialIcon name="table_chart" size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {computedTitle}
              </div>
              <div style={{ fontSize: 11, opacity: 0.65, fontFamily: 'monospace' }}>
                Key: {String(rowKey ?? rowIndex)} • Index: #{rowIndex + 1}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            title={isTR ? 'Kapat (Esc)' : 'Close (Esc)'}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: theme.dom.popoverText || '#64748b',
              width: 30,
              height: 30,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {config.template ? (
            config.template({
              rowIndex,
              rowKey,
              rowData,
              theme,
              locale,
              onClose,
            })
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, fontFamily: 'monospace' }}>
              <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>
                {isTR ? 'Satır Alanları (Row Fields):' : 'Row Fields:'}
              </div>
              {Object.entries(rowData || {}).map(([col, val]) => (
                <div
                  key={col}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    border: `1px solid ${theme.dom.popoverBorder || '#f1f5f9'}`,
                  }}
                >
                  <span style={{ fontWeight: 600, color: theme.dom.accentColor || '#2563eb' }}>{col}:</span>
                  <span style={{ wordBreak: 'break-all', textAlign: 'right', maxWidth: '65%' }}>
                    {val === null || val === undefined ? '—' : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
