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
    <footer style={{ backgroundColor: '#F22727' }} className="text-white mt-20" role="contentinfo" aria-label={t("common:footer.contactInfo")}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src="/LOGO.png" 
                alt="MST-KSA Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-white/90 text-sm leading-relaxed text-left rtl:text-right">
              {t("common:footer.description")}
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-left rtl:text-right">{t("common:footer.contactInfo")}</h3>
            <address className="space-y-3 not-italic">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <MapPin className="h-5 w-5 text-white mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-white/90 text-left rtl:text-right">
                  Al Baladia St., Sohaili Building 2, Jeddah 21456, KSA
                </span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="h-5 w-5 text-white flex-shrink-0" aria-hidden="true" />
                <a href="tel:+966126104441" className="text-sm text-white/90 hover:text-white transition-colors">
                  +966 12 610 4441
                </a>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="h-5 w-5 text-white flex-shrink-0" aria-hidden="true" />
                <a href="mailto:info@mst-ksa.com" className="text-sm text-white/90 hover:text-white transition-colors">
                  info@mst-ksa.com
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
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-smooth group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5 text-white transition-fast" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-sm text-white/80">
            {t("common:footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
