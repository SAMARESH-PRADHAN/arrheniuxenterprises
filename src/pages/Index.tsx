import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/sections/Hero";
import { CategoriesGrid } from "@/components/sections/CategoriesGrid";
import { LatestCollection } from "@/components/sections/LatestCollection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Gallery } from "@/components/sections/Gallery";
import { FactorySection } from "@/components/sections/FactorySection";
import { WhyWhatWho } from "@/components/sections/WhyWhatWho";
import { StoreLocations } from "@/components/sections/StoreLocations";
import { Reviews } from "@/components/sections/Reviews";

const Index = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [hash]);

  return (
    <Layout>
      <SEO
        title="Custom T-Shirts, Hoodies & Uniforms Manufacturer"
        description="Factory-direct custom apparel from Bhubaneswar. Premium t-shirts, hoodies, polos, corporate uniforms, school uniforms, jerseys & merch. Bulk & B2B. Pan-India delivery."
        path="/"
      />
      <section id="home"><Hero /></section>
      <section id="categories"><CategoriesGrid /></section>
      <section id="collection"><LatestCollection /></section>
      <section id="clients"><Gallery /></section>
      {/* About Us section merges former "Factory" + "Process" content */}
      <section id="about-us">
        <FactorySection />
        <HowItWorks />
        <WhyWhatWho />
        <StoreLocations />
      </section>
      <Reviews />
    </Layout>
  );
};

export default Index;
