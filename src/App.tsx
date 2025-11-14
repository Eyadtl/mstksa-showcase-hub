import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Eager load public pages (critical for initial render)
import Index from "./pages/Index";
import Catalogs from "./pages/Catalogs";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load admin pages (code splitting)
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminCatalogs = lazy(() => import("./pages/admin/Catalogs"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const ContactSubmissions = lazy(() => import("./pages/admin/ContactSubmissions"));

// Configure QueryClient with optimized cache times
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (formerly cacheTime)
      refetchOnWindowFocus: false, // Disable refetch on window focus for better performance
      retry: 1, // Retry failed requests once
    },
  },
});

// Loading fallback component for lazy-loaded routes
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
                    <Route path="/catalogs" element={<ErrorBoundary><Catalogs /></ErrorBoundary>} />
                    <Route path="/auth" element={<ErrorBoundary><Auth /></ErrorBoundary>} />
                    <Route 
                      path="/admin/dashboard" 
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <Suspense fallback={<LoadingFallback />}>
                              <Dashboard />
                            </Suspense>
                          </ErrorBoundary>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/catalogs" 
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <Suspense fallback={<LoadingFallback />}>
                              <AdminCatalogs />
                            </Suspense>
                          </ErrorBoundary>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/categories" 
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <Suspense fallback={<LoadingFallback />}>
                              <Categories />
                            </Suspense>
                          </ErrorBoundary>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/contact-submissions" 
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <Suspense fallback={<LoadingFallback />}>
                              <ContactSubmissions />
                            </Suspense>
                          </ErrorBoundary>
                        </ProtectedRoute>
                      } 
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
                  </Routes>
                </ErrorBoundary>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
