import { MetadataRoute } from "next";
import { createClient } from "@/prismicio";
import { getSiteIcon, siteIconUrl } from "@/utils/site-icon";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // App icons use the Site Icon from the Settings document when one is set
  const settings = await createClient()
    .getSingle("settings")
    .catch(() => null);
  const icon192 = siteIconUrl(getSiteIcon(settings?.data), 192);
  const icon512 = siteIconUrl(getSiteIcon(settings?.data), 512);

  return {
    name: "Kids Guitar Dojo",
    short_name: "Guitar Dojo",
    description: "Kids Guitar Dojo is a fun way to learn guitar for kids.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e8c996",
    theme_color: "#7c80ae",
    lang: "en",
    icons:
      icon192 && icon512
        ? [
            { src: icon192, sizes: "192x192", type: "image/png" },
            { src: icon512, sizes: "512x512", type: "image/png" },
          ]
        : [
            {
              src: "/favicon.ico",
              sizes: "16x16",
              type: "image/x-icon",
            },
            {
              src: "/favicon-32x32.png",
              sizes: "32x32",
              type: "image/x-icon",
            },
            {
              src: "/android-chrome-114x114.png",
              sizes: "114x114",
              type: "image/png",
            },
            {
              src: "/android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "maskable_icon_x192.png",
              sizes: "196x196",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "maskable_icon_x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
  };
}
