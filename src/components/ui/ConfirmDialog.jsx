"use client";

import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}) {
  return (
    <Modal open={open} onClose={onClose} title=" " size="sm">
      <div className="flex flex-col items-center text-center gap-3 pb-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={26} className="text-red-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            {title || "Are you sure?"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {message || "This action cannot be undone."}
          </p>
        </div>
        <div className="flex gap-3 mt-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
