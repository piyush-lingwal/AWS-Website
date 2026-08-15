import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AWS Student Builders Group at Tulas University";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090B",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          color: "white",
          fontFamily: "sans-serif",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.8)",
            padding: "60px",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 800,
              background: "linear-gradient(to right, #fff, #a1a1aa)",
              backgroundClip: "text",
              color: "transparent",
              margin: "0 0 20px 0",
              letterSpacing: "-0.02em",
            }}
          >
            AWS Student Builders Group
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: "#a1a1aa",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Tulas University, Dehradun
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
