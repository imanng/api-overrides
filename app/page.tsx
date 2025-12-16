"use client";

import { useState, useEffect } from "react";
import type { Override } from "@/types/override";
import OverrideList from "./components/OverrideList";
import OverrideForm from "./components/OverrideForm";
import ConfigForm from "./components/ConfigForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [editingOverride, setEditingOverride] = useState<Override | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"overrides" | "config">(
    "overrides"
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOverrides();
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Overrides</h1>
          <p className="text-muted-foreground">
            Configure API overrides to intercept and modify API responses
          </p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "overrides" | "config")
          }
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overrides">Overrides</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="overrides" className="mt-6">
            {!showForm ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">API Overrides</h2>
                  <Button onClick={handleNewOverride}>+ New Override</Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <OverrideList
                    overrides={overrides}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold">
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
                <h2 className="text-2xl font-semibold">
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
                  <code className="block text-sm bg-muted p-2 rounded mt-2 font-mono">
                    /api/proxy/your/path/here
                  </code>
                  <p className="mt-3">
                    The proxy will check for matching overrides first. If no
                    override matches, it will forward the request to your main
                    API.
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
