"use client";

import type { Override } from "@/types/override";
import OverrideCard from "./OverrideCard";
import { Card, CardContent } from "@/components/ui/card";

interface OverrideListProps {
  overrides: Override[];
  onEdit: (override: Override) => void;
  onDelete: (id: string) => void;
}

export default function OverrideList({
  overrides,
  onEdit,
  onDelete,
}: OverrideListProps) {
  if (overrides.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No overrides configured yet.</p>
          <p className="text-sm mt-2">
            Create your first override to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {overrides.map((override) => (
        <OverrideCard
          key={override.id}
          override={override}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
