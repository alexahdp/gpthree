'use strict';

import World from './world';
import Agent from './agent';

const world = new World();
const borders = world.createSteps();
const agent = new Agent(world);
agent.world = world;
world.agent = agent;

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

function computeFintess(world, agent) {
	const good = 1.0;
	const bad = -1.0;
	let res = good;
	
	agent.vision.some((visionItem, i) => {
		if (visionItem && visionItem.distance < 10) {
			res = bad;
			return true;
		}
	});
	
	return res;
}

world.steps.geometry.center()

world.animate(() => {
	const vision = agent.checkSensors();
	const act = agent.getAction(vision);
	
	agent.vel.x = agent.actionsMap[act];
	agent.move();
	
	// world.moveSteps();
	// const fit = computeFintess(world, agent);
	
	const result = world.moveSteps();
	const fit = result ? -1 : 0;
	
	agent.backward(fit);
});