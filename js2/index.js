import { THREE } from "./lib/three.js";
import Stats from "./lib/stats.min.js";
import { Agent } from './agent.js'
import { Sphere } from './sphere.js'
import { Env } from './env.js'

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

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
const food = [];
for (let i = 0; i < 5; i++) {
  food.push(new Sphere({ scene }));
}

const env = new Env({
  scene,
  agent,
  food,
})

const cheatSteps = 4;
(function animate() {
  for (let i = 0; i < cheatSteps; i++) {
    const s1 = env.getState();

    const action = agent.getAction([
      s1.x,
      s1.y,
      ...s1.vision.map(v => v ? [1, v.x, v.y] : [0, 0, 0]).flat(),
    ]);
    agent.move(action);

    const s2 = env.getState();
    const r = env.computeReward(s1, s2)
    agent.learn(r);
    food.forEach(foodItem => foodItem.move());

    renderer.render(scene, camera);
    stats.update();
  }
  
  requestAnimationFrame(animate);
})();
