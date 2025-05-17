import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function GlobeDot() {
    const { camera } = useThree();
    const dot = useRef<THREE.Mesh>(null!);
    const radius = 5, altitude = 1, speed = 0.1;

    // position and forward vector
    const pos = useRef(new THREE.Vector3(radius + altitude, 0, 0));
    const dir = useRef(new THREE.Vector3(0, 0, 1));

    useFrame(() => {
        // advance and reproject onto sphere
        pos.current.add(dir.current.clone().normalize().multiplyScalar(speed));
        pos.current.normalize().multiplyScalar(radius + altitude);
        dot.current.position.copy(pos.current);

        // camera follow
        const camOff = new THREE.Vector3(0, 2, 5).applyQuaternion(dot.current.quaternion);
        const desired = pos.current.clone().add(camOff);
        camera.position.lerp(desired, 0.1);
        camera.lookAt(pos.current);
    });

    return (
        <mesh ref={dot}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="green" />
        </mesh>
    );
}
