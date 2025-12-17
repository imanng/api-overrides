"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AlertDialogContextType {
  showAlert: (title: string, message: string, onConfirm?: () => void) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
}

const AlertDialogContext = React.createContext<
  AlertDialogContextType | undefined
>(undefined);

export function AlertDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [onConfirm, setOnConfirm] = React.useState<(() => void) | null>(null);
  const [onCancel, setOnCancel] = React.useState<(() => void) | null>(null);
  const [showCancel, setShowCancel] = React.useState(false);

  const showAlert = React.useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      setTitle(title);
      setMessage(message);
      setOnConfirm(() => onConfirm || null);
      setOnCancel(null);
      setShowCancel(false);
      setOpen(true);
    },
    []
  );

  const showConfirm = React.useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void
    ) => {
      setTitle(title);
      setMessage(message);
      setOnConfirm(() => onConfirm);
      setOnCancel(() => onCancel || null);
      setShowCancel(true);
      setOpen(true);
    },
    []
  );

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    setOpen(false);
    setOnConfirm(null);
    setOnCancel(null);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setOpen(false);
    setOnConfirm(null);
    setOnCancel(null);
  };

  return (
    <AlertDialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {showCancel && (
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button onClick={handleConfirm}>
              {showCancel ? "Confirm" : "OK"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AlertDialogContext.Provider>
  );
}

export function useAlertDialog() {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error("useAlertDialog must be used within AlertDialogProvider");
  }
  return context;
}
