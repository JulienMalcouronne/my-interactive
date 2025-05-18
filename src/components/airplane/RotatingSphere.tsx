"use client";

import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

export interface RotatingSphereProps {
  markersLatLon: { lat: number; lon: number }[];
  radius?: number;
  altitude?: number;
  spinSpeed?: number;
  threshold?: number;
  onPositionReach: (idx: number) => void;
}

export default function RotatingSphere({
  markersLatLon,
  radius = 5,
  altitude = 0,
  spinSpeed = 0.01,
  threshold = 0.02,
  onPositionReach,
}: RotatingSphereProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const texture = useLoader(THREE.TextureLoader, "/textures/map.jpg");
  const { camera } = useThree();

  const markerPositions = useMemo(() => {
    return markersLatLon.map(({ lat, lon }) => {
      const φ = THREE.MathUtils.degToRad(90 - lat);
      const θ = THREE.MathUtils.degToRad(lon);
      const r = radius + altitude;
      return new THREE.Vector3(
        r * Math.sin(φ) * Math.cos(θ),
        r * Math.cos(φ),
        r * Math.sin(φ) * Math.sin(θ),
      );
    });
  }, [markersLatLon, radius, altitude]);

  const markerRefs = useRef<Array<THREE.Mesh | null>>(
    Array(markersLatLon.length).fill(null),
  );

  const triggered = useRef<boolean[]>(Array(markersLatLon.length).fill(false));

  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const baseRot = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    baseRot.current.y += spinSpeed * delta;

    const tweak = THREE.MathUtils.degToRad(30) * delta;
    if (keys.current.ArrowUp) baseRot.current.x += tweak;
    if (keys.current.ArrowDown) baseRot.current.x -= tweak;
    if (keys.current.ArrowLeft) baseRot.current.y -= tweak;
    if (keys.current.ArrowRight) baseRot.current.y += tweak;
    if (keys.current.q) baseRot.current.z -= tweak;
    if (keys.current.e) baseRot.current.z += tweak;

    groupRef.current.rotation.set(
      baseRot.current.x,
      baseRot.current.y,
      baseRot.current.z,
    );

    markerRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const pos = new THREE.Vector3();
      mesh.getWorldPosition(pos);
      pos.project(camera);

      const dist = Math.hypot(pos.x, pos.y);
      if (dist < threshold && !triggered.current[i]) {
        triggered.current[i] = true;
        onPositionReach(i);
      } else if (dist >= threshold) {
        triggered.current[i] = false;
      }
    });
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {markerPositions.map((pos, i) => (
        <mesh key={i} position={pos} ref={(el) => (markerRefs.current[i] = el)}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      ))}
    </group>
  );
}
