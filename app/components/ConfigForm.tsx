"use client";

import { useState, useEffect } from "react";
import type { BaseApi } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Info } from "lucide-react";

export default function ConfigForm() {
  const [baseApis, setBaseApis] = useState<BaseApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleExportBaseApis = async () => {
    try {
      const response = await fetch("/api/base-apis/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `base-apis-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        addToast("Base APIs exported successfully", "success");
      } else {
        addToast("Failed to export base APIs", "error");
      }
    } catch (error) {
      console.error("Error exporting base APIs:", error);
      addToast("Failed to export base APIs", "error");
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const apisResponse = await fetch("/api/base-apis");

      if (apisResponse.ok) {
        const apis: BaseApi[] = await apisResponse.json();
        setBaseApis(apis);
      }
    } catch (error) {
      console.error("Error loading config:", error);
      setError("Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Configuration via Environment Variable</AlertTitle>
        <AlertDescription>
          Base APIs are now configured via the{" "}
          <code className="px-1 py-0.5 bg-muted rounded">BASE_APIS</code>{" "}
          environment variable.
          <br />
          Format:{" "}
          <code className="px-1 py-0.5 bg-muted rounded">
            name1:url1,name2:url2
          </code>
          <br />
          <br />
          To update your configuration, set the{" "}
          <code className="px-1 py-0.5 bg-muted rounded">BASE_APIS</code>{" "}
          environment variable and restart the application.
        </AlertDescription>
      </Alert>

      {/* Base APIs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Base APIs (Read-Only)</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportBaseApis}
              >
                📤 Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing APIs */}
          {baseApis.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No base APIs configured. Set the BASE_APIS environment variable to
              configure APIs.
            </div>
          )}

          {baseApis.map((api) => (
            <Card key={api.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{api.key}</h3>
                        {api.isDefault && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {api.baseUrl}
                      </p>
                      {api.pathPrefix && (
                        <p className="text-xs text-muted-foreground">
                          Path Prefix: {api.pathPrefix}
                        </p>
                      )}
                      {api.authHeaders && (
                        <p className="text-xs text-muted-foreground font-mono">
                          Has auth headers
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
