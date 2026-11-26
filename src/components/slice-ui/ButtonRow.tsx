import React from 'react';
import { isFilled } from '@prismicio/client';
import { cn } from '@lgc_cms/util';
import { CmsButton } from '../../slices/ContentImageSlice/shared';

export type ButtonRowColors = {
  filledBg: string;
  filledText: string;
  filledHoverBg: string;
  filledHoverText: string;
  outlineColor: string;
  outlineHoverBg: string;
  outlineHoverText: string;
};

/**
 * A row of CMS buttons. Each item: { label, link, style: "Filled" | "Outline", show_arrow }.
 * Colours are set once per slice; buttons stack full-width on phones (below 576px).
 */
export const ButtonRow = ({
  buttons,
  colors,
  font,
  radius,
  className,
  stackOnMobile = true,
}: {
  buttons: any[] | null | undefined;
  colors: ButtonRowColors;
  font?: string | null;
  radius?: string | null;
  className?: string;
  stackOnMobile?: boolean;
}) => {
  const items = (Array.isArray(buttons) ? buttons : []).filter((b) => b?.label && isFilled.link(b?.link));
  if (items.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-3', stackOnMobile && 'maxSm:flex-col maxSm:items-stretch', className)}>
      {items.map((b, i) => {
        const outline = String(b.style || 'Filled').toLowerCase() === 'outline';
        return (
          <CmsButton
            key={i}
            label={b.label}
            link={b.link}
            font={font}
            radius={radius}
            showArrow={b.show_arrow === true}
            className="justify-center h-12"
            bg={outline ? 'transparent' : colors.filledBg}
            textColor={outline ? colors.outlineColor : colors.filledText}
            borderColor={outline ? colors.outlineColor : colors.filledBg}
            hoverBg={outline ? colors.outlineHoverBg : colors.filledHoverBg}
            hoverText={outline ? colors.outlineHoverText : colors.filledHoverText}
          />
        );
      })}
    </div>
  );
};

export default ButtonRow;
