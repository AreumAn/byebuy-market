"use client";

import { InitialProducts } from "@/(tabs)/products/page";
import ListProduct from "./list-product";
import { useState } from "react";
import { getMoreProducts } from "@/(tabs)/products/action";

interface ProductListProps {
  initialProducts: InitialProducts;
}

export default function ProductList({initialProducts}: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const onLoadMore = async() => {
    setIsLoading(true);
    const newProducts = await getMoreProducts(page + 1);
    setProducts((prev) => [...prev, ...newProducts]);
    if(newProducts.length > 0) {
      setPage((prev) => prev + 1);
    } else {
      setIsLastPage(true);
    }
    setIsLoading(false);
  }
  return (
    <div className="p-5 flex flex-col gap-5">
      {products.map((product) => (
        <ListProduct key={product.id} {...product} />
      ))}
      {!isLastPage && (
        <button 
          disabled={isLoading} 
          onClick={onLoadMore} 
          className="text-sm font-semibold bg-orange-500 text-white rounded-md p-2">
          {isLoading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  )
}
