"use client";

import Link from "next/link";
import type { Override } from "@/types/override";
import OverrideCard from "./OverrideCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BaseApi } from "@/types/api";
import { Search } from "lucide-react";

interface OverrideListProps {
  overrides: Override[];
  baseApis: BaseApi[];
  onEdit: (override: Override) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  selectedBaseApiId: string | null;
  selectedMethod: string | null;
  selectedStatus: string | null;
  onSearchChange: (query: string) => void;
  onBaseApiChange: (baseApiId: string | null) => void;
  onMethodChange: (method: string | null) => void;
  onStatusChange: (status: string | null) => void;
}

export default function OverrideList({
  overrides,
  baseApis,
  onEdit,
  onDelete,
  searchQuery,
  selectedBaseApiId,
  selectedMethod,
  selectedStatus,
  onSearchChange,
  onBaseApiChange,
  onMethodChange,
  onStatusChange,
}: OverrideListProps) {
  const filteredOverrides = overrides.filter((override) => {
    // Search filter - check path, method, and status
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        override.path.toLowerCase().includes(query) ||
        override.method.toLowerCase().includes(query) ||
        override.status.toString().includes(query) ||
        JSON.stringify(override.responseBody).toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Base API filter
    if (selectedBaseApiId && override.baseApiId !== selectedBaseApiId) {
      return false;
    }

    // Method filter
    if (selectedMethod && override.method !== selectedMethod) {
      return false;
    }

    // Status filter
    if (selectedStatus && override.status.toString() !== selectedStatus) {
      return false;
    }

    return true;
  });

  const uniqueMethods = Array.from(
    new Set(overrides.map((o) => o.method))
  ).sort();
  const uniqueStatuses = Array.from(
    new Set(overrides.map((o) => o.status.toString()))
  ).sort((a, b) => parseInt(a) - parseInt(b));

  if (overrides.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No overrides configured yet.</p>
          <p className="text-sm mt-2 mb-4">
            Create your first override to get started, or browse sample
            overrides to see examples.
          </p>
          <Link href="/samples">
            <Button variant="ghost">📚 Browse Samples</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by path, method, status, or response..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base API</label>
                <Select
                  value={selectedBaseApiId || "__all__"}
                  onValueChange={(value) =>
                    onBaseApiChange(value === "__all__" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Base APIs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Base APIs</SelectItem>
                    {baseApis.map((api) => (
                      <SelectItem key={api.id} value={api.id}>
                        {api.key} {api.isDefault && "(Default)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Method</label>
                <Select
                  value={selectedMethod || "__all__"}
                  onValueChange={(value) =>
                    onMethodChange(value === "__all__" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Methods</SelectItem>
                    {uniqueMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status Code</label>
                <Select
                  value={selectedStatus || "__all__"}
                  onValueChange={(value) =>
                    onStatusChange(value === "__all__" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status Codes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Status Codes</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            {filteredOverrides.length !== overrides.length && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredOverrides.length} of {overrides.length}{" "}
                override(s)
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Override Cards */}
      {filteredOverrides.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No overrides match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOverrides.map((override) => (
            <OverrideCard
              key={override.id}
              override={override}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
