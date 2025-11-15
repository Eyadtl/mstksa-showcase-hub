import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Languages, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  onContactClick: () => void;
}

const Navigation = ({ onContactClick }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: t("navigation:logout"),
        description: "You have been logged out successfully",
      });
      navigate("/");
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error instanceof Error ? error.message : "Failed to log out",
      });
    }
  };

  const navLinks = [
    { name: t("navigation:home"), href: "/" },
    { name: t("navigation:catalogs"), href: "/catalogs" },
  ];

  // Add admin dashboard link if user is authenticated
  if (user) {
    navLinks.push({ name: t("navigation:admin"), href: "/admin/dashboard" });
  }

  return (
    <nav 
      id="navigation" 
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
      aria-label={t("navigation:mainNavigation")}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 rtl:space-x-reverse"
            aria-label={t("common:accessibility.companyLogo")}
          >
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-primary-foreground font-bold text-xl brand-serif">M</span>
            </div>
            <span className="text-xl font-bold brand-serif hidden sm:block">MST-KSA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-foreground hover:text-primary transition-fast font-medium"
              >
                {link.name}
              </Link>
            ))}
            
            <Button
              onClick={onContactClick}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold transition-smooth shadow-red"
            >
              {t("navigation:contact")}
            </Button>

            {/* Login/Logout Button */}
            {!user ? (
              <Link to="/auth">
                <Button
                  variant="outline"
                  className="font-semibold transition-smooth"
                >
                  {t("navigation:login")}
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="font-semibold transition-smooth"
                aria-label={t("navigation:logout")}
              >
                <LogOut className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" aria-hidden="true" />
                {t("navigation:logout")}
              </Button>
            )}

            {/* Language Switcher */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="transition-fast font-medium min-w-[60px]"
              aria-label={t("common:accessibility.toggleLanguage")}
              title={t("navigation:language")}
            >
              <Languages className="h-4 w-4 mr-1 rtl:mr-0 rtl:ml-1" aria-hidden="true" />
              <span aria-live="polite">{language === "en" ? "AR" : "EN"}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="transition-fast"
              aria-label={theme === "dark" ? t("navigation:lightMode") : t("navigation:darkMode")}
              title={theme === "dark" ? t("navigation:lightMode") : t("navigation:darkMode")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
              <span className="sr-only">{theme === "dark" ? t("navigation:lightMode") : t("navigation:darkMode")}</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="transition-fast font-medium"
              aria-label={t("common:accessibility.toggleLanguage")}
            >
              <span aria-live="polite">{language === "en" ? "AR" : "EN"}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="transition-fast"
              aria-label={theme === "dark" ? t("navigation:lightMode") : t("navigation:darkMode")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
              <span className="sr-only">{theme === "dark" ? t("navigation:lightMode") : t("navigation:darkMode")}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? t("common:accessibility.closeMenu") : t("common:accessibility.openMenu")}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
              <span className="sr-only">{isOpen ? t("common:accessibility.closeMenu") : t("common:accessibility.openMenu")}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div 
            id="mobile-menu" 
            className="md:hidden py-4 space-y-4"
            role="menu"
            aria-label={t("navigation:mobileMenu")}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block text-foreground hover:text-primary transition-fast font-medium py-2"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                {link.name}
              </Link>
            ))}
            <Button
              onClick={() => {
                onContactClick();
                setIsOpen(false);
              }}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold transition-smooth"
              role="menuitem"
            >
              {t("navigation:contact")}
            </Button>
            
            {/* Login/Logout Button */}
            {!user ? (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full font-semibold transition-smooth"
                  role="menuitem"
                >
                  {t("navigation:login")}
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full font-semibold transition-smooth"
                role="menuitem"
              >
                <LogOut className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" aria-hidden="true" />
                {t("navigation:logout")}
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
