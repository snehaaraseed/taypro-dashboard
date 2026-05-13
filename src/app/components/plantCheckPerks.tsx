import type { LucideIcon } from "lucide-react";
import { Droplets, Headphones, Sparkles } from "lucide-react";

export type PlantCheckPerk = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export const PLANT_CHECK_PERKS: PlantCheckPerk[] = [
  {
    icon: Droplets,
    title: "Waterless, built for real farms",
    text: "See how dry cleaning fits your O&M and water story, not a generic brochure.",
  },
  {
    icon: Sparkles,
    title: "Model fit, not a catalog pitch",
    text: "Fixed-tilt, single-axis tracker, or service-led. We point you to what applies.",
  },
  {
    icon: Headphones,
    title: "Talk to people who ship robots",
    text: "Short follow-up from our applications team. No prize wheels, no spam blasts.",
  },
];
