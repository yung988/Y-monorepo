"use client";

import { Edit, MoreHorizontal, Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductActionsMenuProps {
  productId: string;
  onEditClick?: () => void;
  onVariantsClick?: () => void;
}

export function ProductActionsMenu({
  productId,
  onEditClick,
  onVariantsClick,
}: ProductActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href={`/products/${productId}`}
            onClick={(e) => {
              e.stopPropagation();
              onEditClick?.();
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Upravit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/products/${productId}?tab=variants`}
            onClick={(e) => {
              e.stopPropagation();
              onVariantsClick?.();
            }}
          >
            <Package className="mr-2 h-4 w-4" />
            Varianty
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
