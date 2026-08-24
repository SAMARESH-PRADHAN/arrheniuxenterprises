import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.arrheniux.com";
const DEFAULT_IMAGE = `${SITE_URL}/hero-model.avif`;
const SITE_NAME = "Arrheniux Enterprises";

type SEOProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "product" | "article";
  noindex?: boolean;
};

export function SEO({
  title,
  description = "Factory-direct custom apparel from Bhubaneswar. Premium t-shirts, hoodies, polos, corporate uniforms, jerseys & merch. Bulk & B2B orders. Pan-India delivery.",
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Custom T-Shirts, Hoodies & Uniforms Manufacturer | Bhubaneswar`;

  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
