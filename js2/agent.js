"use strict";

import { THREE } from "./lib/three.js";
import times from "./lib/lodash/times.js";
import { Points } from "./points.js";
import { Lines } from "./lines.js";
import RL from "./lib/rl.js";
import t from "./t.js";

const VISION_DIST = 20;

const spec = {
  update: "qlearn", // qlearn | sarsa
  gamma: 0.9, // discount factor, [0, 1)
  epsilon: 0.2, // initial epsilon for epsilon-greedy policy, [0, 1)
  alpha: 0.005, // value function learning rate
  experience_add_every: 5, // number of time steps before we add another experience to replay memory
  experience_size: 10000, // size of experience
  learning_steps_per_iteration: 5,
  tderror_clamp: 1.0, // for robustness
  num_hidden_units: 100, // number of neurons in hidden layer
};

export class Agent {
  constructor(o) {
    /** количество исходящих сенсоров */
    this.eyes = 30;

    /** жизненная энергия */
    this.energy = 1;

    this.vel = { x: 0, y: 0 };
    this.vel.x = 2;
    this.vel.y = 2;

    // эта шняга никак не используется - почему???
    this.reward_bonus = 0.0;

    // ???
    this.digestion_signal = 0.0;

    // this.num_states = N * 2;

    this.num_states = 4;

    /**
     * действия, которые может совершать агент
     * влево, вправо, вниз, вверх, на месте
     **/
    this.actions = [0, 1, 2, 4, 5];

    // ???
    this.actionsMap = [0, -0.5, 0.5];

    const c = [0, 0];

    this.scene = o.scene;

    this.points = new Points();
    o.scene.add(this.points);

    this.lines = new Lines({
      visionDist: VISION_DIST,
      segmentsCount: this.eyes,
    });
    o.scene.add(this.lines);

    this.sensorDirections = times(this.eyes).map((i) => {
      const [x, y] = t.crt2xy(c, 50, i / (this.eyes - 1));
      return new THREE.Vector3(x, y, 0).normalize();
    });

    this.brain = new RL.DQNAgent(this, spec);
  }

  destroy() {
    const linesObject = this.scene.getObjectByProperty("uuid", this.lines.uuid);
    linesObject.geometry.dispose();
    linesObject.material.dispose();
    this.scene.remove(linesObject);
    const pointsObject = this.scene.getObjectByProperty(
      "uuid",
      this.points.uuid
    );
    pointsObject.geometry.dispose();
    pointsObject.material.dispose();
    this.scene.remove(pointsObject);
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

    this.energy -= 0.0005;
    if (this.energy < 0) this.energy = 0;
    const col = t.t2rgb(this.energy);
    this.lines.lineMaterial.color.r = col[0] / 255;
    this.lines.lineMaterial.color.g = col[1] / 255;
    this.lines.lineMaterial.color.b = col[2] / 255;
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
