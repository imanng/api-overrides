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
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      };

      const url = override ? `/api/overrides/${override.id}` : "/api/overrides";
      const method_http = override ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method_http,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSave();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save override");
      }
    } catch (error) {
      console.error("Error saving override:", error);
      alert("Failed to save override");
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

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : override ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
