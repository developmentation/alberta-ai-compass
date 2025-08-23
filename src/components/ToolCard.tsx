import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Database, Box } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  category: string;
  icon: string;
}

export const ToolCard = ({
  title,
  description,
  category,
  icon
}: ToolCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case 'wrench':
        return <Wrench className="w-5 h-5 text-primary" />;
      case 'database':
        return <Database className="w-5 h-5 text-primary" />;
      case 'boxes':
        return <Box className="w-5 h-5 text-primary" />;
      default:
        return <Wrench className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="group rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 hover:bg-card-hover transition-all duration-500 hover:shadow-elegant hover:scale-[1.02] hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            {getIcon()}
          </div>
          <h3 className="font-bold tracking-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
        <Badge 
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 text-xs"
        >
          {category}
        </Badge>
      </div>
      
      <p className="text-muted-foreground mb-4 leading-relaxed">
        {description}
      </p>
      
      <Button 
        variant="ghost"
        className="w-full border border-border hover:border-primary/50 hover:bg-primary/10 transition-all"
      >
        Open Tool
      </Button>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-0 ring-primary/0 group-hover:ring-2 group-hover:ring-primary/30 transition-all duration-500" />
    </div>
  );
};