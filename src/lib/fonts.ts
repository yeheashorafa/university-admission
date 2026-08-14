import localFont from "next/font/local";

export const ibmPlexSansArabic = localFont({
  src: [
    {
      path: "../../public/fonts/ibm-plex-sans/ibm-plex-sans-arabic/IBMPlexSansArabic-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex-sans/ibm-plex-sans-arabic/IBMPlexSansArabic-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex-sans/ibm-plex-sans-arabic/IBMPlexSansArabic-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex-sans/ibm-plex-sans-arabic/IBMPlexSansArabic-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const ibmPlexSansEnglish = localFont({
  src: [
    {
      path: "../../public/fonts/ibm-plex-sans/ibm-plex-sans-english/IBMPlexSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex-sans/ibm-plex-sans-english/IBMPlexSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex-sans/ibm-plex-sans-english/IBMPlexSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/ibm-plex-sans/ibm-plex-sans-english/IBMPlexSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ibm-plex-english",
  display: "swap",
});