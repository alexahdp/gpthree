"use strict";

import { THREE } from "./lib/three.js";
import t from "./t.js";

export class Sphere {
  vel = {
    x: Math.random() - 0.5,
    y: Math.random() - 0.5,
  }
  constructor({ scene }) {
    this.scene = scene;
    const geometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
    const material = new THREE.MeshBasicMaterial( {color: t.t2rgb(0.8).toString()} );
    
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh._parent = this;
    this.mesh.position.x = 50;
    this.mesh.position.y = 0;
    this.scene.add( this.mesh );
  }

  destroy() {
    const object = this.scene.getObjectByProperty( 'uuid', this.mesh.uuid );
    object.geometry.dispose();
    object.material.dispose();
    this.scene.remove( object );
  }

  move() {
    this.mesh.position.x += this.vel.x;
    this.mesh.position.y += this.vel.y;

    if (this.mesh.position.y > 100) {
      this.vel.y = - this.vel.y;
    }
    else if (this.mesh.position.y < -100) {
      this.vel.y = - this.vel.y;
    }
    if (this.mesh.position.x > 250) {
      this.vel.x = - this.vel.x;
    }
    else if (this.mesh.position.x < -250) {
      this.vel.x = - this.vel.x;
    }
  }
}
