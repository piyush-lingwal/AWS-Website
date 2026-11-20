/**
 * Quiet separator for the gap between two top-level page sections (DESIGN.md).
 * Zero height and no tone of its own, so section spacing and the ScrollAtmosphere
 * tone blending are unchanged. Styles: `.sec-div` in app/(light)/daylight.css.
 */
export function SectionDivider() {
  return (
    <div className="sec-div" role="presentation" aria-hidden="true">
      <div className="sec-div-row">
        <span className="sec-div-line" />
        <span className="sec-div-px">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="sec-div-line" />
      </div>
    </div>
  );
}
