import React from 'react';
import { MaterialIcon } from '../../datagrid/ui/MaterialIcon';
import { DocSection, DocSubItem, DocThemeColors } from '../types';

export interface DocsSidebarProps {
  sections: DocSection[];
  activeSectionId: string;
  activeSubId: string;
  expandedSections: Record<string, boolean>;
  expandedSubItems?: Record<string, boolean>;
  searchQuery: string;
  isTR: boolean;
  colors: DocThemeColors;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onSearchChange: (q: string) => void;
  onSelectSection: (id: string) => void;
  onToggleExpandSection: (id: string) => void;
  onToggleExpandSubItem?: (subId: string) => void;
  onSelectSubItem: (sectionId: string, sub: DocSubItem, parentSubId?: string) => void;
}

export const DocsSidebar: React.FC<DocsSidebarProps> = ({
  sections,
  activeSectionId,
  activeSubId,
  expandedSections,
  expandedSubItems = {},
  searchQuery,
  isTR,
  colors,
  isMobile = false,
  mobileOpen = false,
  onCloseMobile,
  onSearchChange,
  onSelectSection,
  onToggleExpandSection,
  onToggleExpandSubItem,
  onSelectSubItem,
}) => {
  if (isMobile && !mobileOpen) {
    return null;
  }

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            top: 56,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 540,
          }}
        />
      )}
      <aside
        style={{
          position: isMobile ? 'fixed' : 'relative',
          top: isMobile ? 56 : undefined,
          left: isMobile ? 0 : undefined,
          bottom: isMobile ? 0 : undefined,
          width: isMobile ? 'min(305px, 86vw)' : 295,
          backgroundColor: colors.sidebarBg,
          borderRight: `1px solid ${colors.border}`,
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          overflowY: 'auto',
          flexShrink: 0,
          zIndex: isMobile ? 550 : undefined,
          boxShadow: isMobile ? '12px 0 36px rgba(0,0,0,0.45)' : undefined,
        }}
      >
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <MaterialIcon
          name="search"
          size={16}
          color={colors.muted}
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isTR ? 'Dokümantasyonda ara...' : 'Search documentation...'}
          style={{
            width: '100%',
            padding: '10px 12px 10px 32px',
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.text,
            fontSize: 13.5,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {sections.map((sec) => {
        const isActive = sec.id === activeSectionId;
        const isExpanded = Boolean(expandedSections[sec.id] || isActive || searchQuery.trim());
        return (
          <div key={sec.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 9,
                border: isActive ? `1px solid ${colors.accent}` : '1px solid transparent',
                backgroundColor: isActive ? colors.accentBg : 'transparent',
              }}
            >
              <button
                type="button"
                onClick={() => onSelectSection(sec.id)}
                style={{
                  flex: 1,
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: isActive ? colors.accent : colors.text,
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  lineHeight: 1.35,
                }}
              >
                {isTR ? sec.titleTr : sec.titleEn}
              </button>
              {sec.subItems.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpandSection(sec.id);
                  }}
                  title={isTR ? 'Alt başlıkları aç/kapat' : 'Toggle sub-headings'}
                  style={{
                    padding: '8px 10px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: isActive ? colors.accent : colors.muted,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <MaterialIcon
                    name={isExpanded ? 'expand_more' : 'chevron_right'}
                    size={16}
                    color={isActive ? colors.accent : colors.muted}
                  />
                </button>
              )}
            </div>

            {isExpanded && sec.subItems.length > 0 && (
              <div
                style={{
                  marginLeft: 14,
                  paddingLeft: 10,
                  borderLeft: `2px solid ${isActive ? colors.accent : colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  marginTop: 2,
                  marginBottom: 6,
                }}
              >
                {sec.subItems.map((sub) => {
                  const hasChildren = Boolean(sub.children && sub.children.length > 0);
                  const isChildSelected = Boolean(
                    isActive && sub.children?.some((child) => child.id === activeSubId)
                  );
                  const isSubActive = isActive && activeSubId === sub.id;
                  const isSubExpanded = Boolean(
                    expandedSubItems[sub.id] || searchQuery.trim() || isChildSelected
                  );

                  return (
                    <div key={sub.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (hasChildren) {
                            onToggleExpandSubItem?.(sub.id);
                            if (!isSubExpanded) {
                              onSelectSubItem(sec.id, sub);
                            }
                          } else {
                            onSelectSubItem(sec.id, sub);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          textAlign: 'left',
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: 'none',
                          backgroundColor: isSubActive ? colors.accentBg : 'transparent',
                          color: isSubActive || isChildSelected ? colors.text : colors.muted,
                          fontSize: 12.5,
                          fontWeight: isSubActive || isChildSelected ? 700 : 500,
                          cursor: 'pointer',
                          lineHeight: 1.35,
                        }}
                      >
                        {hasChildren && (
                          <MaterialIcon
                            name={isSubExpanded ? 'expand_more' : 'chevron_right'}
                            size={14}
                            color={isSubExpanded || isChildSelected ? colors.accent : colors.muted}
                          />
                        )}
                        <span style={{ flex: 1 }}>{isTR ? sub.labelTr : sub.labelEn}</span>
                      </button>

                      {hasChildren && isSubExpanded && sub.children && (
                        <div
                          style={{
                            marginLeft: 18,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            marginBottom: 4,
                          }}
                        >
                          {sub.children.map((child) => {
                            const isChildActive = isActive && activeSubId === child.id;
                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => onSelectSubItem(sec.id, child, sub.id)}
                                style={{
                                  textAlign: 'left',
                                  padding: '5px 10px',
                                  borderRadius: 5,
                                  border: isChildActive
                                    ? `1px solid ${colors.accent}`
                                    : '1px solid transparent',
                                  backgroundColor: isChildActive ? colors.accentBg : 'transparent',
                                  color: isChildActive ? colors.accent : colors.muted,
                                  fontSize: 12,
                                  fontWeight: isChildActive ? 700 : 500,
                                  cursor: 'pointer',
                                  lineHeight: 1.35,
                                }}
                              >
                                {isTR ? child.labelTr : child.labelEn}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
    </>
  );
};
