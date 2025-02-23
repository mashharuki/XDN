import type { Metadata } from "next";

/**
 * get Metadata method
 * @param param0
 * @returns
 */
export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/favicon.png",
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
}): Metadata => {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT || 3000}`;
  const imageUrl = `${baseUrl}${imageRelativePath}`;
  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      title: title,
      description: description,
      images: [imageUrl],
    },
  };
};
