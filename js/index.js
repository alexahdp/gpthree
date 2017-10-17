'use strict';
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var sphere;
var noise = [];
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

const t = {
	FI: (Math.sqrt(5) - 1) / 2,
	
	
	xyp( f , t ) {
		return [ f[0] + t[0], f[1] + t[1] ]
	},
	
	// удобные функции для проекции единичного отрезка
	// в окружность произвольного радиуса
	cos: function(angle){ return Math.cos(angle * 2 * Math.PI); },
	sin: function(angle){ return Math.sin(angle * 2 * Math.PI); },
	
	crt2xy: function(c,r,a) {
		return [
			c[0] + this.cos(a) * r,
			c[1] + this.sin(a) * r,
		];
	},
}



// function cri2xy( c, rr, i ) {
// 	if (i == 0) return xyp( c, [ rr, 0 ] );
	
// 	var r = Math.sqrt( i ) * FI * rr * 2;
// 	return this.crt2xy( c, r, Fi * i );
// }

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
		requestAnimationFrame(() => this.animate(cb));
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
	
	allocPoints() {
		var amount = 1;
		var radius = 10;
		
		var positions = new Float32Array( amount * 3 );
		var colors = new Float32Array( amount * 3 );
		var sizes = new Float32Array( amount );
		
		var vertex = new THREE.Vector3();
		var color = new THREE.Color( 0xffffff );
		
		for ( var i = 0; i < amount; i ++ ) {
			vertex.x = ( Math.random() * 2 - 1 ) * radius;
			vertex.y = ( Math.random() * 2 - 1 ) * radius;
			vertex.z = ( Math.random() * 2 - 1 ) * radius;
			vertex.toArray( positions, i * 3 );
			
			if ( vertex.x < 0 ) {
				color.setHSL( 0.5 + 0.1 * ( i / amount ), 0.7, 0.5 );
			} else {
				color.setHSL( 0.0 + 0.1 * ( i / amount ), 0.9, 0.5 );
			}
			
			color.toArray( colors, i * 3 );
			sizes[ i ] = 10;
		}
		
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
		
		sphere = new THREE.Points( geometry, material );
		this.scene.add(sphere);
	}
	
	
	allocLines() {
		var segments = 10;
		
		var geometry = new THREE.BufferGeometry();
		var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
		
		var positions = new Float32Array( segments * 3 );
		var colors = new Float32Array( segments * 3 );
		
		var r = 100;
		
		for ( var i = 0; i < segments; i ++ ) {
			var x = Math.random() * r - r / 2;
			var y = Math.random() * r - r / 2;
			var z = Math.random() * r - r / 2;
			
			positions[ i * 3 ] = x;
			positions[ i * 3 + 1 ] = y;
			positions[ i * 3 + 2 ] = z;
			
			colors[ i * 3 ] = ( x / r ) + 0.5;
			colors[ i * 3 + 1 ] = ( y / r ) + 0.5;
			colors[ i * 3 + 2 ] = ( z / r ) + 0.5;
		}
		
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
		geometry.computeBoundingSphere();
		const lines = new THREE.Line( geometry, material );
		
		this.scene.add(lines);
	}
	
	createAgent() {
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
		this.scene.add(points);
		
		// ===================================
		
		// var segments = 10;
		
		// var geometry = new THREE.BufferGeometry();
		// var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
		
		// const nn = 3;
		// var positions = new Float32Array( segments * 3 );
		// var colors = new Float32Array( segments * 3 );
		
		// var r = 100;
		// const c = [0, 0];
		
		
		// for ( let i = 0; i < segments; i ++ ) {
		// 	const [x, y] = t.crt2xy(c, 100,  i / (segments-1));
		// 	// var x = Math.random() * r - r / 2;
		// 	// var y = Math.random() * r - r / 2;
		// 	// var z = Math.random() * r - r / 2;
		// 	const z = 0
		// 	positions[ i * nn + 0 ] = x;
		// 	positions[ i * nn + 1 ] = y;
		// 	positions[ i * nn + 2 ] = z;
		// 	// positions[ i * nn + 3 ] = 0;
		// 	// positions[ i * nn + 4 ] = 0;
		// 	// positions[ i * nn + 5 ] = 0;
			
		// 	// colors[ i * 3 ] = 0;
		// 	// colors[ i * 3 ] = 0;
		// 	// colors[ i * 3 ] = 0;
		// 	colors[ i * 3 ] = ( x / r ) + 0.5;
		// 	colors[ i * 3 + 1 ] = ( y / r ) + 0.5;
		// 	colors[ i * 3 + 2 ] = ( z / r ) + 0.5;
		// }
		
		// geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		// geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
		// //geometry.computeBoundingSphere();
		// const lines = new THREE.Line( geometry, material );
		
		// this.scene.add(lines);
		
		var segments = 10;
		
		var geometry = new THREE.Geometry();
		var material = new THREE.LineBasicMaterial({ color: 0xffffff });
		
		var r = 50;
		const c = [0, 0];
		for ( let i = 0; i < segments; i ++ ) {
			const [x, y] = t.crt2xy(c, r,  i / (segments-1));
			geometry.vertices.push(
				new THREE.Vector3( 0, 0, 0 ),
				new THREE.Vector3( x, y, 0 ),
			);
		}
		
		const lines = new THREE.LineSegments( geometry, material );
		this.scene.add(lines);
		
		return {points, lines}
	}
	
	getSide(y) {
		const leftBound = -50;
		const rightBound = 50;
		const width = 50;
		
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
		return 10;
	}
	
	createSteps() {
		var segments = 10;
		
		var geometry = new THREE.Geometry();
		geometry.dynamic = true;
		var material = new THREE.LineBasicMaterial({
			color: 0xffffff,
		});
		
		
		
		let y = 0;
		
		for ( let i = 0; i < segments; i ++ ) {
			const [a, b] = this.getSide(y);
			geometry.vertices.push(a, b);
			
			y += this.STEP;
		}
		
		const lines = new THREE.LineSegments(geometry, material);
		this.scene.add(lines);
		
		this.steps = lines;
		//return lines;
		//console.log(lines)
	}
	
	
	moveSteps() {
		// двигаем ступени вниз
		// если ступень зашла слишком низко - поднимаем ее вверх
		let minPointers = []
		let maxVal = 0;
		
		// хер знает как правильно итерировать линии...
		for (let i = 0; i < this.steps.geometry.vertices.length; i += 2) {
			const start = this.steps.geometry.vertices[i];
			const end = this.steps.geometry.vertices[i + 1];
			
			start.y -= 0.1;
			end.y -= 0.1;
			
			if (start.y < -100) minPointers.push({start, end});
			
			if (start.y > maxVal) {
				maxVal = start.y;
			}
		}
		
		if (minPointers.length > 0) {
			minPointers.forEach(({start, end}) => {
				start.y = maxVal + this.STEP;
				end.y = maxVal + this.STEP;
				
				const [a, b] = this.getSide(start.y);
				start.x = a.x;
				start.y = a.y;
				
				end.x = b.x;
				end.y = b.y;
			});
			minPointers = [];
		}
		
		this.steps.geometry.verticesNeedUpdate = true;
	}
}

class Agent {
	constructor(o) {
		this.vel = {x: 0, y: 0};
		this.points = o.points;
		this.lines = o.lines;
	}
	
	setVel(direction) {
		this.vel.x = direction;
	}
	
	move() {
		this.points.position.x += this.vel.x;
		this.points.position.needsUpdate = true
		
		this.lines.position.x += this.vel.x;
		this.lines.position.needsUpdate = true
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	this.renderer.setSize( window.innerWidth, window.innerHeight );
}


const world = new World();
const borders = world.createSteps();
const agent = new Agent(world.createAgent());


let keyPressed = false;
document.addEventListener('keydown', e => {
	if (e.which == 37) {
		agent.setVel(-0.5);
	}
	else if (e.which == 39) {
		agent.setVel(0.5);
	}
});

document.addEventListener('keyup', e => {
	agent.setVel(0);
});

world.animate(() => {
	agent.move();
	world.moveSteps();
});