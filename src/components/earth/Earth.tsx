"use client";

import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { useState, useEffect, useMemo } from "react";
import RotatingSphere from "./RotatingSphere";
import GlobeDot from "./GlobeDot";

export default function Earth() {
  const [offset, setOffset] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      setOffset((o) => {
        const delta = 5;
        switch (e.key) {
          case "ArrowUp":
            return { ...o, x: o.x + delta };
          case "ArrowDown":
            return { ...o, x: o.x - delta };
          case "ArrowLeft":
            return { ...o, y: o.y + delta };
          case "ArrowRight":
            return { ...o, y: o.y - delta };
          case "q":
            return { ...o, z: o.z - delta };
          case "e":
            return { ...o, z: o.z + delta };
          default:
            return o;
        }
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const markersLatLon = useMemo(
    () => [
      { lat: 48.8566, lon: 2.3522 },
      { lat: 40.7128, lon: -74.006 },
      { lat: -33.8688, lon: 151.2093 },
    ],
    [],
  );

  return (
    <div className="w-screen h-[calc(100vh-128px)] relative">
      <Canvas
        camera={{ position: [0, 2, 15], fov: 45 }}
        style={{ background: "black" }}
      >
        <Stars
          radius={100}
          depth={50}
          count={10000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        <spotLight
          position={[15, 0, 0]}
          angle={0.5}
          penumbra={0.4}
          intensity={0.8}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />

        <RotatingSphere
          markersLatLon={markersLatLon}
          radius={5}
          altitude={0}
          onPositionReach={() => {
            console.log("Position reached");
          }}
        />

        <GlobeDot radius={5} altitude={1} />
      </Canvas>

      <div className="absolute top-4 left-4 text-white bg-black/60 px-4 py-2 rounded shadow">
        Offsets → X: {Math.round(offset.x) % 360}°, Y:{" "}
        {Math.round(offset.y) % 360}°, Z: {Math.round(offset.z) % 360}°
        <div className="mt-1 text-xs">
          Use ↑/↓ = pitch, ←/→ = yaw, Q/E = roll
        </div>
      </div>
    </div>
  );
}
