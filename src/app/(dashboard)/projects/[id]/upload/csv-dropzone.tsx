"use client";

import * as React from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { FileText, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";

type Props = {
  onFile: (file: File) => void;
  disabled?: boolean;
  maxBytes: number;
};

export function CsvDropzone({ onFile, disabled, maxBytes }: Props) {
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const code = rejections[0].errors[0]?.code;
        if (code === "file-too-large") {
          setErrorMsg(
            `El archivo es muy grande. Maximo ${formatBytes(maxBytes)}.`,
          );
        } else if (code === "file-invalid-type") {
          setErrorMsg("Solo aceptamos archivos .csv.");
        } else {
          setErrorMsg("No pudimos aceptar ese archivo.");
        }
        return;
      }
      const file = accepted[0];
      if (!file) return;
      setErrorMsg(null);
      onFile(file);
    },
    [maxBytes, onFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    maxSize: maxBytes,
    disabled,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card px-6 py-10 text-center transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "hover:border-primary/50",
          disabled && "cursor-not-allowed opacity-50",
        )}
        aria-disabled={disabled}
      >
        <input {...getInputProps()} aria-label="Subir archivo CSV" />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isDragActive ? (
            <FileText className="h-6 w-6" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isDragActive
              ? "Soltalo para subir"
              : "Arrastra un CSV o clickea para elegir"}
          </p>
          <p className="text-xs text-muted-foreground">
            Maximo {formatBytes(maxBytes)} · solo .csv
          </p>
        </div>
      </div>
      {errorMsg ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {errorMsg}
        </p>
      ) : null}
    </div>
  );
}
