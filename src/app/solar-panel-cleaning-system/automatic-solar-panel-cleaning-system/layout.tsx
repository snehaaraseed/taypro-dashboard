import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automatic Solar Panel Cleaning Robot | Taypro",
  description:
    "Model-A uses AI-enabled technology to perform highly efficient cleaning cycles. It removes up to 100% dust and debris. Autonomous Waterless Solar Panel Cleaning Robot for Utility Scale Solar Power Plants",
  keywords:
    "solar panel cleaning robot, automatic solar robot, taypro, cleaning efficiency, automatic solar panel cleaning robot",
  openGraph: {
    title: `Automatic Solar Panel Cleaning Robot | Taypro`,
    description:
      "Model-A uses AI-enabled technology to perform highly efficient cleaning cycles. It removes up to 100% dust and debris. Autonomous Waterless Solar Panel Cleaning Robot for Utility Scale Solar Power Plants",
    url: `https://taypro-dashboard.vercel.app/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system`,
    type: "website",
  },
};

export default function AutomaticRobotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
