import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Bookmark, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface LearningPlanCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  image: string;
  tags: string[];
}

export const LearningPlanCard = ({
  id,
  title,
  description,
  duration,
  level,
  image,
  tags
}: LearningPlanCardProps) => {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:bg-card-hover transition-all duration-500 hover:shadow-elegant hover:scale-[1.02] hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge variant="secondary" className="bg-glass-bg border-glass-border backdrop-blur-md text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {duration}
          </Badge>
          <Badge variant="outline" className="bg-glass-bg border-glass-border backdrop-blur-md text-xs">
            {level}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link to={`/plan/${id}`} className="flex-1">
            <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
              <Eye className="w-4 h-4 mr-2" />
              View Plan
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            className="border border-border hover:border-primary/50 hover:bg-primary/10"
          >
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-0 ring-primary/0 group-hover:ring-2 group-hover:ring-primary/30 transition-all duration-500" />
    </article>
  );
};