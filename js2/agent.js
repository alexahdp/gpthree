'use strict';

import { THREE } from "./lib/three.js";
import times from './lib/lodash/times.js';
import RL from './lib/rl.js';
import t from './t.js';
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

const spec = {}
spec.update = 'qlearn'; // qlearn | sarsa
spec.gamma = 0.9; // discount factor, [0, 1)
spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
spec.alpha = 0.005; // value function learning rate
spec.experience_add_every = 5; // number of time steps before we add another experience to replay memory
spec.experience_size = 10000; // size of experience
spec.learning_steps_per_iteration = 5;
spec.tderror_clamp = 1.0; // for robustness
spec.num_hidden_units = 100 // number of neurons in hidden layer

const N = 20; // количество глаз

export class Agent {
	constructor(o) {
		var radius = 10;
		
		var positions = new Float32Array( 3 );
		var colors = new Float32Array( 3 );
		var sizes = new Float32Array( 1 );
		
		var vertex = new THREE.Vector3(0, 0, 0);
		var color = new THREE.Color( 0x34dd11 );
		
		vertex.toArray( positions, 0 );
		
		color.toArray( colors, 0 );
		sizes[0] = 10;
		
		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
		geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		
		var material = new THREE.ShaderMaterial( {
			uniforms: {
				amplitude: { value: 1.0 },
				color:     { value: new THREE.Color( 0xffffff ) },
				texture:   { value: new THREE.TextureLoader().load( "/sprites/spark1.png" ) }
			},
			vertexShader:   vertexshader,
			fragmentShader: fragmentshader,
			
			blending:       THREE.AdditiveBlending,
			depthTest:      false,
			transparent:    true
		});
		
		const points = new THREE.Points( geometry, material );
		o.scene.add(points);
		
		var segments = 30;
		
		var geometry = new THREE.Geometry();
		var material = new THREE.LineBasicMaterial({ color: 0xffffff });
		
		var r = VISION_DIST;
		const c = [0, 0];
		for ( let i = 0; i < segments; i ++ ) {
			const [x, y] = t.crt2xy(c, r,  i / (segments-1));
			geometry.vertices.push(
				new THREE.Vector3( 0, 0, 0 ),
				new THREE.Vector3( x, y, 0 ),
			);
		}
		
		const lines = new THREE.LineSegments( geometry, material );
		o.scene.add(lines);
		
		this.vel = {x: 0, y: 0};
		this.points = points;
		this.lines = lines;
		
		//const c = [this.points.position.x, this.points.position.y];
		
		this.reward_bonus = 0.0; // эта шняга никак не используется - почему???
		this.digestion_signal = 0.0;
		
		this.sensorDirections = times(N).map(i => {
			const [x, y] = t.crt2xy(c, 50, i / (N-1));
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
	
	getNumStates() {
		// this.num_states = this.eyes.length * VARITY + 2;
		return this.num_states;
	}
	
	getMaxNumActions() {
		return this.actions.length;
	}
	
	setVel(direction) {
		this.vel.x = direction;
	}
	
	
	move(action) {
    if (action === 0 && this.points.position.x < 250) {
      this.points.position.x += this.vel.x;
      this.lines.position.x += this.vel.x;
		  this.points.position.needsUpdate = true
    }
    else if (action === 1 && this.points.position.x > -250) {
      this.points.position.x -= this.vel.x;
      this.lines.position.x -= this.vel.x;
		  this.points.position.needsUpdate = true
    }
    else if (action === 2 && this.points.position.y < 200) {
      this.points.position.y += this.vel.y;
      this.lines.position.y += this.vel.y;
		  this.points.position.needsUpdate = true
    }
    else if (action === 3 && this.points.position.y > -200) {
      this.points.position.y -= this.vel.y;
      this.lines.position.y -= this.vel.y;
		  this.points.position.needsUpdate = true
    }
    else if (action === 4) {
      // do nothing
    }
    else {
      // console.log('no action');
    }
		// this.lines.position.x += this.vel.x;
		// this.lines.position.needsUpdate = true
	}
	
	checkSensors(sphere) {
		const raycaster = new THREE.Raycaster(
			this.points.position,
			new THREE.Vector3(0, 0, 0)
		);
		raycaster.far = VISION_DIST;
		
		const vision = this.sensorDirections.map(direction => {
			raycaster.set(this.points.position, direction);
			//return raycaster.intersectObject(this.world.steps, true).length > 0 ? 1 : 0;
			const intersect = raycaster.intersectObject(sphere, true);
			// if (intersect.length > 0) {
			// 	console.log(intersect);
			// }
			return intersect.length > 0 ? intersect[0] : null;
		});
		
		this.prevVision = this.vision;
    this.vision = vision;
    // vision[i].object.position
    // console.log(vision)

    return vision.map(v => v ? ({ x: v.object.position.x, y: v.object.position.y, v }) : null);
	}
	
	
	getAction(vision) {
		return this.brain.act(vision);
  }
  
  learn(r) {
    this.brain.learn(r);
  }
	
	
	backward(fit) {
		//agent.digestion_signal += fit;
		//var reward = fit;
		this.last_reward = fit;
		this.digestion_signal = fit
		this.brain.learn(fit);
	}
}
