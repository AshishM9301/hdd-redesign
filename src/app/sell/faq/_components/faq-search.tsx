"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface FAQSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function FAQSearch({ value, onChange }: FAQSearchProps) {
  const [searchValue, setSearchValue] = React.useState(value);
  const debouncedSearch = useDebounce(searchValue, 300);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    onChange(debouncedSearch);
  }, [debouncedSearch, onChange]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClear = () => {
    setSearchValue("");
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="text-muted-foreground absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search questions... (Press Ctrl+K or Cmd+K)"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-14 w-full rounded-xl border-2 bg-background pl-12 pr-12 text-base shadow-sm transition-all focus:border-primary/50 focus:shadow-md"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-2 top-1/2 size-9 -translate-y-1/2 rounded-lg hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

