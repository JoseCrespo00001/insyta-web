import * as React from "react";
import {
  Archive,
  ArchiveRestore,
  Download,
  FileJson,
  Sheet as SheetIcon,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadAuditCsv, downloadAuditJson } from "@/lib/projects/export";
import type { Audit } from "@/lib/projects/types";

export function ReportActions({
  audit,
  onArchive,
  onDelete,
}: {
  audit: Audit;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const archived = audit.status === "archived";

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Descargar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => downloadAuditJson(audit)}>
            <FileJson className="h-4 w-4" />
            Reporte (JSON)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => downloadAuditCsv(audit)}>
            <SheetIcon className="h-4 w-4" />
            Conversaciones (CSV)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" onClick={() => onArchive(audit.id)}>
        {archived ? (
          <>
            <ArchiveRestore className="h-4 w-4" />
            Desarchivar
          </>
        ) : (
          <>
            <Archive className="h-4 w-4" />
            Archivar
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setConfirmDelete(true)}
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar auditoría</DialogTitle>
            <DialogDescription>
              Se va a eliminar <span className="font-medium">{audit.name}</span>{" "}
              y su reporte. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(audit.id);
                setConfirmDelete(false);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
