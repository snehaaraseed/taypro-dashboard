/** Local SEO place data for flagship solar case-study projects. */
export interface ProjectPlaceInfo {
  schemaId: string;
  name: string;
  addressLocality: string;
  addressRegion: string;
  latitude: number;
  longitude: number;
}

export const PROJECT_PLACE_BY_SLUG: Record<string, ProjectPlaceInfo> = {
  "agar-solar-project": {
    schemaId: "place-schema-agar-solar-project",
    name: "Agar Solar Power Plant, Madhya Pradesh",
    addressLocality: "Agar Malwa",
    addressRegion: "Madhya Pradesh",
    latitude: 23.7117,
    longitude: 76.0157,
  },
  "banda-solar-project": {
    schemaId: "place-schema-banda-solar-project",
    name: "Banda Solar Power Plant, Uttar Pradesh",
    addressLocality: "Banda",
    addressRegion: "Uttar Pradesh",
    latitude: 25.4796,
    longitude: 80.3386,
  },
  "soyegaon-solar-project": {
    schemaId: "place-schema-soyegaon-solar-project",
    name: "Soyegaon Solar Power Plant, Maharashtra",
    addressLocality: "Soyegaon",
    addressRegion: "Maharashtra",
    latitude: 20.58,
    longitude: 74.52,
  },
  "yadgir-solar-project-50-mw": {
    schemaId: "place-schema-yadgir-solar-project-50-mw",
    name: "Yadgir Solar Power Plant, Karnataka",
    addressLocality: "Yadgir",
    addressRegion: "Karnataka",
    latitude: 16.7626,
    longitude: 76.8358,
  },
  "akhadana-rajasthan-360-mw": {
    schemaId: "place-schema-akhadana-rajasthan-360-mw",
    name: "Akhadana Solar Power Plant, Rajasthan",
    addressLocality: "Jaisalmer district",
    addressRegion: "Rajasthan",
    latitude: 26.9157,
    longitude: 70.9083,
  },
  "bhadlarajasthan-300-mw": {
    schemaId: "place-schema-bhadlarajasthan-300-mw",
    name: "Bhadla Solar Park programme, Rajasthan",
    addressLocality: "Bhadla",
    addressRegion: "Rajasthan",
    latitude: 27.4084,
    longitude: 71.4167,
  },
  "bachau-dvc-gujrat-300-mw": {
    schemaId: "place-schema-bachau-dvc-gujrat-300-mw",
    name: "Bachau DVC Solar Power Plant, Gujarat",
    addressLocality: "Kutch",
    addressRegion: "Gujarat",
    latitude: 23.7337,
    longitude: 68.9924,
  },
  "chhayan-rajasthan-150-mw": {
    schemaId: "place-schema-chhayan-rajasthan-150-mw",
    name: "Chhayan Solar Power Plant, Rajasthan",
    addressLocality: "Jodhpur district",
    addressRegion: "Rajasthan",
    latitude: 26.2389,
    longitude: 73.0243,
  },
  "kmf-karnataka-75-mw": {
    schemaId: "place-schema-kmf-karnataka-75-mw",
    name: "KMF Solar Power Plant, Karnataka",
    addressLocality: "Karnataka",
    addressRegion: "Karnataka",
    latitude: 15.3173,
    longitude: 75.7139,
  },
  "nayveli-10-mw": {
    schemaId: "place-schema-nayveli-10-mw",
    name: "Nayveli Solar Power Plant, Tamil Nadu",
    addressLocality: "Neyveli",
    addressRegion: "Tamil Nadu",
    latitude: 11.5333,
    longitude: 79.4833,
  },
  "chennai-10-mw": {
    schemaId: "place-schema-chennai-10-mw",
    name: "Chennai Solar Power Plant, Tamil Nadu",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
  },
};
