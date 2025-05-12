'use client'

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function My3dScene() {
  const [heading, setHeading] = useState(0);

  return (
    <div className="w-screen h-screen relative">
      <Canvas camera={{ position: [0, 2, 15], fov: 45 }} style={{ background: 'black' }}>
        <Stars radius={100} depth={50} count={10000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        <spotLight position={[15, 0, 0]} angle={0.5} penumbra={0.4} intensity={0.8} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        <GlobePlane heading={heading} setHeading={setHeading} />
      </Canvas>

      <div className="absolute top-4 left-4 text-white bg-black/60 px-4 py-2 rounded shadow">
        Heading: {Math.round((heading * 180) / Math.PI) % 360}°
      </div>
    </div>
  );
}
const textureLoader = new THREE.TextureLoader();


function GlobePlane({ heading, setHeading }: { heading: number, setHeading: (heading: number) => void }) {
  const { camera } = useThree();
  const texture = useLoader(THREE.TextureLoader, '/textures/map.jpg');

  const planeRef = useRef<THREE.Mesh>(null);
  const [turnLeft, setTurnLeft] = useState(false);
  const [turnRight, setTurnRight] = useState(false);
  const radius = 5;
  const altitude = 1;
  const speed = 0.1;


  // position and direction vectors in Cartesian space
  const posVec = useRef(new THREE.Vector3(radius + altitude, 0, 0));
  const dirVec = useRef(new THREE.Vector3(0, 0, 1));

  useFrame(() => {
    // handle continuous turning
    const axis = posVec.current.clone().normalize();
    if (turnLeft) {
      dirVec.current.applyAxisAngle(axis, 0.03);
      // ensure direction stays tangential
      dirVec.current.projectOnPlane(axis).normalize();
      setHeading(heading + 0.03);
    }
    if (turnRight) {
      dirVec.current.applyAxisAngle(axis, -0.03);
      // ensure direction stays tangential
      dirVec.current.projectOnPlane(axis).normalize();
      setHeading(heading - 0.03);
    }
    // advance position
    posVec.current.add(dirVec.current.clone().normalize().multiplyScalar(speed));
    // project back to sphere surface + altitude
    posVec.current.normalize().multiplyScalar(radius + altitude);
    // set plane position
    planeRef.current?.position.copy(posVec.current);

    // look ahead
    // look ahead
    const target = posVec.current.clone().add(dirVec.current);
    planeRef.current?.lookAt(target);
    // camera follow plane
    const camOffset = new THREE.Vector3(0, 2, 5).applyQuaternion(planeRef.current!.quaternion);
    const camPos = planeRef.current!.position.clone().add(camOffset);
    camera.position.lerp(camPos, 0.1);
    camera.lookAt(planeRef.current!.position);
    planeRef.current!.lookAt(target);
    // tilt wings
    planeRef.current!.rotation.z = -heading * 0.3;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setTurnLeft(true);
      if (e.key === 'ArrowRight') setTurnRight(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setTurnLeft(false);
      if (e.key === 'ArrowRight') setTurnRight(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <primitive
        ref={planeRef}
        object={useGLTF('/models/airplane.glb').scene}
        scale={0.05}
      />
    </>
  );
}

useGLTF.preload('/models/airplane.glb'); ('/models/airplane.glb');
