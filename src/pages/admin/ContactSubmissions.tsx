import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import type { ContactSubmission } from '@/types/database';
import { DataTableSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/EmptyState';

/**
 * Contact Submissions Admin Page
 * Displays all contact form submissions with search, filtering, and mark as read functionality
 */
const ContactSubmissions = () => {
  const { t: translate, i18n } = useTranslation();
  const t = translate as any;
  const queryClient = useQueryClient();
  const isRTL = i18n.language === 'ar';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch contact submissions
  const { data: submissions, isLoading, error } = useQuery<ContactSubmission[]>({
    queryKey: ['contact-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContactSubmission[];
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const updateData = { 
        status: 'read' as const,
        read_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('contact_submissions')
        // @ts-ignore - Supabase type inference issue with Database generic
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-submissions'] });
      toast.success(t('admin:contactSubmissions.markAsReadSuccess'));
    },
    onError: (error) => {
      console.error('Error marking submission as read:', error);
      toast.error(t('admin:contactSubmissions.markAsReadError'));
    },
  });

  // Filter submissions based on search query
  const filteredSubmissions = submissions?.filter((submission) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      submission.name.toLowerCase().includes(query) ||
      submission.email.toLowerCase().includes(query) ||
      submission.subject.toLowerCase().includes(query)
    );
  });

  // Toggle row expansion
  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Format date based on language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = isRTL ? ar : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  };

  // Format full date
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = isRTL ? ar : enUS;
    return format(date, 'PPpp', { locale });
  };

  // Get status badge variant and color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return {
          variant: 'default' as const,
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
          label: t('admin:contactSubmissions.status.new')
        };
      case 'read':
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          label: t('admin:contactSubmissions.status.read')
        };
      case 'responded':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          label: t('admin:contactSubmissions.status.responded')
        };
      default:
        return {
          variant: 'outline' as const,
          className: '',
          label: status
        };
    }
  };

  // Handle mark as read
  const handleMarkAsRead = (id: string, currentStatus: string) => {
    if (currentStatus === 'new') {
      markAsReadMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{t('admin:contactSubmissions.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('admin:contactSubmissions.description')}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('admin:contactSubmissions.loadError')}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin:contactSubmissions.tableTitle')}</CardTitle>
            <CardDescription>
              {filteredSubmissions ? 
                t('admin:contactSubmissions.tableDescription', { count: filteredSubmissions.length }) : 
                t('admin:contactSubmissions.tableDescriptionEmpty')
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={t('admin:contactSubmissions.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                />
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <DataTableSkeleton rows={5} columns={8} />
            ) : filteredSubmissions && filteredSubmissions.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>{t('admin:contactSubmissions.table.date')}</TableHead>
                      <TableHead>{t('admin:contactSubmissions.table.name')}</TableHead>
                      <TableHead>{t('admin:contactSubmissions.table.email')}</TableHead>
                      <TableHead>{t('admin:contactSubmissions.table.phone')}</TableHead>
                      <TableHead>{t('admin:contactSubmissions.table.subject')}</TableHead>
                      <TableHead>{t('admin:contactSubmissions.table.status')}</TableHead>
                      <TableHead className="text-right">{t('admin:contactSubmissions.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => {
                      const isExpanded = expandedRows.has(submission.id);
                      const statusBadge = getStatusBadge(submission.status);
                      
                      return (
                        <Collapsible
                          key={submission.id}
                          open={isExpanded}
                          onOpenChange={() => toggleRow(submission.id)}
                          asChild
                        >
                          <>
                            <TableRow className="cursor-pointer hover:bg-accent/50">
                              <TableCell>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{formatDate(submission.created_at)}</span>
                                </div>
                              </TableCell>
                              <TableCell>{submission.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{submission.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {submission.phone ? (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{submission.phone}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">—</span>
                                )}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {submission.subject}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={statusBadge.variant}
                                  className={statusBadge.className}
                                >
                                  {statusBadge.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {submission.status === 'new' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(submission.id, submission.status);
                                    }}
                                    disabled={markAsReadMutation.isPending}
                                  >
                                    {markAsReadMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                    )}
                                    {t('admin:contactSubmissions.markAsRead')}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                            <CollapsibleContent asChild>
                              <TableRow>
                                <TableCell colSpan={8} className="bg-accent/30">
                                  <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium text-muted-foreground">
                                          {t('admin:contactSubmissions.details.submittedAt')}:
                                        </span>
                                        <p className="mt-1">{formatFullDate(submission.created_at)}</p>
                                      </div>
                                      {submission.read_at && (
                                        <div>
                                          <span className="font-medium text-muted-foreground">
                                            {t('admin:contactSubmissions.details.readAt')}:
                                          </span>
                                          <p className="mt-1">{formatFullDate(submission.read_at)}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground text-sm">
                                        {t('admin:contactSubmissions.details.message')}:
                                      </span>
                                      <div className="mt-2 p-4 bg-background rounded-lg border">
                                        <p className="whitespace-pre-wrap">{submission.message}</p>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </CollapsibleContent>
                          </>
                        </Collapsible>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title={t('admin:contactSubmissions.emptyState.title')}
                description={
                  searchQuery
                    ? t('admin:contactSubmissions.emptyState.noResults')
                    : t('admin:contactSubmissions.emptyState.description')
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ContactSubmissions;
