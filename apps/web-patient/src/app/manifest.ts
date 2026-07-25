import type { MetadataRoute } from "next";

export default function Manifest(): MetadataRoute.Manifest {
  return {
    name: "SaludTech - Paciente",
    short_name: "SaludTech",
    description: "Portal del paciente SaludTech",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a6b8a",
    orientation: "portrait",
    icons: [
      {
        src: "/logostc.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logostc.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
