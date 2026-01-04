import { NavLink } from "./NavLink";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: "/", label: "DOMOV" },
    { to: "/dogodki", label: "KONCERTI" },
    { to: "/projekti", label: "PROJEKTI IN IZOBRAŽEVANJA" },
    { to: "/clani", label: "ČLANI IN MENTORJI" },
    { to: "/galerija", label: "GALERIJA" },
    { to: "/o-nas", label: "O NAS" },
    { to: "/podprite-nas", label: "PODPRITE NAS" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="text-2xl font-bold text-accent">
            Nova akademija
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
                activeClassName="text-accent"
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground hover:text-accent transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-accent hover:bg-card transition-colors"
                activeClassName="text-accent bg-card"
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
