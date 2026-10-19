import { Card } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md py-6">
      <Card className="space-y-6 p-7 shadow-hard">
        <header className="space-y-1">
          <h1 className="text-4xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </header>
        {children}
      </Card>
    </div>
  );
}
