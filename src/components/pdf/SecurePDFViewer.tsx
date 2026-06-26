import { useState } from "react";
import { X, FileText, Maximize2, Minimize2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SecurePDFViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export const SecurePDFViewer = ({ url, title = "Material de apoyo", onClose }: SecurePDFViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Convert Google Drive URL to embed preview URL
  const getEmbedUrl = (driveUrl: string) => {
    const fileIdMatch = driveUrl.match(/[-\w]{25,}/);
    if (fileIdMatch) {
      // Using preview mode which has limited controls
      return `https://drive.google.com/file/d/${fileIdMatch[0]}/preview`;
    }
    return driveUrl;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm ${
        isFullscreen ? "" : "p-4 md:p-8"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`bg-dashboard-card border border-white/10 rounded-lg overflow-hidden flex flex-col ${
          isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-5xl h-[85vh]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-dashboard-sidebar">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-dashboard-accent-teal" />
            <span className="font-mono font-medium text-dashboard-text">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-dashboard-muted hover:text-dashboard-text hover:bg-white/10"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-dashboard-muted hover:text-dashboard-text hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer - using iframe with restricted features */}
        <div className="flex-1 relative bg-dashboard-bg overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            title={title}
            sandbox="allow-scripts allow-same-origin"
            style={{
              border: "none",
            }}
          />
          
          {/* Overlay to block the "open in new window" button (top right corner of Drive preview) */}
          <div 
            className="absolute top-0 right-0 w-16 h-16 bg-dashboard-bg flex items-center justify-center cursor-not-allowed z-10"
            onClick={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            title="Contenido exclusivo para estudiantes"
          >
            <Lock className="h-5 w-5 text-dashboard-muted" />
          </div>
          
          {/* Additional overlay strip along the right edge to catch any hover tooltips */}
          <div 
            className="absolute top-0 right-0 w-20 h-20 pointer-events-auto z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {/* Footer note */}
        <div className="px-4 py-2 bg-dashboard-sidebar border-t border-white/10">
          <p className="text-xs text-dashboard-muted text-center">
            Este material es exclusivo para estudiantes de Acelingua Language Center
          </p>
        </div>
      </div>
    </div>
  );
};
