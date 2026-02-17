import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

function Particles({ count = 2000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);


  const [positions] = useState(() => {
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      array[i * 3] = (Math.random() - 0.5) * 10;
      array[i * 3 + 1] = (Math.random() - 0.5) * 10;
      array[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    return array;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y =
        state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#3b82f6" />
    </points>
  );
}

export default function ThreeBackground() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
      }}
    >
      <ambientLight />
      <Particles count={2000} />
    </Canvas>
  );
}
