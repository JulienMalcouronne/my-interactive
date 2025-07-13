'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function GlobeDot({ radius, altitude }: { radius: number; altitude: number }) {
  const { camera } = useThree();
  const dot = useRef<THREE.Mesh>(null!);
  const pos = useRef(new THREE.Vector3(radius + altitude, 0, 0));
  const dir = useRef(new THREE.Vector3(0, 0, 1));
  const speed = 0.1;

  useFrame(() => {
    pos.current.add(dir.current.clone().normalize().multiplyScalar(speed));
    pos.current.normalize().multiplyScalar(radius + altitude);
    dot.current.position.copy(pos.current);

    const camOff = new THREE.Vector3(0, 2, 5).applyQuaternion(dot.current.quaternion);
    const desired = pos.current.clone().add(camOff);
    camera.position.lerp(desired, 0.1);
    camera.lookAt(pos.current);
  });

  return (
    <mesh ref={dot}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
}
