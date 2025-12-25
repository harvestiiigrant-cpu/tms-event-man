import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { CompactBrandHeader } from "@/components/branding/BrandHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <CompactBrandHeader />
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-primary">404</h1>
              <h2 className="text-2xl font-semibold">Page Not Found</h2>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <Button asChild size="lg" className="w-full">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>

            {location.pathname && (
              <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                {location.pathname}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
