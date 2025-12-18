"use client";

import { useState, useEffect } from "react";
import type { BaseApi, ApiConfig } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Trash2, Plus, Edit2, X, Check } from "lucide-react";

export default function ConfigForm() {
  const [baseApis, setBaseApis] = useState<BaseApi[]>([]);
  const [timeout, setTimeout] = useState(30000);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newApi, setNewApi] = useState<{
    key?: string;
    baseUrl?: string;
    pathPrefix?: string | null;
    authHeaders?: string | Record<string, string> | null;
    isDefault?: boolean;
    order?: number;
  } | null>(null);
  const { showAlert, showConfirm } = useAlertDialog();
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

  const handleImportBaseApis = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/base-apis/import", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          addToast(
            result.message ||
              `Successfully imported ${result.created} base API(s)`,
            "success"
          );
          loadConfig();
        } else {
          addToast(result.error || "Failed to import base APIs", "error");
        }
      } catch (error) {
        console.error("Error importing base APIs:", error);
        addToast("Failed to import base APIs", "error");
      }
    };
    input.click();
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const [configResponse, apisResponse] = await Promise.all([
        fetch("/api/config"),
        fetch("/api/base-apis"),
      ]);

      if (configResponse.ok) {
        const config: ApiConfig = await configResponse.json();
        setTimeout(config.timeout || 30000);
      }

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

  const handleSaveTimeout = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeout }),
      });

      if (response.ok) {
        addToast("Timeout saved successfully", "success");
      } else {
        const errorData = await response.json();
        addToast(errorData.error || "Failed to save timeout", "error");
      }
    } catch (error) {
      console.error("Error saving timeout:", error);
      addToast("Failed to save timeout", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateApi = async () => {
    if (!newApi?.key || !newApi?.baseUrl) {
      addToast("Key and Base URL are required", "error");
      return;
    }

    // Validate JSON if provided
    let parsedAuthHeaders: Record<string, string> | undefined;
    if (newApi.authHeaders && typeof newApi.authHeaders === "string") {
      try {
        parsedAuthHeaders = JSON.parse(newApi.authHeaders);
      } catch {
        addToast("Auth headers must be valid JSON", "error");
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/base-apis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newApi.key,
          baseUrl: newApi.baseUrl,
          pathPrefix: newApi.pathPrefix || null,
          authHeaders: parsedAuthHeaders,
          isDefault: newApi.isDefault || false,
          order: newApi.order || 0,
        }),
      });

      if (response.ok) {
        const created: BaseApi = await response.json();
        setBaseApis([...baseApis, created]);
        setNewApi(null);
        addToast("Base API created successfully", "success");
      } else {
        const errorData = await response.json();
        addToast(errorData.error || "Failed to create base API", "error");
      }
    } catch (error) {
      console.error("Error creating base API:", error);
      addToast("Failed to create base API", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateApi = async (id: string, api: Partial<BaseApi>) => {
    // Validate JSON if provided
    let parsedAuthHeaders: Record<string, string> | undefined;
    if (api.authHeaders && typeof api.authHeaders === "string") {
      try {
        parsedAuthHeaders = JSON.parse(api.authHeaders);
      } catch {
        addToast("Auth headers must be valid JSON", "error");
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/base-apis/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: api.key,
          baseUrl: api.baseUrl,
          pathPrefix: api.pathPrefix,
          authHeaders: parsedAuthHeaders,
          isDefault: api.isDefault,
          order: api.order,
        }),
      });

      if (response.ok) {
        const updated: BaseApi = await response.json();
        setBaseApis(baseApis.map((a) => (a.id === id ? updated : a)));
        setEditingId(null);
        addToast("Base API updated successfully", "success");
      } else {
        const errorData = await response.json();
        addToast(errorData.error || "Failed to update base API", "error");
      }
    } catch (error) {
      console.error("Error updating base API:", error);
      addToast("Failed to update base API", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApi = async (id: string) => {
    showConfirm(
      "Delete Base API",
      "Are you sure you want to delete this base API? This action cannot be undone.",
      async () => {
        try {
          const response = await fetch(`/api/base-apis/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            setBaseApis(baseApis.filter((a) => a.id !== id));
            addToast("Base API deleted successfully", "success");
          } else {
            const errorData = await response.json();
            addToast(errorData.error || "Failed to delete base API", "error");
          }
        } catch (error) {
          console.error("Error deleting base API:", error);
          addToast("Failed to delete base API", "error");
        }
      }
    );
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const editingApi = editingId
    ? baseApis.find((a) => a.id === editingId)
    : null;

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Global Timeout Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timeout">Request Timeout (ms)</Label>
            <div className="flex gap-2">
              <Input
                id="timeout"
                type="number"
                value={timeout}
                onChange={(e) => setTimeout(parseInt(e.target.value) || 30000)}
                min={1000}
                step={1000}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveTimeout}
                disabled={isSaving}
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Timeout for proxied requests in milliseconds (default: 30000)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Base APIs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Base APIs</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportBaseApis}
              >
                📤 Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportBaseApis}
              >
                📥 Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setNewApi({
                    key: "",
                    baseUrl: "",
                    pathPrefix: null,
                    authHeaders: null,
                    isDefault: false,
                    order: baseApis.length,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Base API
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New API Form */}
          {newApi && (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">New Base API</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNewApi(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Key <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={newApi.key || ""}
                      onChange={(e) =>
                        setNewApi({ ...newApi, key: e.target.value })
                      }
                      placeholder="unique-key-identifier"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Base URL <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={newApi.baseUrl || ""}
                      onChange={(e) =>
                        setNewApi({ ...newApi, baseUrl: e.target.value })
                      }
                      placeholder="https://api.example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Path Prefix (optional)</Label>
                  <Input
                    value={newApi.pathPrefix || ""}
                    onChange={(e) =>
                      setNewApi({
                        ...newApi,
                        pathPrefix: e.target.value || null,
                      })
                    }
                    placeholder="/api/v1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Requests starting with this prefix will use this API
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Authentication Headers (JSON, optional)</Label>
                  <Textarea
                    value={
                      typeof newApi.authHeaders === "string"
                        ? newApi.authHeaders
                        : newApi.authHeaders
                        ? JSON.stringify(newApi.authHeaders, null, 2)
                        : ""
                    }
                    onChange={(e) =>
                      setNewApi({ ...newApi, authHeaders: e.target.value })
                    }
                    placeholder='{"Authorization": "Bearer token"}'
                    rows={3}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newApi.isDefault || false}
                      onChange={(e) =>
                        setNewApi({ ...newApi, isDefault: e.target.checked })
                      }
                    />
                    <span className="text-sm">Set as default</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Order:</Label>
                    <Input
                      type="number"
                      value={newApi.order || 0}
                      onChange={(e) =>
                        setNewApi({
                          ...newApi,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-20"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCreateApi}
                  disabled={isSaving}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Existing APIs */}
          {baseApis.length === 0 && !newApi && (
            <div className="text-center py-8 text-muted-foreground">
              No base APIs configured. Click "Add Base API" to get started.
            </div>
          )}

          {baseApis.map((api) => (
            <Card key={api.id}>
              <CardContent className="pt-6">
                {editingId === api.id ? (
                  <EditApiForm
                    api={api}
                    onSave={(updated) => handleUpdateApi(api.id, updated)}
                    onCancel={() => setEditingId(null)}
                    isSaving={isSaving}
                  />
                ) : (
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingId(api.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteApi(api.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function EditApiForm({
  api,
  onSave,
  onCancel,
  isSaving,
}: {
  api: BaseApi;
  onSave: (updated: Partial<BaseApi>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [key, setKey] = useState(api.key);
  const [baseUrl, setBaseUrl] = useState(api.baseUrl);
  const [pathPrefix, setPathPrefix] = useState(api.pathPrefix || "");
  const [authHeaders, setAuthHeaders] = useState(
    api.authHeaders ? JSON.stringify(api.authHeaders, null, 2) : ""
  );
  const [isDefault, setIsDefault] = useState(api.isDefault);
  const [order, setOrder] = useState(api.order);

  const handleSubmit = () => {
    let parsedAuthHeaders: Record<string, string> | null = null;
    if (authHeaders.trim()) {
      try {
        const parsed = JSON.parse(authHeaders);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          !Array.isArray(parsed)
        ) {
          parsedAuthHeaders = parsed as Record<string, string>;
        }
      } catch {
        // Invalid JSON, will be caught by parent
        return;
      }
    }
    onSave({
      key,
      baseUrl,
      pathPrefix: pathPrefix || null,
      authHeaders: parsedAuthHeaders,
      isDefault,
      order,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Key <span className="text-destructive">*</span>
          </Label>
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="unique-key-identifier"
          />
        </div>
        <div className="space-y-2">
          <Label>
            Base URL <span className="text-destructive">*</span>
          </Label>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Path Prefix (optional)</Label>
        <Input
          value={pathPrefix}
          onChange={(e) => setPathPrefix(e.target.value)}
          placeholder="/api/v1"
        />
        <p className="text-xs text-muted-foreground">
          Requests starting with this prefix will use this API
        </p>
      </div>
      <div className="space-y-2">
        <Label>Authentication Headers (JSON, optional)</Label>
        <Textarea
          value={authHeaders}
          onChange={(e) => setAuthHeaders(e.target.value)}
          placeholder='{"Authorization": "Bearer token"}'
          rows={3}
          className="font-mono text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          <span className="text-sm">Set as default</span>
        </label>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Order:</Label>
          <Input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            className="w-20"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleSubmit} disabled={isSaving}>
          <Check className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
