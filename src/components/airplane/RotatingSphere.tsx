import { useLoader, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function RotatingSphere() {
  const mesh = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, "/textures/map.jpg");

  const keys = useRef<{ [k: string]: boolean }>({});
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

  // 2. per‐frame base spin + smooth key spin
  const base = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((_, delta) => {
    // continuous spin speeds (radians/sec)
    base.current.x += 0 * delta;
    base.current.y += 0.01 * delta;
    base.current.z += 0 * delta;

    // define how fast you want to nudge when key held (radians/sec)
    const tweakSpeed = THREE.MathUtils.degToRad(30); // 30° per second

    if (keys.current.ArrowUp) base.current.x += tweakSpeed * delta;
    if (keys.current.ArrowDown) base.current.x -= tweakSpeed * delta;
    if (keys.current.ArrowLeft) base.current.y -= tweakSpeed * delta;
    if (keys.current.ArrowRight) base.current.y += tweakSpeed * delta;
    if (keys.current.q) base.current.z -= tweakSpeed * delta;
    if (keys.current.e) base.current.z += tweakSpeed * delta;

    mesh.current.rotation.set(base.current.x, base.current.y, base.current.z);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[5, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
