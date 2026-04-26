"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Check, X } from "lucide-react";

interface EditableCellProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export function EditableCell({
  value,
  onSave,
  placeholder = "Add remarks...",
  className = "",
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onSave(tempValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };
  useEffect(() => {
    setTempValue(value);
  }, [value]);
  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className={`cursor-pointer px-3 py-2 rounded-md hover:bg-accent/50 transition-colors min-h-10 flex items-center ${className}`}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || placeholder}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isSaving}
        className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      />
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 transition-colors"
        title="Save"
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4 text-green-600" />
        )}
      </button>
      <button
        onClick={handleCancel}
        disabled={isSaving}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 transition-colors"
        title="Cancel"
      >
        <X className="w-4 h-4 text-red-600" />
      </button>
      {error && (
        <span className="text-xs text-red-600 whitespace-nowrap">{error}</span>
      )}
    </div>
  );
}
