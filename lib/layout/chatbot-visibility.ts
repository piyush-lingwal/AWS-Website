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

// TODO: re-enable chatbot. Set this to false to bring the Kio assistant back on every page
// (it is then hidden only on the prefixes below). Temporary: hidden site-wide for now.
export const CHATBOT_HIDDEN_SITEWIDE = true;

const HIDDEN_PREFIXES = ["/admin", "/verify", "/certificate/verify", "/login", "/media"] as const;

export function isChatbotHidden(pathname: string | null | undefined): boolean {
  if (CHATBOT_HIDDEN_SITEWIDE) return true;
  if (!pathname) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return HIDDEN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
