'use strict';

import World from './world';
import Agent from './agent';

const world = new World();
const borders = world.createSteps();
const agent = new Agent(world);
agent.world = world;

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


function __computeFintess(world, agent) {
	// надо:
	// - выбрать нижнюю ступеньку
	// - s0 = расстояние от проекции центра ступеньки на ось X агента на шаге i
	// - s1 = расстояние от проекции центра ступеньки на ось X агента на шаге i + 1
	// fitness = s1 > s0 ? 1 : -1
	// как только ступенька опустилась ниже оси X - выбираем следующую ступеньку
	
	
}


function computeFintess(world, agent) {
	// если агент столкнулся со ступенькой - наказание и перезапуск
	// если ступенька достигла агента y агента и не пересекла по x - поощрение
	
	// +
	// если глаза видят ступеньку и расстояние уменьшается - наказание
	// если глаза видят ступеньку и расстояние увеличивается - поощрение
	//const activeSensors = agent.sensors.filter(sensor => sensor);
	
	// это совершенно дурацкая fitness-функция
	
	const good = 1.0;
	const bad = -1.0;
	
	let res = 0;
	agent.vision.some((visionItem, i) => {
		if (!agent.prevVision) return;
		if (visionItem && agent.prevVision[i]) {
			if (visionItem.distance <= agent.prevVision[i].distance) {
				res = bad;
				return true;
			} else {
				res = good;
				return true;
			}
		}
	});
	
	return res;
}

world.steps.geometry.center()

world.animate(() => {
	const vision = agent.checkSensors();
	const act = agent.getAction(vision);
	
	//console.log(agent.actionsMap[act])
	agent.vel.x = agent.actionsMap[act];
	agent.move();
	world.moveSteps();
	const fit = computeFintess(world, agent);
	agent.backward(fit);
});