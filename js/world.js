'use strict';

import * as THREE from './lib/three';
import * as Stats from './lib/stats.min';

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	this.renderer.setSize( window.innerWidth, window.innerHeight );
}


class World {
	constructor() {
		this.camera = new THREE.PerspectiveCamera( 40, WIDTH / HEIGHT, 1, 10000 );
		this.camera.position.z = 300;
		
		this.scene = new THREE.Scene();
		
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( WIDTH, HEIGHT );
		
		var container = document.getElementById( 'container' );
		container.appendChild( this.renderer.domElement );
		
		this.stats = new Stats();
		container.appendChild( this.stats.dom );
		
		window.addEventListener( 'resize', onWindowResize, false );
	}
	
	init() {
	}
	
	animate(cb) {
		//requestAnimationFrame(() => this.animate(cb));
		setTimeout(() => this.animate(cb), 0);
		cb.call(this);
		this.render();
		this.stats.update();
	}
	
	render() {
		this.renderer.render( this.scene, this.camera );
	}
	
	createAgent() {
	}
	
	getSide(y) {
		const leftBound = -50;
		const rightBound = 0;
		const width = 60;
		
		if (Math.random() >= 0.5) {
			return [
				new THREE.Vector3(leftBound, y, 0),
				new THREE.Vector3(leftBound + width, y, 0)
			];
		} else {
			return [
				new THREE.Vector3(rightBound, y, 0),
				new THREE.Vector3(rightBound + width, y, 0)
			];
		}
	};
	
	
	get STEP() {
		return 40;
	}
	
	
	createSteps() {
		var segments = 10;
		let y = 150;
		
		const positions = new Float32Array(segments * 3 * 2);
		
		for ( let i = 0; i < segments; i+=2 ) {
			const [a, b] = this.getSide(y);
			
			positions[i * 3 + 0] = a.x;
			positions[i * 3 + 1] = a.y;
			positions[i * 3 + 2] = a.z;
			positions[i * 3 + 3] = b.x;
			positions[i * 3 + 4] = b.y;
			positions[i * 3 + 5] = b.z;
			
			y += this.STEP;
		}
		
		var geometry = new THREE.BufferGeometry();
		
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setDynamic( true ) );
		
		var material = new THREE.LineBasicMaterial({
			color: 0xffffff,
			transparent: true
		});
		
		const lines = new THREE.LineSegments(geometry, material);
		this.scene.add(lines);
		
		this.steps = lines;
	}
	
	
	moveSteps() {
		// двигаем ступени вниз
		// если ступень зашла слишком низко - поднимаем ее вверх
		let minPointers = []
		let maxVal = 0;
		let collision = false;
		
		for (let i = 0; i < 10; i += 2) {
			let above = this.agent.points.position.y <= this.steps.geometry.attributes.position.array[i * 3 + 1];
			
			this.steps.geometry.attributes.position.array[i * 3 + 1] -= 0.1;
			this.steps.geometry.attributes.position.array[i * 3 + 4] -= 0.1;
			
			const agentPos = [
				this.agent.points.position.x,
				this.agent.points.position.y
			];
			
			const stepPos = [
				this.steps.geometry.attributes.position.array[i * 3 + 0],
				this.steps.geometry.attributes.position.array[i * 3 + 1],
				this.steps.geometry.attributes.position.array[i * 3 + 3],
				this.steps.geometry.attributes.position.array[i * 3 + 4]
			];
			
			let beyond = this.agent.points.position.y >= this.steps.geometry.attributes.position.array[i * 3 + 1];
			
			if (above && beyond && agentPos[0] >= stepPos[0] && agentPos[0] <= stepPos[2]) {
				this.steps.geometry.attributes.position.array[i * 3 + 1] = 100;
				this.steps.geometry.attributes.position.array[i * 3 + 4] = 100;
				collision = true;
				console.log('collision');
			}
			
			if (this.steps.geometry.attributes.position.array[i * 3 + 1] < -100) {
				this.steps.geometry.attributes.position.array[i * 3 + 1] = 100;
				this.steps.geometry.attributes.position.array[i * 3 + 4] = 100;
				console.log('omit');
			}
		}
		
		this.steps.geometry.attributes.position.needsUpdate = true;
		
		return collision;
	}
}

export default World;