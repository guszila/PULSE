import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#070807",
          position: "relative",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="128 160 256 192"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M128 352L224 256L288 320L384 160"
            stroke="#10b981"
            strokeWidth="48"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="384" cy="160" r="24" fill="#10b981" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
