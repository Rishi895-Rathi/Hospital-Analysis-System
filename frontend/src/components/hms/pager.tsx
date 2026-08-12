import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page + 1} of {Math.max(totalPages, 1)}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page + 1 >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
