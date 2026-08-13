import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "./components/ScrollToTop";
import RouteLoader from "./components/RouteLoader";
import { VisitTracker } from "./components/VisitTracker";
import { BrandLoader } from "./components/BrandLoader";

const Index = lazy(() => import("./pages/Index.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const CategoryTiers = lazy(() => import("./pages/CategoryTiers.tsx"));
const SubcategoryList = lazy(() => import("./pages/SubcategoryList.tsx"));
const ProductList = lazy(() => import("./pages/ProductList.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const BulkOrder = lazy(() => import("./pages/BulkOrder.tsx"));
const B2BShop = lazy(() => import("./pages/B2BShop.tsx"));
const MyOrders = lazy(() => import("./pages/MyOrders.tsx"));
const MyAddresses = lazy(() => import("./pages/MyAddresses.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminApp = lazy(() => import("./admin/AdminApp"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <RouteLoader />
        <VisitTracker />
        <Suspense fallback={<BrandLoader fullscreen />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            {/* Category navigation: /category/:cat → tier picker (or subcat list when no tiers) */}
            <Route path="/category/:cat" element={<CategoryTiers />} />
            {/* /category/:cat/:tier → subcategories for that tier (regular|premium) */}
            <Route path="/category/:cat/:tier" element={<SubcategoryList />} />
            {/* /category/:cat/:tier/:sub → product listing */}
            <Route path="/category/:cat/:tier/:sub" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/bulk-order" element={<BulkOrder />} />
            <Route path="/b2b-shop" element={<B2BShop />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/my-addresses" element={<MyAddresses />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
