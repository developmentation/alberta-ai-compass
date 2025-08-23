import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight } from "lucide-react";

interface ArticleCardProps {
  title: string;
  description: string;
  readTime: string;
  level: string;
  image: string;
}

export const ArticleCard = ({
  title,
  description,
  readTime,
  level,
  image
}: ArticleCardProps) => {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:shadow-elegant hover:scale-[1.02] hover:-translate-y-1">
      {/* Content First */}
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>{readTime}</span>
        </div>
        
        <h3 className="text-xl font-bold tracking-tight mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="border border-border hover:border-primary/50 hover:bg-primary/10 transition-all"
          >
            Read Article
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Badge 
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20"
          >
            {level}
          </Badge>
        </div>
      </div>

      {/* Image Section */}
      <div className="h-36 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-0 ring-primary/0 group-hover:ring-2 group-hover:ring-primary/30 transition-all duration-500" />
    </article>
  );
};