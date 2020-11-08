import { THREE } from "./lib/three.js";
import t from "./t.js";

export class Lines {
  constructor({ visionDist, segmentsCount }) {
    const lineGeometry = new THREE.Geometry();
    
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    const r = visionDist;
    const c = [0, 0];
    for (let i = 0; i < segmentsCount; i++) {
      const [x, y] = t.crt2xy(c, r, i / (segmentsCount - 1));
      lineGeometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, 0)
      );
    }

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

    lines.lineMaterial = lineMaterial;
    return lines;
  }
}