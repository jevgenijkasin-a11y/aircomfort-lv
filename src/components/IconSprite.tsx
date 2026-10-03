// SVG symbols used many times per page (product card favourite / compare
// buttons): defined once, referenced with <use href="#i-…">.
export default function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <symbol id="i-heart" viewBox="0 0 24 24">
        <path className="i-fill" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.2 4.5c2 0 3.4 1.1 4.8 2.9 1.4-1.8 2.8-2.9 4.8-2.9 3.6 0 5.7 3.5 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
      </symbol>
      <symbol id="i-cmp" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M7 7h13m0 0l-3.5-3.5M20 7l-3.5 3.5M17 17H4m0 0l3.5-3.5M4 17l3.5 3.5" />
      </symbol>
    </svg>
  );
}
