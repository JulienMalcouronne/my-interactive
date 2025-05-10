'use client'

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars, useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function My3dScene() {
  const [heading, setHeading] = useState(0);

  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} style={{ background: 'black' }}>
        <Stars radius={100} depth={50} count={10000} factor={4} saturation={0} fade speed={1} />
        <directionalLight position={[-30, 0, 30]} intensity={0.6} color="#6dbfff" />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        <spotLight position={[15, 0, 0]} angle={1.2} penumbra={0.5} intensity={0.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

        <GlobeWithPlane heading={heading} setHeading={setHeading} />
      </Canvas>

      <div className="absolute top-4 left-4 text-white bg-black/60 px-4 py-2 rounded shadow">
        Heading: {Math.round((heading * 180) / Math.PI) % 360}°
      </div>
    </div>
  );
}

function GlobeWithPlane({ heading, setHeading }: { heading: number; setHeading: (val: number) => void }) {
  const texture = useLoader(THREE.TextureLoader, '/textures/map.jpg');
  const globeRef = useRef<THREE.Mesh>(null);
  const planeRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const gltf = useGLTF('/models/airplane.glb');
  const radius = 5.1;
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const [path, setPath] = useState<[number, number, number][]>([]);

  const checkpoints = [
    { id: 'paris', label: 'Paris, France', content: 'lorem', lat: 48.8566, lng: 2.3522 },
    { id: 'tokyo', label: 'Tokyo, Japon', content: 'lorem', lat: 35.6895, lng: 139.6917 },
    { id: 'nyc', label: 'New York, USA', content: 'lorem', lat: 40.7128, lng: -74.006 }
  ];

  function latLngToCartesian(lat: number, lng: number, r: number): [number, number, number] {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -r * Math.sin(phi) * Math.cos(theta);
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);
    return [x, y, z];
  }

  useFrame(() => {
    setLat((prev) => Math.max(-89, Math.min(89, prev + Math.cos(heading) * 0.02)));
    setLng((prev) => prev + Math.sin(heading) * 0.02);

    const pos = latLngToCartesian(lat, lng, radius);

    if (planeRef.current) {
      planeRef.current.position.set(...pos);

      const tangentLat = lat + Math.cos(heading + 0.1) * 0.5;
      const tangentLng = lng + Math.sin(heading + 0.1) * 0.5;
      const tangent = latLngToCartesian(tangentLat, tangentLng, radius);

      const up = new THREE.Vector3(...pos).normalize();
      planeRef.current.up.copy(up);
      planeRef.current.lookAt(new THREE.Vector3(...tangent));

      const roll = Math.sin(heading) * -0.3;
      planeRef.current.rotation.z = roll;

      const followOffset = new THREE.Vector3()
        .subVectors(planeRef.current.position, new THREE.Vector3(...tangent))
        .normalize()
        .multiplyScalar(20)
        .add(new THREE.Vector3(0, 8, 6));

      const cameraPos = new THREE.Vector3().addVectors(planeRef.current.position, followOffset);
      camera.position.lerp(cameraPos, 0.05);
      camera.lookAt(planeRef.current.position);

      setPath((prev) => [...prev.slice(-500), pos]);

      if (trailRef.current) {
        const behind = new THREE.Vector3()
          .copy(new THREE.Vector3(...pos))
          .add(followOffset.clone().normalize().multiplyScalar(-0.5));
        trailRef.current.position.copy(behind);
        trailRef.current.lookAt(new THREE.Vector3(...pos));
      }
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setHeading((h) => h - 0.05);
      if (e.key === 'ArrowRight') setHeading((h) => h + 0.05);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setHeading]);

  useEffect(() => {
    const pos = latLngToCartesian(lat, lng, radius);
    const near = checkpoints.find(cp => {
      const cpPos = latLngToCartesian(cp.lat, cp.lng, radius);
      const dx = cpPos[0] - pos[0];
      const dy = cpPos[1] - pos[1];
      const dz = cpPos[2] - pos[2];
      return Math.sqrt(dx * dx + dy * dy + dz * dz) < 0.5;
    });
    setActiveInfo(near?.id || null);
  }, [lat, lng]);

  return (
    <>
      <mesh ref={globeRef} castShadow receiveShadow>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      <primitive ref={planeRef} object={gltf.scene} scale={0.08} rotation={[0, 0, Math.PI / 2]} />

      <pointLight position={[0, 0.2, 0]} intensity={1} distance={2} color="red" />

      <mesh ref={trailRef}>
        <coneGeometry args={[0.05, 0.8, 8]} />
        <meshStandardMaterial color="white" transparent opacity={0.4} emissive="lightblue" />
      </mesh>

      {path.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.01, 6, 6]} />
          <meshBasicMaterial color="cyan" />
        </mesh>
      ))}

      {checkpoints.map(cp => {
        const cpPos = latLngToCartesian(cp.lat, cp.lng, radius);
        return (
          activeInfo === cp.id && (
            <Html key={cp.id} position={cpPos} center>
              <div style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                minWidth: '250px'
              }}>
                <h3>{cp.label}</h3>
                <p>{cp.content}</p>
              </div>
            </Html>
          )
        );
      })}
    </>
  );
}

useGLTF.preload('/models/airplane.glb');
