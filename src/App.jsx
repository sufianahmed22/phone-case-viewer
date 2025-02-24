import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three"; // Import THREE for bounding box calculations

const useResponsiveSettings = () => {
  const { camera } = useThree();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const updateSettings = () => {
      setScreenWidth(window.innerWidth);

      if (window.innerWidth > 1200) {
        camera.position.set(0, 0, 1); // Closer zoom-in for desktops
      } else if (window.innerWidth > 768) {
        camera.position.set(0, 0, 1); // Slightly farther for tablets
      } else {
        camera.position.set(0, 0, 2); // More space for mobile screens
      }
    };

    window.addEventListener("resize", updateSettings);
    updateSettings();

    return () => window.removeEventListener("resize", updateSettings);
  }, [camera]);

  return screenWidth;
};

const PhoneCase = () => {
  const { scene } = useGLTF("/phone_case.glb");
  const texture = useTexture("/texture.jpg");
  const [boundingBoxSize, setBoundingBoxSize] = useState(1);
  const screenWidth = useResponsiveSettings();

  useEffect(() => {
    if (!scene) return;

    // Apply texture to all meshes
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.map = texture;
        child.material.needsUpdate = true;
      }
    });

    // Calculate bounding box for proper scaling
    const bbox = new THREE.Box3().setFromObject(scene);
    const size = bbox.getSize(new THREE.Vector3()).length();
    setBoundingBoxSize(size || 1);
  }, [scene, texture]);

  // Adjust model scale
  const scaleFactor = 5 / boundingBoxSize; // Normalize scale
  const scale = screenWidth > 1200 ? [scaleFactor, scaleFactor, scaleFactor] 
               : screenWidth > 768 ? [scaleFactor * 0.9, scaleFactor * 0.9, scaleFactor * 0.9] 
               : [scaleFactor * 0.8, scaleFactor * 0.8, scaleFactor * 0.8];

  return <primitive object={scene} scale={scale} />;
};

const App = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#f5f5f5" }}>
      <Canvas camera={{ position: [0, 0, 1] }}> 
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <PhoneCase />
        </Suspense>
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default App;
