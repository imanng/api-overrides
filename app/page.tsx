"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Override } from "@/types/override";
import type { BaseApi } from "@/types/api";
import OverrideList from "./components/OverrideList";
import OverrideForm from "./components/OverrideForm";
import ConfigForm from "./components/ConfigForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface SampleOverride {
  method: string;
  path: string;
  headers: Record<string, string> | null;
  body: unknown | null;
  status: number;
  responseBody: unknown;
}

export default function Home() {
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [baseApis, setBaseApis] = useState<BaseApi[]>([]);
  const [editingOverride, setEditingOverride] = useState<Override | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overrides" | "config" | "samples"
  >("overrides");
  const [isLoading, setIsLoading] = useState(true);
  const [samples, setSamples] = useState<SampleOverride[]>([]);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [importingIndex, setImportingIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBaseApiId, setSelectedBaseApiId] = useState<string | null>(
    null
  );
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadOverrides();
    loadBaseApis();
    loadSamples();
  }, []);

  const loadOverrides = async () => {
    try {
      const response = await fetch("/api/overrides");
      if (response.ok) {
        const data = await response.json();
        setOverrides(data);
      }
    } catch (error) {
      console.error("Error loading overrides:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBaseApis = async () => {
    try {
      const response = await fetch("/api/base-apis");
      if (response.ok) {
        const apis: BaseApi[] = await response.json();
        setBaseApis(apis);
      }
    } catch (error) {
      console.error("Error loading base APIs:", error);
    }
  };

  const loadSamples = async () => {
    setIsLoadingSamples(true);
    try {
      const response = await fetch("/api/samples");
      if (response.ok) {
        const data = await response.json();
        setSamples(data);
      }
    } catch (error) {
      console.error("Error loading samples:", error);
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const handleEdit = (override: Override) => {
    setEditingOverride(override);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setOverrides(overrides.filter((o) => o.id !== id));
  };

  const handleSave = () => {
    setEditingOverride(null);
    setShowForm(false);
    loadOverrides();
  };

  const handleCancel = () => {
    setEditingOverride(null);
    setShowForm(false);
  };

  const handleNewOverride = () => {
    setEditingOverride(null);
    setShowForm(true);
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/overrides/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `api-overrides-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        addToast("Failed to export overrides", "error");
      }
    } catch (error) {
      console.error("Error exporting overrides:", error);
      addToast("Failed to export overrides", "error");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/overrides/import", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          addToast(
            result.message ||
              `Successfully imported ${result.created} override(s)`,
            "success"
          );
          loadOverrides();
        } else {
          addToast(result.error || "Failed to import overrides", "error");
        }
      } catch (error) {
        console.error("Error importing overrides:", error);
        addToast("Failed to import overrides", "error");
      }
    };
    input.click();
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
        loadOverrides();
        setActiveTab("overrides");
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">
              API Overrides Tool
            </h1>
            <div className="flex gap-2 items-center">
              <a
                href="https://ko-fi.com/U7U41HT7EX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img
                  height="36"
                  style={{ border: "0px", height: "36px" }}
                  src="https://storage.ko-fi.com/cdn/kofi2.png?v=6"
                  alt="Buy Me a Coffee at ko-fi.com"
                />
              </a>
              <Link
                href="https://github.com/imanng/api-overrides"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ⚙️ Settings
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure API overrides to intercept and modify API responses
          </p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "overrides" | "config" | "samples")
          }
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-3 text-sm sm:text-base">
            <TabsTrigger value="overrides">Overrides</TabsTrigger>
            <TabsTrigger value="config">API Configuration</TabsTrigger>
            <TabsTrigger value="samples">Samples</TabsTrigger>
          </TabsList>

          <TabsContent value="overrides" className="mt-6">
            {!showForm ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    API Overrides
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      className="text-sm"
                    >
                      📤 Export
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleImport}
                      className="text-sm"
                    >
                      📥 Import
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNewOverride}
                      className="text-sm"
                    >
                      + New Override
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <OverrideList
                    overrides={overrides}
                    baseApis={baseApis}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchQuery={searchQuery}
                    selectedBaseApiId={selectedBaseApiId}
                    selectedMethod={selectedMethod}
                    selectedStatus={selectedStatus}
                    onSearchChange={setSearchQuery}
                    onBaseApiChange={setSelectedBaseApiId}
                    onMethodChange={setSelectedMethod}
                    onStatusChange={setSelectedStatus}
                  />
                )}
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    {editingOverride ? "Edit Override" : "Create New Override"}
                  </h2>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <OverrideForm
                      override={editingOverride}
                      onSave={handleSave}
                      onCancel={handleCancel}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <div>
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Main API Configuration
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure the base API that will be proxied when no override
                  matches
                </p>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <ConfigForm />
                </CardContent>
              </Card>

              <Alert className="mt-8">
                <AlertTitle>How to use the proxy API</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-2">
                    Once configured, you can make requests to:
                  </p>
                  <code className="block text-xs sm:text-sm bg-muted p-2 rounded mt-2 font-mono break-all">
                    /api/proxy/[base-api-key]/your/path/here
                  </code>
                  <p className="mt-3">
                    Replace <code className="text-xs">[base-api-key]</code> with
                    the key of a configured base API. The proxy will check for
                    matching overrides first. If no override matches, it will
                    forward the request to the specified base API.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="samples" className="mt-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    Sample Overrides
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Browse example overrides to learn how to create your own
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDownloadSample}
                  className="text-sm"
                >
                  📥 Download All
                </Button>
              </div>

              {isLoadingSamples ? (
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
                            {sample.body !== null && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Request Body:
                                </p>
                                <code className="text-xs bg-muted p-1 rounded block break-words whitespace-pre-wrap overflow-x-auto">
                                  {String(JSON.stringify(sample.body, null, 2))}
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
                            {importingIndex === index
                              ? "Importing..."
                              : "Import"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div>
                          <p className="text-sm font-semibold mb-2">
                            Response Body:
                          </p>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-64 overflow-y-auto break-words whitespace-pre-wrap">
                            {String(
                              JSON.stringify(sample.responseBody, null, 2)
                            )}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
