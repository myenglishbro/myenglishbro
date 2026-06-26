import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logoAce from "@/assets/logo-ace.png";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logoAce} alt="Acelingua" className="h-10 w-10" />
            <span className="text-xl font-bold text-foreground font-display">Acelingua</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/programs" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              Programs
            </Link>
            <Link to="/live-classes" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              Live Classes
            </Link>
            <Link to="/store" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              Platform Courses
            </Link>
            <a href="/#placement-test" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              Placement Test
            </a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted font-medium">
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/auth?tab=register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 font-semibold shadow-md shadow-primary/20">
                Enroll
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border bg-card">
            <div className="flex flex-col gap-4">
              <Link to="/programs" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                Programs
              </Link>
              <Link to="/live-classes" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                Live Classes
              </Link>
              <Link to="/store" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                Platform Courses
              </Link>
              <a href="/#placement-test" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                Placement Test
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Link to="/auth">
                  <Button variant="outline" className="w-full border-border text-foreground">Iniciar sesión</Button>
                </Link>
                <Link to="/auth?tab=register">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Enroll</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
