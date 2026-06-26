import { useState } from "react";
import { X, Globe, Maximize2, Minimize2, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SecureWebViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export const SecureWebViewer = ({ url, title = "Recurso Web", onClose }: SecureWebViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);


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
        className={`bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-2xl ${
          isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-6xl h-[90vh]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Globe className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <span className="font-semibold text-gray-900">{title}</span>
              <span className="ml-3 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                <Lock className="h-3 w-3 inline mr-1" />
                Contenido protegido
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-200"
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
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Web Viewer */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Cargando contenido...</p>
              </div>
            </div>
          )}
          
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
              <div className="text-center max-w-md p-8">
                <div className="p-4 bg-amber-100 rounded-full w-fit mx-auto mb-4">
                  <AlertTriangle className="h-10 w-10 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se puede mostrar este contenido
                </h3>
                <p className="text-gray-600">
                  Este sitio web no permite ser mostrado dentro de otra página por razones de seguridad. 
                  Contacta a tu instructor para acceder a este recurso.
                </p>
              </div>
            </div>
          ) : (
            <iframe
              src={url}
              className="w-full h-full"
              title={title}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              style={{
                border: "none",
              }}
            />
          )}
          
          {/* Overlay to prevent right-click */}
          <div 
            className="absolute inset-0 pointer-events-none"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {/* Footer note */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Este recurso es exclusivo para estudiantes de Acelingua Language Center
          </p>
        </div>
      </div>
    </div>
  );
};
