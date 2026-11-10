import Head from "next/head";

export const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://im-listening.vercel.app";

export function Meta({ title, description, share }: {
  title: string;
  description: string;
  share?: { path: string; image: string; imageAlt: string };
}) {
  const url = share && new URL(share.path, siteOrigin).href;
  const image = share && new URL(share.image, siteOrigin).href;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {share && <>
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="I'm Listening" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:image:alt" content={share.imageAlt} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:image:alt" content={share.imageAlt} />
      </>}
    </Head>
  );
}
