import Link from "next/link";
import { Card } from "@/components/ui/card";

interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  target?: string;
  rel?: string;
}

export function ServiceCard({
  title,
  href,
  icon,
  badge,
  target,
  rel,
}: ServiceCardProps) {
  return (
    <Link href={href} target={target} rel={rel}>
      <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 border-2 border-transparent overflow-hidden bg-gradient-to-br from-background to-muted/80 hover:from-muted/10 hover:to-muted/50 hover:bg-primary/50 transition-colors">
        <div className="p-4 md:p-2 flex items-center justify-center h-full ">
          {badge && (
            <span className="inline-block w-fit mb-3 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full ">
              {badge}
            </span>
          )}

          {icon && <div className="mr-2 sm:mr-5 text-primary">{icon}</div>}

          <h3 className="text-md md:text-2xl font-bold text-foreground">
            {title}
          </h3>
        </div>
      </Card>
    </Link>
  );
}
