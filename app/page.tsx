"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Override } from "@/types/override";
import type { BaseApi } from "@/types/api";
import OverrideList from "./components/OverrideList";
import OverrideForm from "./components/OverrideForm";
import ConfigForm from "./components/ConfigForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [baseApis, setBaseApis] = useState<BaseApi[]>([]);
  const [editingOverride, setEditingOverride] = useState<Override | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"overrides" | "config">(
    "overrides"
  );
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                API Overrides Tool
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Configure API overrides to intercept and modify API responses
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ⚙️ Settings
                </Button>
              </Link>
              <Link href="/samples">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  📚 Samples
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "overrides" | "config")
          }
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 text-sm sm:text-base">
            <TabsTrigger value="overrides">Overrides</TabsTrigger>
            <TabsTrigger value="config">API Configuration</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
}
