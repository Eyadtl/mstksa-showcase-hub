import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, Printer, Share2, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PDFViewer Component
 * Displays PDF documents in a full-screen modal with zoom, download, print, and share controls
 */
export const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  /**
   * Handle zoom in - increases scale by 25%
   */
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300)); // Max 300%
  };

  /**
   * Handle zoom out - decreases scale by 25%
   */
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50)); // Min 50%
  };

  /**
   * Handle download - triggers PDF download
   */
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Handle print - opens browser print dialog
   */
  const handlePrint = () => {
    const iframe = document.getElementById('pdf-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  /**
   * Handle share - copies PDF URL to clipboard
   */
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(pdfUrl);
      toast({
        title: t('catalogs:pdfViewer.linkCopied'),
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: t('catalogs:pdfViewer.error'),
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle iframe load
   */
  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  /**
   * Handle iframe error
   */
  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  /**
   * Reset state when dialog closes
   */
  const handleClose = () => {
    setZoom(100);
    setIsLoading(true);
    setHasError(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90" />
        <DialogContent
          className={cn(
            'max-w-[95vw] w-full h-[95vh] p-0 gap-0 border-0',
            'flex flex-col'
          )}
          aria-labelledby="pdf-viewer-title"
          aria-describedby="pdf-viewer-description"
        >
          {/* Control Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-background border-b" role="toolbar" aria-label={t('catalogs:pdfViewer.controls')}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h2 id="pdf-viewer-title" className="text-lg font-semibold truncate">{title}</h2>
              <span id="pdf-viewer-description" className="sr-only">{t('catalogs:pdfViewer.description')}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 50 || isLoading || hasError}
                title={t('catalogs:pdfViewer.zoomOut')}
                aria-label={t('catalogs:pdfViewer.zoomOut')}
              >
                <ZoomOut className="h-4 w-4" aria-hidden="true" />
              </Button>
              
              <span className="text-sm font-medium min-w-[4rem] text-center" aria-live="polite" aria-atomic="true">
                {zoom}%
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 300 || isLoading || hasError}
                title={t('catalogs:pdfViewer.zoomIn')}
                aria-label={t('catalogs:pdfViewer.zoomIn')}
              >
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </Button>

              <div className="w-px h-6 bg-border mx-2" />

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                disabled={isLoading || hasError}
                title={t('catalogs:pdfViewer.download')}
                aria-label={t('catalogs:pdfViewer.download')}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handlePrint}
                disabled={isLoading || hasError}
                title={t('catalogs:pdfViewer.print')}
                aria-label={t('catalogs:pdfViewer.print')}
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                disabled={isLoading || hasError}
                title={t('catalogs:pdfViewer.share')}
                aria-label={t('catalogs:pdfViewer.share')}
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
              </Button>

              <div className="w-px h-6 bg-border mx-2" aria-hidden="true" />

              {/* Close Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleClose}
                title={t('catalogs:pdfViewer.close')}
                aria-label={t('catalogs:pdfViewer.close')}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* PDF Content Area */}
          <div className="flex-1 relative bg-muted overflow-hidden" role="document">
            {/* Loading State */}
            {isLoading && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10" role="status" aria-live="polite">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">{t('catalogs:pdfViewer.loading')}</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background z-10" role="alert" aria-live="assertive">
                <div className="flex flex-col items-center gap-3 text-center px-4">
                  <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
                  <p className="text-lg font-semibold">{t('catalogs:pdfViewer.error')}</p>
                  <Button onClick={handleClose} variant="outline">
                    {t('catalogs:pdfViewer.close')}
                  </Button>
                </div>
              </div>
            )}

            {/* PDF Iframe */}
            <div
              className="w-full h-full flex items-center justify-center overflow-auto"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center top',
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              <iframe
                id="pdf-iframe"
                src={pdfUrl}
                className="w-full h-full border-0"
                title={title}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
