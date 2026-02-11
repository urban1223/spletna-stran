import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-accent">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Stran ni bila najdena</p>
        <Link
          to="/"
          className="text-accent underline hover:text-accent/80 text-lg"
        >
          Nazaj na domačo stran
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
