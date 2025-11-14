import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps admin routes to ensure only authenticated users can access them.
 * Optionally verifies admin role for routes requiring admin access.
 * 
 * Features:
 * - Checks authentication status using AuthContext
 * - Redirects unauthenticated users to /auth page
 * - Verifies admin role when requireAdmin is true
 * - Shows loading state during authentication check
 * - Handles session expiration with redirect to login
 * 
 * @param children - The protected content to render
 * @param requireAdmin - Whether to verify admin role (default: true)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if user is not authenticated
  if (!user) {
    // Save the attempted location so we can redirect back after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Verify admin role if required
  if (requireAdmin && user.role !== 'admin') {
    // Redirect non-admin users to home page
    return <Navigate to="/" replace />;
  }

  // User is authenticated and authorized, render the protected content
  return <>{children}</>;
};
