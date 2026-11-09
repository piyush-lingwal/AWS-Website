// ============================================================
// Where the Kio chat assistant is hidden — PURE (no framework imports)
// ============================================================
//
//   /admin/...                 admin screens (it covered the bottom-right corner)
//   /verify, /verify/<id>      certificate verification: the page is a record,
//                              and the assistant sat on top of the certificate
//   /certificate/verify/<id>   the older verification link
//
// Matching is by whole path segment, so "/verifying" or "/administrator" are not hidden.
// ============================================================

const HIDDEN_PREFIXES = ["/admin", "/verify", "/certificate/verify"] as const;

export function isChatbotHidden(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return HIDDEN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
