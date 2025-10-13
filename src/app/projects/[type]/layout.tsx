// // import { Metadata } from "next";

// // interface Props {
// //   params: {
// //     sitetype: string;
// //   };
// // }

// // export async function generateMetadata({ params }: Props): Promise<Metadata> {
// //   console.log(params);
// //   const sitetype = params.sitetype;

// //   return {
// //     title: `${sitetype} - Taypro Solar Projects`,
// //     description:
// //       "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
// //     keywords:
// //       "taypro projects, solar projects, automatic, semi-automatic, capex, energy industry",
// //     openGraph: {
// //       title: `${sitetype} - Taypro Solar Projects`,
// //       description:
// //         "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
// //       url: `https://taypro.com/${sitetype}`,
// //       // params: "website",
// //     },
// //   };
// // }

// // export default function ProjectTypeLayout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   return <>{children}</>;
// // }

// import { Metadata } from "next";

// interface Props {
//   params: {
//     type: string;
//   };
// }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const resolvedParams = await params; // ✅ wait for params
//   const { type } = resolvedParams;

//   return {
//     title: `${type} - Taypro Solar Projects`,
//     description:
//       "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
//     keywords:
//       "taypro projects, solar projects, automatic, semi-automatic, capex, energy industry",
//     openGraph: {
//       title: `${type} - Taypro Solar Projects`,
//       description:
//         "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
//       url: `https://taypro.com/projects/${type}`,
//     },
//   };
// }

// export default function ProjectTypeLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return <>{children}</>;
// }

import { Metadata } from "next";

// type ProjectTypeParams =
//   | { type: "automatic" }
//   | { type: "semi-automatic" }
//   | { type: "capex" }
//   | { type: string }; // fallback type (optional)

interface GenerateMetadataProps {
  params: { type: string } | Promise<{ type: string }>;
}

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  // ✅ works with both Promise and plain object
  const resolvedParams = await Promise.resolve(params);
  const { type } = resolvedParams;

  // ✅ optional validation: 404-safe title
  const validTypes = ["automatic", "semi-automatic", "capex"];
  const safeType = validTypes.includes(type.toLowerCase())
    ? type
    : "Project Type Not Found";

  return {
    title: `${safeType} - Taypro Solar Projects`,
    description:
      "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
    keywords:
      "taypro projects, solar projects, automatic, semi-automatic, capex, energy industry",
    openGraph: {
      title: `${safeType} - Taypro Solar Projects`,
      description:
        "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
      url: `https://taypro.com/projects/${type}`,
    },
  };
}

export default function ProjectTypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
