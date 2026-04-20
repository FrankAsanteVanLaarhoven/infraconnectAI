import URDFLoader from "urdf-loader";
import * as THREE from "three";

/**
 * The physical execution binder wrapping abstract humanoid mappings natively rendering over StandardMaterials.
 */
export async function loadURDF(url: string) {
  return new Promise((resolve, reject) => {
    try {
        const loader = new URDFLoader();

        loader.load(url, (robot: any) => {
          robot.traverse((child: any) => {
            if (child instanceof THREE.Mesh) {
              child.material = new THREE.MeshPhysicalMaterial({
                color: "#4CC9F0",
                metalness: 0.9,
                roughness: 0.2,
                emissive: "#0ff",
                emissiveIntensity: 0.2,
              });
            }
          });
          resolve(robot);
        });
    } catch (e) {
        // Bypass geometry bounds tracking explicit mocks if physical URL fails
        console.warn("[URDF] Native URL missing. Mocking standard cylinder mapping natively.", e);
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
        const material = new THREE.MeshStandardMaterial({ color: "#4CC9F0" });
        resolve(new THREE.Mesh(geometry, material));
    }
  });
}
