import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  FolderOpen, 
  MessageSquare, 
  Upload, 
  FolderPlus, 
  Eye,
  AlertCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import type { ContactSubmission } from '@/types/database';
import { StatCardSkeleton, SubmissionCardSkeleton } from '@/components/skeletons';

/**
 * Admin Dashboard Overview Page
 * Displays summary statistics and recent contact submissions
 */
const Dashboard = () => {
  const { t: translate, i18n } = useTranslation();
  const t = translate as any; // Type assertion to handle admin namespace
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  console.log('Dashboard component rendering...');

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('Fetching dashboard stats...');
      
      const [catalogsResult, categoriesResult, submissionsResult, newSubmissionsResult] = await Promise.all([
        supabase.from('catalogs').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      ]);

      console.log('Stats results:', {
        catalogs: catalogsResult,
        categories: categoriesResult,
        submissions: submissionsResult,
        newSubmissions: newSubmissionsResult
      });

      if (catalogsResult.error) {
        console.error('Catalogs error:', catalogsResult.error);
        throw catalogsResult.error;
      }
      if (categoriesResult.error) {
        console.error('Categories error:', categoriesResult.error);
        throw categoriesResult.error;
      }
      if (submissionsResult.error) {
        console.error('Submissions error:', submissionsResult.error);
        throw submissionsResult.error;
      }
      if (newSubmissionsResult.error) {
        console.error('New submissions error:', newSubmissionsResult.error);
        throw newSubmissionsResult.error;
      }

      const result = {
        totalCatalogs: catalogsResult.count || 0,
        totalCategories: categoriesResult.count || 0,
        totalSubmissions: submissionsResult.count || 0,
        newSubmissions: newSubmissionsResult.count || 0,
      };
      
      console.log('Dashboard stats loaded:', result);
      return result;
    },
    retry: 1,
    staleTime: 30000,
  });

  // Fetch recent contact submissions
  const { data: recentSubmissions, isLoading: submissionsLoading, error: submissionsError } = useQuery<ContactSubmission[]>({
    queryKey: ['recent-submissions'],
    queryFn: async () => {
      console.log('Fetching recent submissions...');
      
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Recent submissions error:', error);
        throw error;
      }
      
      console.log('Recent submissions loaded:', data?.length || 0, 'items');
      return data as ContactSubmission[];
    },
    retry: 1,
    staleTime: 30000,
  });

  const isLoading = statsLoading || submissionsLoading;
  const hasError = statsError || submissionsError;

  // Statistics cards configuration
  const statisticsCards = [
    {
      title: t('admin:dashboard.statistics.totalCatalogs'),
      value: stats?.totalCatalogs || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: t('admin:dashboard.statistics.totalCategories'),
      value: stats?.totalCategories || 0,
      icon: FolderOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: t('admin:dashboard.statistics.totalSubmissions'),
      value: stats?.totalSubmissions || 0,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: t('admin:dashboard.statistics.newSubmissions'),
      value: stats?.newSubmissions || 0,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  // Quick actions configuration
  const quickActions = [
    {
      title: t('admin:dashboard.quickActions.uploadCatalog'),
      icon: Upload,
      onClick: () => navigate('/admin/catalogs'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: t('admin:dashboard.quickActions.addCategory'),
      icon: FolderPlus,
      onClick: () => navigate('/admin/categories'),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: t('admin:dashboard.quickActions.viewSubmissions'),
      icon: Eye,
      onClick: () => navigate('/admin/contact-submissions'),
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  // Format date based on language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = isRTL ? ar : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'read':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'responded':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{t('admin:dashboard.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('admin:dashboard.welcome')}</p>
        </div>

        {/* Error Alert */}
        {hasError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('admin:dashboard.error')}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </>
          ) : (
            statisticsCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <div className={`p-2 rounded-full ${card.bgColor}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin:dashboard.quickActions.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    className={`h-auto py-6 ${action.color}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{action.title}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Contact Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('admin:dashboard.recentSubmissions.title')}</CardTitle>
              <CardDescription className="mt-1">
                {stats?.newSubmissions ? 
                  `${stats.newSubmissions} ${t('admin:dashboard.statistics.newSubmissions').toLowerCase()}` : 
                  ''
                }
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/contact-submissions')}
            >
              {t('admin:dashboard.recentSubmissions.viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <SubmissionCardSkeleton count={3} />
            ) : recentSubmissions && recentSubmissions.length > 0 ? (
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/contact-submissions')}
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{submission.name}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                          {t(`admin:dashboard.recentSubmissions.status.${submission.status}`)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">{t('admin:dashboard.recentSubmissions.subject')}:</span> {submission.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('admin:dashboard.recentSubmissions.from')} {submission.email} • {formatDate(submission.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('admin:dashboard.recentSubmissions.noSubmissions')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
