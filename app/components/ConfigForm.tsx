"use client";

import { useState, useEffect } from "react";
import type { ApiConfig } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ConfigForm() {
  const [baseUrl, setBaseUrl] = useState("");
  const [authHeaders, setAuthHeaders] = useState("");
  const [timeout, setTimeout] = useState(30000);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/config");
      if (response.ok) {
        const config: ApiConfig = await response.json();
        setBaseUrl(config.baseUrl || "");
        setAuthHeaders(
          config.authHeaders ? JSON.stringify(config.authHeaders, null, 2) : ""
        );
        setTimeout(config.timeout || 30000);
      }
    } catch (error) {
      console.error("Error loading config:", error);
      setError("Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate JSON if provided
    let parsedAuthHeaders: Record<string, string> | undefined;
    if (authHeaders.trim()) {
      try {
        parsedAuthHeaders = JSON.parse(authHeaders);
      } catch {
        setError("Auth headers must be valid JSON");
        return;
      }
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: baseUrl.trim(),
          authHeaders: parsedAuthHeaders,
          timeout,
        }),
      });

      if (response.ok) {
        alert("Configuration saved successfully!");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      setError("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="baseUrl">
          Main API Base URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id="baseUrl"
          type="url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://api.example.com"
          required
        />
        <p className="text-xs text-muted-foreground">
          Base URL for the main API that will be proxied when no override
          matches
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="authHeaders">
          Authentication Headers (JSON, optional)
        </Label>
        <Textarea
          id="authHeaders"
          value={authHeaders}
          onChange={(e) => setAuthHeaders(e.target.value)}
          placeholder='{"Authorization": "Bearer token", "X-API-Key": "key"}'
          rows={4}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Headers to include in all proxied requests
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeout">Request Timeout (ms)</Label>
        <Input
          id="timeout"
          type="number"
          value={timeout}
          onChange={(e) => setTimeout(parseInt(e.target.value) || 30000)}
          min={1000}
          step={1000}
        />
        <p className="text-xs text-muted-foreground">
          Timeout for proxied requests in milliseconds (default: 30000)
        </p>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Configuration"}
      </Button>
    </form>
  );
}
