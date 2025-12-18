"use client";

import { useState, useEffect } from "react";
import type {
  Override,
  CreateOverrideInput,
  UpdateOverrideInput,
} from "@/types/override";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BaseApi } from "@/types/api";

interface OverrideFormProps {
  override?: Override | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function OverrideForm({
  override,
  onSave,
  onCancel,
}: OverrideFormProps) {
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState(200);
  const [responseBody, setResponseBody] = useState("");
  const [baseApiId, setBaseApiId] = useState<string | null>(null);
  const [baseApis, setBaseApis] = useState<BaseApi[]>([]);
  const [isLoadingApis, setIsLoadingApis] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  useEffect(() => {
    const loadBaseApis = async () => {
      try {
        const response = await fetch("/api/base-apis");
        if (response.ok) {
          const apis: BaseApi[] = await response.json();
          setBaseApis(apis);
        }
      } catch (error) {
        console.error("Error loading base APIs:", error);
      } finally {
        setIsLoadingApis(false);
      }
    };

    loadBaseApis();
  }, []);

  useEffect(() => {
    if (override) {
      setMethod(override.method);
      setPath(override.path);
      setHeaders(
        override.headers ? JSON.stringify(override.headers, null, 2) : ""
      );
      setBody(override.body ? JSON.stringify(override.body, null, 2) : "");
      setStatus(override.status);
      setResponseBody(
        typeof override.responseBody === "string"
          ? override.responseBody
          : JSON.stringify(override.responseBody, null, 2)
      );
      setBaseApiId(override.baseApiId || null);
    }
  }, [override]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!path.trim()) {
      newErrors.path = "Path is required";
    }

    if (!responseBody.trim()) {
      newErrors.responseBody = "Response body is required";
    }

    if (!baseApiId) {
      newErrors.baseApiId = "Base API is required";
    }

    // Validate JSON fields
    if (headers.trim()) {
      try {
        JSON.parse(headers);
      } catch {
        newErrors.headers = "Headers must be valid JSON";
      }
    }

    if (body.trim()) {
      try {
        JSON.parse(body);
      } catch {
        newErrors.body = "Body must be valid JSON";
      }
    }

    try {
      JSON.parse(responseBody);
    } catch {
      // Response body can be plain text or JSON
      if (!responseBody.trim()) {
        newErrors.responseBody = "Response body is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);

    try {
      const data: CreateOverrideInput | UpdateOverrideInput = {
        method,
        path: path.trim(),
        headers: headers.trim() ? JSON.parse(headers) : undefined,
        body: body.trim() ? JSON.parse(body) : undefined,
        status,
        responseBody: (() => {
          try {
            return JSON.parse(responseBody);
          } catch {
            return responseBody;
          }
        })(),
        baseApiId: baseApiId || null,
      };

      const url = override ? `/api/overrides/${override.id}` : "/api/overrides";
      const method_http = override ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method_http,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        addToast(
          override
            ? "Override updated successfully"
            : "Override created successfully",
          "success"
        );
        onSave();
      } else {
        const error = await response.json();
        addToast(error.error || "Failed to save override", "error");
      }
    } catch (error) {
      console.error("Error saving override:", error);
      addToast("Failed to save override", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="method">HTTP Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger id="method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Response Status Code</Label>
          <Input
            id="status"
            type="number"
            value={status}
            onChange={(e) => setStatus(parseInt(e.target.value) || 200)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="path">
          Path <span className="text-destructive">*</span>
        </Label>
        <Input
          id="path"
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/api/users/123"
          className="font-mono"
          required
        />
        {errors.path && (
          <Alert variant="destructive">
            <AlertDescription>{errors.path}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="headers">Headers (JSON, optional)</Label>
        <Textarea
          id="headers"
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          placeholder='{"Authorization": "Bearer token"}'
          rows={3}
          className="font-mono text-sm"
        />
        {errors.headers && (
          <Alert variant="destructive">
            <AlertDescription>{errors.headers}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Request Body (JSON, optional)</Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='{"name": "John"}'
          rows={4}
          className="font-mono text-sm"
        />
        {errors.body && (
          <Alert variant="destructive">
            <AlertDescription>{errors.body}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="responseBody">
          Response Body <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="responseBody"
          value={responseBody}
          onChange={(e) => setResponseBody(e.target.value)}
          placeholder='{"success": true, "data": {...}}'
          rows={6}
          className="font-mono text-sm"
          required
        />
        {errors.responseBody && (
          <Alert variant="destructive">
            <AlertDescription>{errors.responseBody}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="baseApiId">
          Base API <span className="text-destructive">*</span>
        </Label>
        <Select
          value={baseApiId || ""}
          onValueChange={(value) => setBaseApiId(value)}
          disabled={isLoadingApis}
        >
          <SelectTrigger id="baseApiId">
            <SelectValue placeholder="Select a base API" />
          </SelectTrigger>
          <SelectContent>
            {baseApis.map((api) => (
              <SelectItem key={api.id} value={api.id}>
                {api.key} {api.isDefault && "(Default)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.baseApiId && (
          <Alert variant="destructive">
            <AlertDescription>{errors.baseApiId}</AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">
          The base API that will be used when proxying requests that don't match
          this override
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="outline" disabled={isSaving}>
          {isSaving ? "Saving..." : override ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
