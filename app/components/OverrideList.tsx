"use client";

import Link from "next/link";
import type { Override } from "@/types/override";
import OverrideCard from "./OverrideCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
