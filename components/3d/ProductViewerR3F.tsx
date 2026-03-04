"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

interface ProductViewerR3FProps {
  modelUrl: string;
}

function ProductModel({ modelUrl }: { modelUrl: string }) {
  // GLTF is loaded lazily; in production you may want to prefetch or cache.
  const gltf = useGLTF(modelUrl);
  return <primitive object={gltf.scene} dispose={null} />;
}

export function ProductViewerR3F({ modelUrl }: ProductViewerR3FProps) {
  return (
    <Canvas
      camera={{ position: [2.4, 1.6, 2.4], fov: 40 }}
      className="h-full w-full rounded-2xl bg-black/90"
    >
      <color attach="background" args={["#050507"]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        intensity={1.1}
        position={[4, 6, 4]}
      />
      <Suspense fallback={null}>
        <ProductModel modelUrl={modelUrl} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.15}
        maxPolarAngle={Math.PI / 1.9}
        minDistance={1.4}
        maxDistance={4}
      />
    </Canvas>
  );
}

// Allow Next.js to tree-shake GLTF preloading where components are unused.
useGLTF.preload("/models/sculpted-lounge.glb");

export default ProductViewerR3F;

