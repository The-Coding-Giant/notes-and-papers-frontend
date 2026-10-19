import { Breadcrumbs } from "./breadcrumbs";

export function ProsePage({
  title,
  path,
  intro,
  children,
}: {
  title: string;
  path: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: title, path },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-5xl sm:text-6xl">{title}</h1>
        {intro && <p className="text-muted-foreground">{intro}</p>}
      </header>
      <div className="space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_a]:text-link [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
