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
		//var time = Date.now() * 0.005;
		// sphere.rotation.z = 0.01 * time;
		// var geometry = sphere.geometry;
		// var attributes = geometry.attributes;
		
		// for ( var i = 0; i < attributes.size.array.length; i++ ) {
		// 	attributes.size.array[ i ] = 14 + 13 * Math.sin( 0.1 * i + time );
		// }
		
		//attributes.size.needsUpdate = true;
		this.renderer.render( this.scene, this.camera );
	}
	
	// allocPoints() {
	// 	var amount = 1;
	// 	var radius = 10;
		
	// 	var positions = new Float32Array( amount * 3 );
	// 	var colors = new Float32Array( amount * 3 );
	// 	var sizes = new Float32Array( amount );
		
	// 	var vertex = new THREE.Vector3();
	// 	var color = new THREE.Color( 0xffffff );
		
	// 	for ( var i = 0; i < amount; i ++ ) {
	// 		vertex.x = ( Math.random() * 2 - 1 ) * radius;
	// 		vertex.y = ( Math.random() * 2 - 1 ) * radius;
	// 		vertex.z = ( Math.random() * 2 - 1 ) * radius;
	// 		vertex.toArray( positions, i * 3 );
			
	// 		if ( vertex.x < 0 ) {
	// 			color.setHSL( 0.5 + 0.1 * ( i / amount ), 0.7, 0.5 );
	// 		} else {
	// 			color.setHSL( 0.0 + 0.1 * ( i / amount ), 0.9, 0.5 );
	// 		}
			
	// 		color.toArray( colors, i * 3 );
	// 		sizes[ i ] = 10;
	// 	}
		
	// 	var geometry = new THREE.BufferGeometry();
	// 	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	// 	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	// 	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		
	// 	var material = new THREE.ShaderMaterial( {
	// 		uniforms: {
	// 			amplitude: { value: 1.0 },
	// 			color:     { value: new THREE.Color( 0xffffff ) },
	// 			texture:   { value: new THREE.TextureLoader().load( "/sprites/spark1.png" ) }
	// 		},
	// 		vertexShader:   vertexshader,
	// 		fragmentShader: fragmentshader,
			
	// 		blending:       THREE.AdditiveBlending,
	// 		depthTest:      false,
	// 		transparent:    true
	// 	});
		
	// 	sphere = new THREE.Points( geometry, material );
	// 	this.scene.add(sphere);
	// }
	
	
	// allocLines() {
	// 	var segments = 10;
		
	// 	var geometry = new THREE.BufferGeometry();
	// 	var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
		
	// 	var positions = new Float32Array( segments * 3 );
	// 	var colors = new Float32Array( segments * 3 );
		
	// 	var r = 100;
		
	// 	for ( var i = 0; i < segments; i ++ ) {
	// 		var x = Math.random() * r - r / 2;
	// 		var y = Math.random() * r - r / 2;
	// 		var z = Math.random() * r - r / 2;
			
	// 		positions[ i * 3 ] = x;
	// 		positions[ i * 3 + 1 ] = y;
	// 		positions[ i * 3 + 2 ] = z;
			
	// 		colors[ i * 3 ] = ( x / r ) + 0.5;
	// 		colors[ i * 3 + 1 ] = ( y / r ) + 0.5;
	// 		colors[ i * 3 + 2 ] = ( z / r ) + 0.5;
	// 	}
		
	// 	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	// 	geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
	// 	geometry.computeBoundingSphere();
	// 	const lines = new THREE.Line( geometry, material );
		
	// 	this.scene.add(lines);
	// }
	
	createAgent() {
		// var radius = 10;
		
		// var positions = new Float32Array( 3 );
		// var colors = new Float32Array( 3 );
		// var sizes = new Float32Array( 1 );
		
		// var vertex = new THREE.Vector3(0, 0, 0);
		// var color = new THREE.Color( 0x34dd11 );
		
		// vertex.toArray( positions, 0 );
		
		// color.toArray( colors, 0 );
		// sizes[0] = 10;
		
		// var geometry = new THREE.BufferGeometry();
		// geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		// geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
		// geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
		
		// var material = new THREE.ShaderMaterial( {
		// 	uniforms: {
		// 		amplitude: { value: 1.0 },
		// 		color:     { value: new THREE.Color( 0xffffff ) },
		// 		texture:   { value: new THREE.TextureLoader().load( "/sprites/spark1.png" ) }
		// 	},
		// 	vertexShader:   vertexshader,
		// 	fragmentShader: fragmentshader,
			
		// 	blending:       THREE.AdditiveBlending,
		// 	depthTest:      false,
		// 	transparent:    true
		// });
		
		// const points = new THREE.Points( geometry, material );
		// this.scene.add(points);
		
		// // ===================================
		
		// // var segments = 10;
		
		// // var geometry = new THREE.BufferGeometry();
		// // var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
		
		// // const nn = 3;
		// // var positions = new Float32Array( segments * 3 );
		// // var colors = new Float32Array( segments * 3 );
		
		// // var r = 100;
		// // const c = [0, 0];
		
		
		// // for ( let i = 0; i < segments; i ++ ) {
		// // 	const [x, y] = t.crt2xy(c, 100,  i / (segments-1));
		// // 	// var x = Math.random() * r - r / 2;
		// // 	// var y = Math.random() * r - r / 2;
		// // 	// var z = Math.random() * r - r / 2;
		// // 	const z = 0
		// // 	positions[ i * nn + 0 ] = x;
		// // 	positions[ i * nn + 1 ] = y;
		// // 	positions[ i * nn + 2 ] = z;
		// // 	// positions[ i * nn + 3 ] = 0;
		// // 	// positions[ i * nn + 4 ] = 0;
		// // 	// positions[ i * nn + 5 ] = 0;
			
		// // 	// colors[ i * 3 ] = 0;
		// // 	// colors[ i * 3 ] = 0;
		// // 	// colors[ i * 3 ] = 0;
		// // 	colors[ i * 3 ] = ( x / r ) + 0.5;
		// // 	colors[ i * 3 + 1 ] = ( y / r ) + 0.5;
		// // 	colors[ i * 3 + 2 ] = ( z / r ) + 0.5;
		// // }
		
		// // geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		// // geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
		// // //geometry.computeBoundingSphere();
		// // const lines = new THREE.Line( geometry, material );
		
		// // this.scene.add(lines);
		
		// // =======================
		
		// var segments = 10;
		
		// var geometry = new THREE.Geometry();
		// var material = new THREE.LineBasicMaterial({ color: 0xffffff });
		
		// var r = VISION_DIST;
		// const c = [0, 0];
		// for ( let i = 0; i < segments; i ++ ) {
		// 	const [x, y] = t.crt2xy(c, r,  i / (segments-1));
		// 	geometry.vertices.push(
		// 		new THREE.Vector3( 0, 0, 0 ),
		// 		new THREE.Vector3( x, y, 0 ),
		// 	);
		// }
		
		// const lines = new THREE.LineSegments( geometry, material );
		// this.scene.add(lines);
		
		// return {points, lines}
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
		
		for (let i = 0; i < 10; i += 2) {
			this.steps.geometry.attributes.position.array[i * 3 + 1] -= 0.1;
			this.steps.geometry.attributes.position.array[i * 3 + 4] -= 0.1;
			
			if (this.steps.geometry.attributes.position.array[i * 3 + 1] < -100) {
				this.steps.geometry.attributes.position.array[i * 3 + 1] = 100;
				this.steps.geometry.attributes.position.array[i * 3 + 4] = 100;
			}
		}
		
		this.steps.geometry.attributes.position.needsUpdate = true;
	}
}

export default World;