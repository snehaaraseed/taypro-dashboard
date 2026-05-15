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
};
