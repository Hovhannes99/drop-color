import React, { useState, useEffect, useRef } from "react";

interface MagnifierProps {
  src: string;
}

const Magnifier: React.FC<MagnifierProps> = ({ src }) => {
  const photoRef = useRef<HTMLImageElement>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [customCursorEnabled, setCustomCursorEnabled] = useState(false);
  const magnificationFactor = 2;

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging || !photoRef.current || !customCursorEnabled) return;

      const photoBounds = photoRef.current.getBoundingClientRect();
      let newX = e.clientX - photoBounds.left - 50;
      let newY = e.clientY - photoBounds.top - 50;

      newX = Math.max(0, Math.min(newX, photoBounds.width - 100));
      newY = Math.max(0, Math.min(newY, photoBounds.height - 100));

      setMagnifierPos({ x: newX, y: newY });
    }

    function handleMouseUp() {
      setDragging(false);
    }

    if (dragging && customCursorEnabled) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, customCursorEnabled]);

  useEffect(() => {
    if (!customCursorEnabled) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvas = () => {
      if (!photoRef.current) return;
      canvas.width = photoRef.current.naturalWidth;
      canvas.height = photoRef.current.naturalHeight;
      ctx.drawImage(photoRef.current, 0, 0, canvas.width, canvas.height);
    };

    if (photoRef.current) {
      photoRef.current.onload = updateCanvas;
      if (photoRef.current.complete) {
        updateCanvas();
      }
    }
    const rgbToHex = (r: number, g: number, b: number) => {
      const hex = [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("");
      return `#${hex}`;
    };

    const detectColor = (e: MouseEvent) => {
      if (!photoRef.current || !customCursorEnabled) return;
      const photoBounds = photoRef.current.getBoundingClientRect();
      const x =
        ((e.clientX - photoBounds.left) / photoBounds.width) * canvas.width;
      const y =
        ((e.clientY - photoBounds.top) / photoBounds.height) * canvas.height;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      setColor(rgbToHex(pixel[0], pixel[1], pixel[2]));
    };

    window.addEventListener("mousemove", detectColor);

    return () => {
      window.removeEventListener("mousemove", detectColor);
    };
  }, [customCursorEnabled]);

  return (
    <>
      <button
        onClick={() => setCustomCursorEnabled(!customCursorEnabled)}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: customCursorEnabled ? "#f44336" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          outline: "none",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s ease",
        }}
      >
        {customCursorEnabled ? "Disable" : "Enable"} color dropper
      </button>

      <div
        onMouseDown={() => setDragging(true)}
        onMouseUp={() => setDragging(false)}
        style={{
          cursor: customCursorEnabled
            ? dragging
              ? "grabbing"
              : "grab"
            : "default",
          position: "relative",
          userSelect: "none",
        }}
      >
        <img
          ref={photoRef}
          src={src}
          alt="Magnified"
          style={{ maxWidth: "100%", display: "block" }}
        />
        {customCursorEnabled && (
          <div
            style={{
              position: "absolute",
              left: `${magnifierPos.x}px`,
              top: `${magnifierPos.y}px`,
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: `14px solid ${color}`,
              overflow: "hidden",
              backgroundImage: `url(${src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${
                photoRef.current
                  ? photoRef.current.offsetWidth * magnificationFactor
                  : 0
              }px ${
                photoRef.current
                  ? photoRef.current.offsetHeight * magnificationFactor
                  : 0
              }px`,
              backgroundPosition: `${
                -magnifierPos.x * magnificationFactor +
                50 -
                (100 * magnificationFactor) / 2
              }px ${
                -magnifierPos.y * magnificationFactor +
                50 -
                (100 * magnificationFactor) / 2
              }px`,
            }}
          />
        )}
        {customCursorEnabled && (
          <div
            style={{
              position: "absolute",
              top: `${magnifierPos.y + 80}px`,
              left: `${magnifierPos.x + 29}px`,
              color: "#000",
              backgroundColor: "#fff",
              padding: "0px 4px",
              borderRadius: "13px",
              pointerEvents: "none",
            }}
          >
            {color}
          </div>
        )}
      </div>
    </>
  );
};

export default Magnifier;
