import { Facebook, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  
  const socialLinks = [
    { icon: Facebook, href: "#", label: t("common:footer.socialLabels.facebook") },
    { icon: Linkedin, href: "#", label: t("common:footer.socialLabels.linkedin") },
    { icon: Twitter, href: "#", label: t("common:footer.socialLabels.twitter") },
  ];

  return (
    <footer className="bg-accent text-accent-foreground mt-20" role="contentinfo" aria-label={t("common:footer.contactInfo")}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-primary-foreground font-bold text-xl brand-serif">M</span>
              </div>
              <span className="text-2xl font-bold brand-serif">MST-KSA</span>
            </div>
            <p className="text-accent-foreground/80 text-sm leading-relaxed text-left rtl:text-right">
              {t("common:footer.description")}
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-left rtl:text-right">{t("common:footer.contactInfo")}</h3>
            <address className="space-y-3 not-italic">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-accent-foreground/80 text-left rtl:text-right">
                  {t("common:footer.address")}
                </span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <a href="tel:+966XXXXXXXXX" className="text-sm text-accent-foreground/80 hover:text-primary transition-colors">
                  {t("common:footer.phone")}
                </a>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <a href="mailto:info@mst-ksa.com" className="text-sm text-accent-foreground/80 hover:text-primary transition-colors">
                  {t("common:footer.email")}
                </a>
              </div>
            </address>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-left rtl:text-right">{t("common:footer.followUs")}</h3>
            <nav className="flex space-x-4 rtl:space-x-reverse" aria-label={t("common:footer.followUs")}>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-background/10 hover:bg-primary rounded-lg flex items-center justify-center transition-smooth group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5 text-accent-foreground group-hover:text-primary-foreground transition-fast" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-accent-foreground/10 text-center">
          <p className="text-sm text-accent-foreground/60">
            {t("common:footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
