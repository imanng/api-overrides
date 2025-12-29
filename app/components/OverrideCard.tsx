"use client";

import type { Override } from "@/types/override";
import type { BaseApi } from "@/types/api";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlertDialog } from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OverrideCardProps {
  override: Override;
  onEdit: (override: Override) => void;
  onDelete: (id: string) => void;
}

export default function OverrideCard({
  override,
  onEdit,
  onDelete,
}: OverrideCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [baseApi, setBaseApi] = useState<BaseApi | null>(null);
  const { showConfirm, showAlert } = useAlertDialog();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [responseData, setResponseData] = useState<unknown | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (override.baseApiId) {
      const loadBaseApi = async () => {
        try {
          const response = await fetch(`/api/base-apis/${override.baseApiId}`);
          if (response.ok) {
            const api: BaseApi = await response.json();
            setBaseApi(api);
          }
        } catch (error) {
          console.error("Error loading base API:", error);
        }
      };
      loadBaseApi();
    }
  }, [override.baseApiId]);

  const handleDelete = async () => {
    showConfirm(
      "Delete Override",
      "Are you sure you want to delete this override? This action cannot be undone.",
      () => {
        setIsDeleting(true);
        fetch(`/api/overrides/${override.id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              onDelete(override.id);
            } else {
              showAlert("Error", "Failed to delete override");
            }
          })
          .catch((error) => {
            console.error("Error deleting override:", error);
            showAlert("Error", "Failed to delete override");
          })
          .finally(() => {
            setIsDeleting(false);
          });
      }
    );
  };

  const getProxyUrl = () => {
    // Construct the proxy URL
    // Remove leading slash from path if present
    const cleanPath = override.path.startsWith("/")
      ? override.path.slice(1)
      : override.path;

    // Encode path segments (but preserve query string if present)
    const [pathPart, queryPart] = cleanPath.split("?");
    const encodedPath = pathPart
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const fullPath = queryPart ? `${encodedPath}?${queryPart}` : encodedPath;

    if (baseApi?.key) {
      // Use the base API key route: /api/proxy/[key]/[...path]
      return `/api/proxy/${baseApi.key}/${fullPath}`;
    } else {
      // Use the legacy route: /api/proxy/[...path]
      return `/api/proxy/${fullPath}`;
    }
  };

  const handleOpenInNewTab = () => {
    // Open in new tab
    window.open(getProxyUrl(), "_blank");
  };

  const handleShowResponse = async () => {
    setIsDialogOpen(true);
    setIsFetching(true);
    setFetchError(null);
    setResponseData(null);

    try {
      const proxyUrl = getProxyUrl();
      const fetchOptions: RequestInit = {
        method: override.method,
        headers: {
          ...override.headers,
        },
      };

      if (override.body) {
        fetchOptions.body = JSON.stringify(override.body);
      }

      const response = await fetch(proxyUrl, fetchOptions);
      const body = await response.json();
      setResponseData(body);
    } catch (error) {
      console.error("Error fetching response:", error);
      setFetchError(
        error instanceof Error ? error.message : "Failed to fetch response"
      );
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {override.method}
            </Badge>
            <code className="text-xs sm:text-sm text-muted-foreground break-all">
              {override.path}
            </code>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              title="Open in new tab"
              className="text-xs"
            >
              🔗 Open
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowResponse}
              disabled={isFetching}
              title="Show response"
              className="text-xs"
            >
              {isFetching ? "Loading..." : "📋 Response"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(override)}
              className="text-xs"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {override.headers && (
          <div>
            <span className="text-xs font-semibold text-muted-foreground">
              Headers:
            </span>
            <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto break-all whitespace-pre-wrap">
              {JSON.stringify(override.headers, null, 2)}
            </pre>
          </div>
        )}

        {override.body && (
          <div>
            <span className="text-xs font-semibold text-muted-foreground">
              Body:
            </span>
            <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto break-all whitespace-pre-wrap">
              {JSON.stringify(override.body, null, 2)}
            </pre>
          </div>
        )}

        <div className="pt-3 border-t space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
            <span>
              <span className="font-semibold text-muted-foreground">
                Status:
              </span>{" "}
              <code>{override.status}</code>
            </span>
            {override.ipAddress && (
              <span className="break-all">
                <span className="font-semibold text-muted-foreground">IP:</span>{" "}
                <code className="text-muted-foreground break-all">
                  {override.ipAddress}
                </code>
              </span>
            )}
            {baseApi && (
              <span className="break-all">
                <span className="font-semibold text-muted-foreground">
                  Base API:
                </span>{" "}
                <code className="text-muted-foreground break-all">
                  {baseApi.key}
                </code>
              </span>
            )}
          </div>
          <div className="text-xs">
            <span className="font-semibold text-muted-foreground">
              Response:
            </span>{" "}
            <code className="text-muted-foreground break-all">
              {typeof override.responseBody === "string"
                ? override.responseBody.substring(0, 50) + "..."
                : JSON.stringify(override.responseBody).substring(0, 50) +
                  "..."}
            </code>
          </div>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isFetching && (
              <div className="text-center py-4 text-muted-foreground">
                Fetching response...
              </div>
            )}
            {fetchError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded">
                <p className="text-sm font-semibold text-destructive">Error</p>
                <p className="text-sm text-destructive">{fetchError}</p>
              </div>
            )}
            {responseData !== null && (
              <pre className="text-xs p-2 bg-muted rounded overflow-x-auto break-all whitespace-pre-wrap">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
