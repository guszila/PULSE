import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AlphaEdge",
    short_name: "AlphaEdge",
    description: "ตัวช่วยดูหุ้นและภาพรวมตลาดรายวัน",
    start_url: "/",
    display: "standalone",
    background_color: "#070807",
    theme_color: "#070807",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
