// Opacity-only enter on navigation. No transform or filter here: either would re-parent the position:fixed nav and atmosphere.
export default function LightTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
