export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-card/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Alberta AI Academy. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a 
              href="/privacy" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a 
              href="/terms" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </a>
         
          </div>
        </div>
      </div>
    </footer>
  );
};