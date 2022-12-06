import Head from "next/head";

interface MetaProps {
  title: string;
  keywords: string;
  description: string;
}

export const Meta: React.FC<MetaProps> = ({ title, keywords, description }) => {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="keywords" content={keywords} />
      <meta name="description" content={description} />
      <meta charSet="utf-8" />
      <title>{title}</title>
    </Head>
  );
};

Meta.defaultProps = {
  title: "I'm Listening",
  keywords: "music, social media, social, share music, music",
  description: "Share what you're listening to.",
};
