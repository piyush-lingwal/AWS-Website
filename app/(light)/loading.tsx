import { LoadingCloud } from "@/components/design/LoadingCloud";

// Shown by Next.js (Suspense boundary) while a page in this group is rendering on the server.
// Sits inside the group layout, so ThemeScope, fonts and the light/dark CSS variables already apply.
export default function LightLoading() {
  return <LoadingCloud />;
}
