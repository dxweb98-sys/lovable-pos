import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto">
          <span className="text-5xl">🔍</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <p className="text-muted-foreground">Page not found</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 h-12 px-6 bg-foreground text-background font-semibold rounded-2xl hover:opacity-90 transition-all"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
