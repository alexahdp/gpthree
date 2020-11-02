import { THREE } from "./lib/three.js";

export class Sphere {
  constructor({ scene }) {
    const geometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    this.sphere = new THREE.Mesh( geometry, material );
    this.sphere.vel = {
      x: 0.7,
      y: 0.5,
    };
    this.sphere.position.x = 50;
    this.sphere.position.y = 0;
    scene.add( this.sphere );
  }

  move() {
    this.sphere.position.x += this.sphere.vel.x;
    this.sphere.position.y += this.sphere.vel.y;

    if (this.sphere.position.y > 100) {
      this.sphere.vel.y = - this.sphere.vel.y;
    }
    else if (this.sphere.position.y < -100) {
      this.sphere.vel.y = - this.sphere.vel.y;
    }
    if (this.sphere.position.x > 250) {
      this.sphere.vel.x = - this.sphere.vel.x;
    }
    else if (this.sphere.position.x < -250) {
      this.sphere.vel.x = - this.sphere.vel.x;
    }
  }
}
