"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

interface SampleOverride {
  method: string;
  path: string;
  headers: Record<string, string> | null;
  body: any | null;
  status: number;
  responseBody: any;
}

export default function SamplesPage() {
  const router = useRouter();
  const [samples, setSamples] = useState<SampleOverride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSample, setSelectedSample] = useState<SampleOverride | null>(
    null
  );
  const [importingIndex, setImportingIndex] = useState<number | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      const response = await fetch("/api/samples");
      if (response.ok) {
        const data = await response.json();
        setSamples(data);
      }
    } catch (error) {
      console.error("Error loading samples:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await fetch("/api/overrides/sample");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "api-overrides-sample.json";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading sample:", error);
    }
  };

  const handleImportSample = async (sample: SampleOverride, index: number) => {
    setImportingIndex(index);
    try {
      const response = await fetch("/api/overrides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: sample.method,
          path: sample.path,
          headers: sample.headers,
          body: sample.body,
          status: sample.status,
          responseBody: sample.responseBody,
        }),
      });

      if (response.ok) {
        addToast("Sample imported successfully", "success");
        router.push("/");
      } else {
        const error = await response.json();
        addToast(
          `Failed to import: ${error.error || "Unknown error"}`,
          "error"
        );
        setImportingIndex(null);
      }
    } catch (error) {
      console.error("Error importing sample:", error);
      addToast("Failed to import sample", "error");
      setImportingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" className="w-full sm:w-auto">
                ← Back
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Sample Overrides
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Browse example overrides to learn how to create your own
              </p>
            </div>
            <div className="flex justify-start sm:justify-end">
              <Button
                variant="outline"
                onClick={handleDownloadSample}
                className="w-full sm:w-auto"
              >
                📥 Download All
              </Button>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading samples...
          </div>
        ) : (
          <div className="space-y-4">
            {samples.map((sample, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {sample.method}
                        </Badge>
                        <code className="text-xs sm:text-sm font-mono bg-muted px-2 py-1 rounded break-all">
                          {sample.path}
                        </code>
                        <Badge variant="secondary" className="text-xs">
                          Status: {sample.status}
                        </Badge>
                      </div>
                      {sample.headers && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">
                            Headers:
                          </p>
                          <code className="text-xs bg-muted p-1 rounded block break-words whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(sample.headers, null, 2)}
                          </code>
                        </div>
                      )}
                      {sample.body && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">
                            Request Body:
                          </p>
                          <code className="text-xs bg-muted p-1 rounded block break-words whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(sample.body, null, 2)}
                          </code>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleImportSample(sample, index)}
                      disabled={importingIndex === index}
                      className="w-full sm:w-auto flex-shrink-0"
                    >
                      {importingIndex === index ? "Importing..." : "Import"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm font-semibold mb-2">Response Body:</p>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-64 overflow-y-auto break-words whitespace-pre-wrap">
                      {JSON.stringify(sample.responseBody, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
