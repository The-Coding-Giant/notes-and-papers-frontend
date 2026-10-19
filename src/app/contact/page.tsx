import { ContactDetails } from "@/components/shared/contact-details";
import { ContactForm } from "@/components/shared/contact-form";
import { ProsePage } from "@/components/shared/prose-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact | Notes & Papers",
  description:
    "Report a broken paper, suggest a missing one, or ask us anything about Notes & Papers.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <ProsePage
      title="Contact us"
      path="/contact"
      intro="Missing a paper? Found a mistake? Tell us and we will fix it."
    >
      <ContactDetails />
      <ContactForm />
      <p className="text-sm text-muted-foreground">
        To report a problem with one paper, use <em>Report a problem</em> on that paper&apos;s page.
        For copyright or ownership concerns, use the <a href="/takedown">takedown form</a>.
      </p>
    </ProsePage>
  );
}
