import { THREE } from "./lib/three.js";
import Stats from "./lib/stats.min.js";
import { Agent } from "./agent.js";
import { Sphere } from "./sphere.js";
import { Env } from "./env.js";

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

// ==================
const AGENTS_COUNT = 5;
const FOOD_START_COUNT = 15;
const FOOD_APPEAR_INTERVAL = 1000;

const agents = [];
for (let i = 0; i < AGENTS_COUNT; i++) {
  const agent = new Agent({ scene });
  agent.setPosition(Math.random() * 200 - 100, Math.random() * 200 - 100);
  agents.push(agent);
}

const food = [];
for (let i = 0; i < FOOD_START_COUNT; i++) {
  food.push(new Sphere({ scene }));
}

const env = new Env({ scene, food });

const cheatSteps = 4;
(function animate() {
  for (let i = 0; i < cheatSteps; i++) {
    for (let agent of agents) {
      const s1 = env.getState(agent);

      const action = agent.getAction([
        s1.x,
        s1.y,
        ...s1.vision.map((v) => (v ? [1, v.x, v.y] : [0, 0, 0])).flat(),
      ]);
      agent.move(action);

      const s2 = env.getState(agent);
      const r = env.computeReward(s1, s2, agent);
      agent.learn(r);
    }

    food.forEach((foodItem) => foodItem.move());
    
    for (let i = 0; i < agents.length; i++) {
      if (agents[i].energy === 0) {
        agents[i].destroy();
        agents.splice(i, 1);
        i--;
      }
      else if (agents[i].energy > 2) {
        const brain = agents[i].brain.toJSON();
        const agent = new Agent({ scene });
        agent.setPosition(Math.random() * 200 - 100, Math.random() * 200 - 100);
        agent.brain.fromJSON(brain);
        agents.push(agent);
        agent.energy = 1;
        agents[i].energy = 1;
      }
    }

    renderer.render(scene, camera);
    stats.update();
  }

  requestAnimationFrame(animate);
})();

setInterval(() => {
  const s = new Sphere({ scene });
  s.setPosition(Math.random() * 200 - 100, Math.random() * 200 - 100);
  food.push(s);
}, FOOD_APPEAR_INTERVAL);
