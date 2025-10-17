import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface DebugLog {
  timestamp: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
  details?: string;
}

interface DebugPanelProps {
  logs: DebugLog[];
  onClear: () => void;
  darkMode?: boolean;
}

export function DebugPanel({ logs, onClear, darkMode = false }: DebugPanelProps) {
  if (logs.length === 0) return null;

  const getTypeColor = (type: DebugLog["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const getTypeEmoji = (type: DebugLog["type"]) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <Card
      className={`fixed bottom-4 right-4 left-4 max-w-2xl mx-auto z-50 ${
        darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            🔍 Debug Log (iPhone)
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">
                  {getTypeEmoji(log.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${getTypeColor(
                        log.type
                      )} text-white font-medium`}
                    >
                      {log.type.toUpperCase()}
                    </span>
                    <span
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {log.timestamp}
                    </span>
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {log.message}
                  </p>
                  {log.details && (
                    <p
                      className={`text-xs mt-1 font-mono ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            💡 Este painel mostra o que está acontecendo internamente. Use para
            debug no iPhone.
          </p>
        </div>
      </div>
    </Card>
  );
}

