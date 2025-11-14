import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Mail,
  LogOut,
  Moon,
  Sun,
  Languages,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout Component
 * Provides the layout structure for admin pages with sidebar navigation and header
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  /**
   * Toggle theme between light and dark
   */
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  /**
   * Toggle language between English and Arabic
   */
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  /**
   * Navigation items for the sidebar
   */
  const navItems = [
    {
      title: t('navigation:dashboard'),
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('navigation:catalogs'),
      href: '/admin/catalogs',
      icon: FileText,
    },
    {
      title: t('navigation:categories'),
      href: '/admin/categories',
      icon: FolderOpen,
    },
    {
      title: t('navigation:contactSubmissions'),
      href: '/admin/contact-submissions',
      icon: Mail,
    },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar collapsible="offcanvas">
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">MST-KSA</span>
                <span className="text-xs text-muted-foreground">{t('navigation:admin')}</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.href} aria-current={isActive ? 'page' : undefined}>
                        <Icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <div className="p-2 space-y-2">
              {/* User Info */}
              {user && (
                <div className="px-2 py-1">
                  <p className="text-xs text-muted-foreground truncate" title={user.email}>
                    {user.email}
                  </p>
                </div>
              )}

              <SidebarSeparator />

              {/* Theme and Language Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex-1"
                  title={theme === 'dark' ? t('navigation:lightMode') : t('navigation:darkMode')}
                  aria-label={theme === 'dark' ? t('navigation:lightMode') : t('navigation:darkMode')}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Moon className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">{theme === 'dark' ? t('navigation:lightMode') : t('navigation:darkMode')}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="flex-1"
                  title={t('navigation:language')}
                  aria-label={t('common:accessibility.toggleLanguage')}
                >
                  <Languages className="h-4 w-4 mr-1 rtl:mr-0 rtl:ml-1" aria-hidden="true" />
                  <span className="text-xs" aria-live="polite">{language === 'en' ? 'AR' : 'EN'}</span>
                </Button>
              </div>

              <SidebarSeparator />

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                aria-label={t('navigation:logout')}
              >
                <LogOut className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" aria-hidden="true" />
                {t('navigation:logout')}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger aria-label={t('navigation:toggleSidebar')} />
            <div className="flex-1" />
            {/* Additional header content can be added here */}
          </header>

          {/* Page Content */}
          <main id="main-content" className="flex-1 p-6" role="main">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
