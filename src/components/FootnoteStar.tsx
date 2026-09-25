import type { ReactNode } from 'react';

const Star = ({ lead = false }: { lead?: boolean }) => (
  <sup className={`text-[0.7em] font-normal ${lead ? 'mr-0.5' : 'ml-px'}`}>*</sup>
);

/**
 * Renders a footnote '*' at the start or end of a string ("Монтаж от 250 €*",
 * "* Окончательная стоимость…") as a small superscript instead of a full-size glyph.
 */
export function starred(text: string): ReactNode {
  const lead = text.startsWith('*');
  const trail = !lead && text.endsWith('*');
  if (!lead && !trail) return text;
  const body = lead ? text.slice(1).trimStart() : text.slice(0, -1);
  return lead ? <><Star lead />{body}</> : <>{body}<Star /></>;
}
