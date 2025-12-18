"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, RefreshCw, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [userKey, setUserKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importUserKey, setImportUserKey] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    loadUserKey();
  }, []);

  const loadUserKey = async () => {
    try {
      const response = await fetch("/api/settings/user-key");
      if (response.ok) {
        const data = await response.json();
        setUserKey(data.userKey);
      }
    } catch (error) {
      console.error("Error loading user key:", error);
      addToast("Failed to load user key", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch("/api/settings/user-key", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setUserKey(data.userKey);
        addToast("User key regenerated successfully", "success");
      } else {
        addToast("Failed to regenerate user key", "error");
      }
    } catch (error) {
      console.error("Error regenerating user key:", error);
      addToast("Failed to regenerate user key", "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyKey = () => {
    if (userKey) {
      navigator.clipboard.writeText(userKey);
      addToast("User key copied to clipboard", "success");
    }
  };

  const handleImportClick = () => {
    setShowImportDialog(true);
  };

  const handleImportWithKey = async () => {
    if (!importUserKey.trim()) {
      addToast("Please enter a user key", "error");
      return;
    }

    setIsImporting(true);
    try {
      // Fetch overrides using the user key
      const fetchResponse = await fetch(
        `/api/overrides/with-key?key=${encodeURIComponent(
          importUserKey.trim()
        )}`
      );

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        addToast(errorData.error || "Failed to retrieve overrides", "error");
        setIsImporting(false);
        return;
      }

      const overrides = await fetchResponse.json();

      if (!Array.isArray(overrides) || overrides.length === 0) {
        addToast("No overrides found", "info");
        setIsImporting(false);
        setShowImportDialog(false);
        setImportUserKey("");
        return;
      }

      // Format overrides for import
      const importData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        overrides: overrides.map((override) => ({
          method: override.method,
          path: override.path,
          headers: override.headers,
          body: override.body,
          status: override.status,
          responseBody: override.responseBody,
        })),
      };

      // Create a FormData with the JSON data
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(importData, null, 2)], {
        type: "application/json",
      });
      formData.append("file", blob, "imported-overrides.json");

      // Import the overrides
      const importResponse = await fetch("/api/overrides/import", {
        method: "POST",
        body: formData,
      });

      const result = await importResponse.json();

      if (importResponse.ok) {
        // Update current user key to match the imported key
        try {
          const updateKeyResponse = await fetch("/api/settings/user-key", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userKey: importUserKey.trim() }),
          });

          if (updateKeyResponse.ok) {
            const keyData = await updateKeyResponse.json();
            setUserKey(keyData.userKey);
            addToast(
              result.message ||
                `Successfully imported ${result.created} override(s) and updated user key`,
              "success"
            );
          } else {
            addToast(
              result.message ||
                `Successfully imported ${result.created} override(s)`,
              "success"
            );
          }
        } catch (keyError) {
          console.error("Error updating user key:", keyError);
          addToast(
            result.message ||
              `Successfully imported ${result.created} override(s)`,
            "success"
          );
        }

        setShowImportDialog(false);
        setImportUserKey("");
        router.push("/");
      } else {
        addToast(result.error || "Failed to import overrides", "error");
      }
    } catch (error) {
      console.error("Error importing overrides:", error);
      addToast("Failed to import overrides", "error");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost">← Back</Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">
                Manage your user key and import overrides
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* User Key Card */}
          <Card>
            <CardHeader>
              <CardTitle>User Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use this user key to access your overrides and base APIs when
                your IP address changes. Keep this key secure and don't share it
                publicly.
              </p>

              {isLoading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type={showKey ? "text" : "password"}
                      value={userKey || ""}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyKey}
                      disabled={!userKey}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          isRegenerating ? "animate-spin" : ""
                        }`}
                      />
                      {isRegenerating ? "Regenerating..." : "Regenerate Key"}
                    </Button>
                  </div>
                  {showKey && (
                    <div className="mt-4 space-y-2">
                      <div className="p-3 bg-muted rounded text-xs">
                        <p className="font-semibold mb-1">
                          Overrides Access URL:
                        </p>
                        <code className="break-all">
                          {typeof window !== "undefined"
                            ? `${window.location.origin}/api/overrides/with-key?key=${userKey}`
                            : ""}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Retrieve Overrides Card */}
          <Card>
            <CardHeader>
              <CardTitle>Retrieve Overrides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Retrieve and import overrides using a user key. Enter the user
                key to fetch overrides from another instance.
              </p>
              <Button
                variant="outline"
                onClick={handleImportClick}
                disabled={isImporting}
              >
                {isImporting ? "Retrieving..." : "📥 Retrieve Overrides"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Retrieve Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retrieve Overrides with User Key</DialogTitle>
            <DialogDescription>
              Enter the user key to retrieve and import overrides from another
              instance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="importUserKey">User Key</Label>
              <Input
                id="importUserKey"
                type="password"
                value={importUserKey}
                onChange={(e) => setImportUserKey(e.target.value)}
                placeholder="Enter user key"
                className="font-mono text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleImportWithKey();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowImportDialog(false);
                setImportUserKey("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportWithKey}
              disabled={isImporting || !importUserKey.trim()}
            >
              {isImporting ? "Retrieving..." : "Retrieve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
