import { Badge } from "@/components/ui/badge";

interface NewsCardProps {
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
}

export const NewsCard = ({
  title,
  description,
  date,
  category,
  image
}: NewsCardProps) => {
  return (
    <article className="group rounded-2xl border border-border overflow-hidden bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:shadow-elegant hover:scale-[1.02] hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <Badge 
          variant="secondary"
          className="absolute top-4 left-4 bg-glass-bg border-glass-border backdrop-blur-md text-xs"
        >
          {category}
        </Badge>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-lg font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {description}
        </p>
        <div className="text-xs text-muted-foreground">
          {date}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-0 ring-primary/0 group-hover:ring-2 group-hover:ring-primary/30 transition-all duration-500" />
    </article>
  );
};