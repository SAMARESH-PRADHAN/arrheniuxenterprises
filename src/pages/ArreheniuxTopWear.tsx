import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewCollectionProducts } from "@/hooks/api";

const ArreheniuxTopWear = () => {
  const { products: items, isLoading, isError } = useNewCollectionProducts(200);

  return (
    <Layout>
      <section className="bg-secondary">
        <div className="container-x py-12 md:py-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Arreheniux
          </span>
          <h1 className="font-display text-5xl md:text-7xl leading-none mt-3">
            ARREHENIUX TOP WEAR
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Browse our full range of Arreheniux Top Wear styles.
          </p>
        </div>
      </section>

      <section className="container-x py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col bg-card border border-border">
                <Skeleton className="w-full aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-muted-foreground">Could not load products.</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No products yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p) => (
              <ProductCard key={p.id} p={p as any} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default ArreheniuxTopWear;