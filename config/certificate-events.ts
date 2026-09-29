export interface CertificateEvent {
  id: string;
  title: string;
  date: string;
}

/**
 * Temporary source of truth for certificate-eligible events.
 * Replace this catalog with published Supabase events when event management moves to the database.
 */
export const CERTIFICATE_EVENTS = [
  {
    id: "cloud-kickstart-2026",
    title: "Cloud Kickstart 2026",
    date: "2026-09-30",
  },
] as const satisfies readonly CertificateEvent[];

export function getCertificateEventById(
  eventId: string
): (typeof CERTIFICATE_EVENTS)[number] | undefined {
  return CERTIFICATE_EVENTS.find((event) => event.id === eventId);
}
