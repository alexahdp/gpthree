import { THREE } from "./lib/three.js";
import Stats from "./lib/stats.min.js";
import { Agent } from './agent.js'
import { Sphere } from './sphere.js'

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

const camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 1, 10000);
camera.position.z = 300;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(WIDTH, HEIGHT);

const container = document.getElementById("container");
container.appendChild(renderer.domElement);

const stats = new Stats();
container.appendChild(stats.dom);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);

const agent = new Agent({ scene });
const sphere = new Sphere({ scene });
sphere.prevPos = {
  x: sphere.sphere.position.x,
  y: sphere.sphere.position.y,
};
const env = {
  prevPos: {
    x: agent.points.position.x,
    y: agent.points.position.y,
  },
  prevD: 0,
  getState() {
    return [
      sphere.sphere.position.x,
      sphere.sphere.position.y,
      agent.points.position.x,
      agent.points.position.y
    ];
    // return [agent.points.position.x, agent.points.position.y];
  },
  computeReward(s1, s2) {
    const d1 = Math.sqrt((s1[0] - s1[2]) **2 + (s1[1] - s1[3]) **2);
    const d2 = Math.sqrt((s2[0] - s2[2]) **2 + (s2[1] - s2[3]) **2);
    return d2 < d1 ? 1 : 0;
  },
  computeReward1() {
    const d = Math.sqrt((agent.points.position.x - this.prevPos.x) **2 + 
      (agent.points.position.y - this.prevPos.y) **2);
    this.prevPos.x = agent.points.position.x;
    this.prevPos.y = agent.points.position.y;
    return d;
  }
};
const cheatSteps = 5;
(function animate() {
  for (let i = 0; i < cheatSteps; i++) {
    const state = env.getState();
    const action = agent.getAction(state);
    // var obs = env.sampleNextState(action);
    const s1 = env.getState();
    agent.move(action);
    const s2 = env.getState();
    const r = env.computeReward(s1, s2)
    agent.learn(r);

    // const vision = agent.checkSensors(sphere.sphere);
    // const act = agent.getAction(vision);
    
    // agent.vel.x = agent.actionsMap[act];

    renderer.render(scene, camera);
    stats.update();
    
    sphere.move();
    agent.move();
  }

//  renderer.render(scene, camera);
//  stats.update();
//  const vision = agent.checkSensors(sphere.sphere);
  
  requestAnimationFrame(animate);
})();
