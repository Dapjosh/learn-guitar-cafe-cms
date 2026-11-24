'use client';
import React from 'react';
import cn from 'classnames';
import { useScrollTop } from '@lgc_cms/hooks';
import { ArrowUp } from 'iconsax-react';

export type BackToTopProps = {
  /** Button background (default: brand orange) */
  bgColor?: string | null;
  /** Arrow colour (default: white) */
  iconColor?: string | null;
  /** Background on hover / keyboard focus (default: darker orange) */
  hoverBgColor?: string | null;
  /** Arrow colour on hover / keyboard focus (default: white) */
  hoverIconColor?: string | null;
};

export const BackToTop = ({
  bgColor,
  iconColor,
  hoverBgColor,
  hoverIconColor,
}: BackToTopProps) => {
  const { stick, onClickHandler } = useScrollTop();

  const style = {
    '--btt-bg': bgColor || '#d85d18',
    '--btt-icon': iconColor || '#ffffff',
    '--btt-hover-bg': hoverBgColor || '#b94c10',
    '--btt-hover-icon': hoverIconColor || '#ffffff',
  } as React.CSSProperties;

  return (
    <button
      aria-label="Scroll to top"
      type="button"
      tabIndex={stick ? 0 : -1}
      aria-hidden={!stick}
      // Styles live in global.scss (.lgc-back-to-top); colours via CSS variables
      className={cn('lgc-back-to-top group', !stick && 'is-hidden')}
      style={style}
      onClick={onClickHandler}
    >
      <span aria-hidden="true" className="lgc-back-to-top__arrow">
        <ArrowUp size="24" color="currentColor" />
      </span>
      <span
        aria-hidden="true"
        className="lgc-back-to-top__arrow lgc-back-to-top__arrow--next"
      >
        <ArrowUp size="24" color="currentColor" />
      </span>
    </button>
  );
};

export default BackToTop;
