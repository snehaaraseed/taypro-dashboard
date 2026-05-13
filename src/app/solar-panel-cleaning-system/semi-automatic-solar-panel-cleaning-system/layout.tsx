import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title:
    "Semi-Automatic Solar Panel Cleaning Robot — Model-B | Pick-and-Place, Waterless | Taypro",
  description:
    "Taypro Model-B is a 39 kg pick-and-place, semi-automatic Solar Panel Cleaning Robot. Counter-rotating PBT brushes remove 99%+ dust in a single pass, clean a 1 MW plant in under 2 hours, run up to 3 km on a single charge, TÜV NORD certified, and built for fixed tilt, seasonal tilt and horizontal single-axis tracker plants.",
  keywords: [
    "Semi-Automatic Solar Panel Cleaning Robot",
    "semi automatic solar cleaning robot",
    "pick and place solar cleaning robot",
    "lift and shift solar cleaning robot",
    "portable solar panel cleaning robot",
    "manual deployment solar cleaning robot",
    "solar panel cleaning robot India",
    "solar panel cleaning robot manufacturer India",
    "solar panel cleaning robot price",
    "solar panel cleaning robot cost",
    "Model-B solar cleaning robot",
    "Taypro Model-B",
    "Taypro Loop",
    "waterless solar panel cleaning robot",
    "dry solar panel cleaning robot",
    "PBT brush solar cleaning robot",
    "counter-rotating brush solar cleaning",
    "fixed tilt solar panel cleaning",
    "seasonal tilt solar panel cleaning",
    "single-axis tracker solar cleaning",
    "rooftop solar cleaning robot",
    "utility scale solar cleaning",
    "solar O&M automation",
    "solar plant performance ratio improvement",
    "soiling loss reduction solar",
    "robotic solar panel cleaning system",
    "TÜV NORD certified solar cleaning robot",
    "solar farm cleaning robot",
  ],
  openGraph: {
    title:
      "Semi-Automatic Solar Panel Cleaning Robot — Model-B | Pick-and-Place, Waterless | Taypro",
    description:
      "Pick-and-place Solar Panel Cleaning Robot. 39 kg, waterless, dual counter-rotating PBT brushes, 99%+ dust removal in a single pass, 3 km per charge, TÜV NORD certified.",
    url: `${siteUrl}/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayprorobots/taypro-modelBcopy.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Semi-Automatic Solar Panel Cleaning Robot Model-B — Pick-and-place type, waterless",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Semi-Automatic Solar Panel Cleaning Robot — Model-B | Pick-and-Place, Waterless | Taypro",
    description:
      "39 kg pick-and-place Solar Panel Cleaning Robot. Waterless, dual counter-rotating PBT brushes, 99%+ dust removal per pass, TÜV NORD certified.",
    images: [`${siteUrl}/tayprorobots/taypro-modelBcopy.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system`,
  },
};

export default function SemiAutomaticRobotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
