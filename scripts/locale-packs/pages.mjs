import { homePack } from "./home.mjs";
import { contactPack } from "./contact.mjs";
import { siteMapPack } from "./site-map.mjs";
import { performanceMethodologyPack } from "./performance-methodology.mjs";
import { minyPack } from "./miny.mjs";
import { cradylPack } from "./cradyl.mjs";
import { companyPack } from "./company.mjs";
import { solarSystemPack } from "./solar-system.mjs";
import { cleaningTechnologyPack } from "./cleaning-technology.mjs";
import {
  privacyPolicyPack,
  termsOfServicePack,
  cookiePolicyPack,
} from "./legal.mjs";
import { cleaningServicePack } from "./cleaning-service.mjs";
import { projectsFilterPack } from "./projects-filter.mjs";
import { tayproConsolePack } from "./taypro-console.mjs";

/** @type {{ slug: string; pack: object }[]} */
export const pagePacks = [
  { slug: "home", pack: homePack },
  { slug: "contact", pack: contactPack },
  { slug: "site-map", pack: siteMapPack },
  { slug: "performance-methodology", pack: performanceMethodologyPack },
  { slug: "miny", pack: minyPack },
  { slug: "cradyl", pack: cradylPack },
  { slug: "company", pack: companyPack },
  { slug: "solar-system", pack: solarSystemPack },
  { slug: "cleaning-service", pack: cleaningServicePack },
  { slug: "cleaning-technology", pack: cleaningTechnologyPack },
  { slug: "projects-filter", pack: projectsFilterPack },
  { slug: "taypro-console", pack: tayproConsolePack },
  { slug: "privacy-policy", pack: privacyPolicyPack },
  { slug: "terms-of-service", pack: termsOfServicePack },
  { slug: "cookie-policy", pack: cookiePolicyPack },
];
