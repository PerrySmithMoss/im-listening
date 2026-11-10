import Head from "next/head";

interface MetaProps {
  title: string;
  keywords: string;
  description: string;
}

export function Meta({ title, keywords, description }: MetaProps) {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="keywords" content={keywords} />
      <meta name="description" content={description} />
      <meta charSet="utf-8" />
      <title>{title}</title>
    </Head>
  );
}
