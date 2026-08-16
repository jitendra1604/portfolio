export type BuildingApp = {
  name: string;
  pitch: string;
  status: "in development" | "testing" | "live";
  type: "web" | "flutter" | "extension" | "cli";
  href?: string;
  previewSrc?: string;
};

// Add your in-progress apps here. Set previewSrc to a public video/GIF path
// when a demo is ready; the card will automatically render it.
export const buildingApps: BuildingApp[] = [];
