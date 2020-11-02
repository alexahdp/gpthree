"use strict";

import { THREE } from "./lib/three.js";
import times from "./lib/lodash/times.js";
import RL from "./lib/rl.js";
import t from "./t.js";
const VISION_DIST = 50;

const vertexshader = `
	uniform float amplitude;
	attribute float size;
	attribute vec3 customColor;
	varying vec3 vColor;
	varying float pSize;
	
	void main() {
		vColor = customColor;
		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
		gl_PointSize = size * ( 300.0 / -mvPosition.z );
		gl_Position = projectionMatrix * mvPosition;
		pSize = gl_PointSize;
	}
`;

const fragmentshader = `
	uniform vec3 color;
	uniform sampler2D texture;
	varying vec3 vColor;
	varying float pSize;
	
	void main() {
		//gl_FragColor = vec4( color * vColor, 1.0 );
		//gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
		
		vec3 N;
		N.xy = gl_PointCoord.xy*vec2(2.0, -2.0) + vec2(-1.0, 1.0);
		float mag = dot(N.xy, N.xy);
		if (mag > 1.0) discard;
		gl_FragColor = vec4( 1,1,1,1.0 - mag );
		if ( ( pSize - mag * pSize ) > 4.0 ) discard;
		gl_FragColor = vec4( vColor, 1.0 );
	}
`;

const spec = {};
spec.update = "qlearn"; // qlearn | sarsa
spec.gamma = 0.9; // discount factor, [0, 1)
spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
spec.alpha = 0.005; // value function learning rate
spec.experience_add_every = 5; // number of time steps before we add another experience to replay memory
spec.experience_size = 10000; // size of experience
spec.learning_steps_per_iteration = 5;
spec.tderror_clamp = 1.0; // for robustness
spec.num_hidden_units = 100; // number of neurons in hidden layer

const N = 20; // количество глаз

export class Agent {
  constructor(o) {
    this.scene = o.scene;
    const positions = new Float32Array(3);
    const colors = new Float32Array(3);
    const sizes = new Float32Array(1);

    const vertex = new THREE.Vector3(0, 0, 0);
    const color = new THREE.Color(0x34dd11);

    vertex.toArray(positions, 0);

    color.toArray(colors, 0);
    sizes[0] = 10;

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.addAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    pointGeometry.addAttribute(
      "customColor",
      new THREE.BufferAttribute(colors, 3)
    );
    pointGeometry.addAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const pointMaterial = new THREE.ShaderMaterial({
      uniforms: {
        amplitude: { value: 1.0 },
        // color: { value: new THREE.Color(0xffffff) },
        // texture: {
        //   value: new THREE.TextureLoader().load("/sprites/spark1.png"),
        // },
      },
      vertexShader: vertexshader,
      fragmentShader: fragmentshader,

      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    const points = new THREE.Points(pointGeometry, pointMaterial);
    o.scene.add(points);

    const segments = 30;
    this.eyes = segments;

    this.energy = 1;

    const lineGeometry = new THREE.Geometry();
    
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    this.lineMaterial = lineMaterial;

    const r = VISION_DIST;
    const c = [0, 0];
    for (let i = 0; i < segments; i++) {
      const [x, y] = t.crt2xy(c, r, i / (segments - 1));
      lineGeometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, 0)
      );
    }

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    o.scene.add(lines);

    this.vel = { x: 0, y: 0 };
    this.points = points;
    this.lines = lines;

    this.reward_bonus = 0.0; // эта шняга никак не используется - почему???
    this.digestion_signal = 0.0;

    this.sensorDirections = times(N).map((i) => {
      const [x, y] = t.crt2xy(c, 50, i / (N - 1));
      return new THREE.Vector3(x, y, 0).normalize();
    });

    // this.num_states = N * 2;
    this.num_states = 4;
    this.actions = [0, 1, 2, 4, 5]; // влево, вправо, вниз, вверх, на месте
    this.actionsMap = [0, -0.5, 0.5];

    this.brain = new RL.DQNAgent(this, spec); // give agent a TD brain

    this.vel.x = 2;
    this.vel.y = 2;
  }

  destroy() {
    const linesObject = this.scene.getObjectByProperty( 'uuid', this.lines.uuid );
    linesObject.geometry.dispose();
    linesObject.material.dispose();
    this.scene.remove( linesObject );
    const pointsObject = this.scene.getObjectByProperty( 'uuid', this.points.uuid );
    pointsObject.geometry.dispose();
    pointsObject.material.dispose();
    this.scene.remove( pointsObject );
  }

  getNumStates() {
    return this.num_states;
  }

  getMaxNumActions() {
    return this.actions.length;
  }

  setVel(direction) {
    this.vel.x = direction;
  }

  setPosition(x, y) {
    this.points.position.x = x;
    this.points.position.y = y;
    this.lines.position.x = x;
    this.lines.position.y = y;
    // this.points.position.needsUpdate = true
  }

  move(action) {
    if (action === 0 && this.points.position.x < 250) {
      this.points.position.x += this.vel.x * this.energy;
      this.lines.position.x += this.vel.x * this.energy;
      this.points.position.needsUpdate = true;
    } else if (action === 1 && this.points.position.x > -250) {
      this.points.position.x -= this.vel.x * this.energy;
      this.lines.position.x -= this.vel.x * this.energy;
      this.points.position.needsUpdate = true;
    } else if (action === 2 && this.points.position.y < 200) {
      this.points.position.y += this.vel.y * this.energy;
      this.lines.position.y += this.vel.y * this.energy;
      this.points.position.needsUpdate = true;
    } else if (action === 3 && this.points.position.y > -200) {
      this.points.position.y -= this.vel.y * this.energy;
      this.lines.position.y -= this.vel.y * this.energy;
      this.points.position.needsUpdate = true;
    } else if (action === 4) {
      // do nothing
    } else {
      // console.log('no action');
    }

    this.energy -= 0.001;
    if (this.energy < 0) this.energy = 0;
    const col = t.t2rgb(this.energy);
    this.lineMaterial.color.r = col[0] / 255;
    this.lineMaterial.color.g = col[1] / 255;
    this.lineMaterial.color.b = col[2] / 255;
  }

  checkSensors(sphere) {
    const raycaster = new THREE.Raycaster(
      this.points.position,
      new THREE.Vector3(0, 0, 0)
    );
    raycaster.far = VISION_DIST;

    const vision = this.sensorDirections.map((direction) => {
      raycaster.set(this.points.position, direction);
      const intersect = raycaster.intersectObject(sphere, true);
      return intersect.length > 0 ? intersect[0] : null;
    });

    return vision.map((v) =>
      v ? { x: v.object.position.x, y: v.object.position.y, v } : null
    );
  }

  getAction(vision) {
    return this.brain.act(vision);
  }

  learn(r) {
    this.brain.learn(r);
  }
}
