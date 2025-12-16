"use client";

import type { Override } from "@/types/override";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this override?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/overrides/${override.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete(override.id);
      } else {
        alert("Failed to delete override");
      }
    } catch (error) {
      console.error("Error deleting override:", error);
      alert("Failed to delete override");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{override.method}</Badge>
            <code className="text-sm text-muted-foreground">
              {override.path}
            </code>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(override)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
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
            <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
              {JSON.stringify(override.headers, null, 2)}
            </pre>
          </div>
        )}

        {override.body && (
          <div>
            <span className="text-xs font-semibold text-muted-foreground">
              Body:
            </span>
            <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
              {JSON.stringify(override.body, null, 2)}
            </pre>
          </div>
        )}

        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center gap-4 text-xs">
            <span>
              <span className="font-semibold text-muted-foreground">
                Status:
              </span>{" "}
              <code>{override.status}</code>
            </span>
            <span>
              <span className="font-semibold text-muted-foreground">
                Response:
              </span>{" "}
              <code className="text-muted-foreground">
                {typeof override.responseBody === "string"
                  ? override.responseBody.substring(0, 50) + "..."
                  : JSON.stringify(override.responseBody).substring(0, 50) +
                    "..."}
              </code>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
