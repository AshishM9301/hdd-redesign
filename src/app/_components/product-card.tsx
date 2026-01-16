import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/product";
import Image from "next/image";
import React from "react";

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  const isNew = (() => {
    if (!product.meta?.createdAt) return false;

    const createdTime = new Date(product.meta.createdAt).getTime();
    if (Number.isNaN(createdTime)) return false;

    const now = Date.now();
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

    //     const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    // return now - createdTime <= THIRTY_DAYS_MS;

    return now - createdTime <= ONE_YEAR_MS;
  })();

  return (
    <Card className="relative flex cursor-pointer flex-col overflow-hidden py-0">
      <div className="absolute top-[-2px] right-4 z-10 flex h-12 items-center justify-center rounded-b-sm bg-yellow-300">
        {isNew ? (
          <Badge
            className="bg-transparent text-xs text-gray-800"
            variant="default"
          >
            New
          </Badge>
        ) : null}
      </div>
      <div className="bg-accent/40 relative aspect-4/3 w-full overflow-hidden">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(min-width: 1024px) 250px, (min-width: 768px) 33vw, 100vw"
        />
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">
            {product.title}
          </CardTitle>
          <div className="flex items-center gap-1">
            {product.qualifiesForEquipmentAssurance ? (
              <Badge variant="default" className="bg-primary text-xs">
                Assured
              </Badge>
            ) : null}
            {product.brand ? (
              <Badge variant="outline" className="text-xs">
                {product.brand}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-3 pb-4">
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {product.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-lg font-semibold">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-muted-foreground text-xs">
            ⭐ {product.rating.toFixed(1)} · {product.stock} in stock
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
