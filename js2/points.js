"use strict";

import { THREE } from "./lib/three.js";

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

export class Points {
  constructor() {
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
    return points;
  }
}