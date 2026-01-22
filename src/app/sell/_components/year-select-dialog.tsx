"use client";

import * as React from "react";
import { CalendarIcon, CheckIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface YearSelectDialogProps {
  value: string;
  onChange: (year: string) => void;
  className?: string;
}

const currentYear = new Date().getFullYear();
const startYear = 1970;
const years = Array.from(
  { length: currentYear - startYear + 1 },
  (_, i) => String(currentYear - i),
);

export function YearSelectDialog({
  value,
  onChange,
  className,
}: YearSelectDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (year: string) => {
    onChange(year);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value || "Select Year"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>Select Year</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[320px] pr-4">
          <div className="gap-4 flex flex-wrap items-center justify-center">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => handleSelect(year)}
                className={cn(
                  "flex w-24 items-center justify-between rounded-md px-4 py-4 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground ",
                  value === year && "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                <span className="text-center">{year}</span>
                {value === year && <CheckIcon className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

