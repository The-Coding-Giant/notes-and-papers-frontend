import { Mail, Phone } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/env";

/** Clickable email (mailto:) and phone (tel:). Renders nothing unless they are configured. */
export function ContactDetails({ className }: { className?: string }) {
  if (!CONTACT_EMAIL && !CONTACT_PHONE) return null;
  const tel = CONTACT_PHONE.replace(/[^+\d]/g, "");
  return (
    <ul className={className ?? "space-y-2 text-sm font-medium"}>
      {CONTACT_EMAIL && (
        <li>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 hover:underline hover:decoration-2 hover:underline-offset-4"
          >
            <Mail className="size-4" aria-hidden="true" /> {CONTACT_EMAIL}
          </a>
        </li>
      )}
      {CONTACT_PHONE && (
        <li>
          <a
            href={`tel:${tel}`}
            className="inline-flex items-center gap-2 hover:underline hover:decoration-2 hover:underline-offset-4"
          >
            <Phone className="size-4" aria-hidden="true" /> {CONTACT_PHONE}
          </a>
        </li>
      )}
    </ul>
  );
}
