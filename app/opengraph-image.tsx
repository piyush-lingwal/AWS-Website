import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AWS Student Builder Group at Tulas University";
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
          backgroundColor: "#FBF9FF",
          color: "#1B1140",
          fontFamily: "sans-serif",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "96px",
            height: "8px",
            borderRadius: "4px",
            backgroundColor: "#FF9900",
            marginBottom: "36px",
          }}
        />
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#1B1140",
            margin: "0 0 20px 0",
            letterSpacing: "-0.02em",
          }}
        >
          AWS Student Builder Group
        </h1>
        <p
          style={{
            fontSize: "36px",
            color: "#7C3AED",
            margin: 0,
            fontWeight: 600,
          }}
        >
          Tulas University, Dehradun
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
