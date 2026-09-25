import { ImageResponse } from "next/og";

export const alt = "yzt.digital — Yusuf Ziya Terzioğlu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const segments = Array.from({ length: 19 }, (_, index) => index);

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#000000",
          color: "#f2f2ed",
          padding: "62px 70px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "68%",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 21,
              letterSpacing: "0.16em",
              fontWeight: 700,
            }}
          >
            YZT.DIGITAL
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                maxWidth: 720,
                fontSize: 69,
                lineHeight: 0.98,
                letterSpacing: "-0.055em",
                fontWeight: 500,
              }}
            >
              Aynı materyal,
              <br />
              başka düzen.
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 23,
                color: "#8a8a84",
              }}
            >
              Yusuf Ziya Terzioğlu
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 14,
              letterSpacing: "0.1em",
              color: "#656560",
            }}
          >
            ÜRÜNLER · SİSTEMLER · MEKÂNLAR · KÜLTÜR · DENEYLER
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 72,
            top: 82,
            width: 380,
            height: 380,
            display: "flex",
          }}
        >
          {segments.map((index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: 188,
                top: 24,
                width: 4,
                height: 94,
                borderRadius: 999,
                background: "#f2f2ed",
                opacity: 0.72,
                transformOrigin: "2px 166px",
                transform: `rotate(${(360 / 19) * index}deg)`,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 163,
              top: 163,
              width: 54,
              height: 54,
              border: "1px solid #343431",
              borderRadius: "50%",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            right: 70,
            bottom: 62,
            display: "flex",
            gap: 18,
            fontSize: 14,
            letterSpacing: "0.16em",
            color: "#777772",
          }}
        >
          <span>19 / 19</span>
          <span>10 = 10</span>
        </div>
      </div>
    ),
    size,
  );
}
