import t from "./t.js";

export class Env {
  constructor({ scene, agent, food }) {
    this.scene = scene;
    this.agent = agent;
    this.food = food;
  }

  getState() {
    const visions = this.food.map(foodItem => this.agent.checkSensors(foodItem.mesh));
    const vision = Array(visions[0].length);
    for (let i = 0; i < vision.length; i++) {
      vision[i] = null;
      for (const v of visions) {
        if (v[i] != null) vision[i] = v[i];
      }
    }
    
    return {
      x: this.agent.points.position.x,
      y: this.agent.points.position.y,
      vision,
    };
  }

  computeReward(s1, s2) {
    // если есть еда поблизости - надо двигаться в ее направлении
    // найти ближайшую еду и посчитать расстояние до нее
    // проверить, что на следующем шаге это расстояние стало меньше
    
    let minv = null;
    let mind = Infinity;
    let mini = -1;
    s1.vision.forEach((v, i) => {
      if (!v) return;
      const d = t.dist(s1, v);
      if (d < mind) {
        mind = d;
        minv = v;
        mini = i;
      }      
    });
    if (mini > -1) {
      const d = t.dist(s2, minv);
      if (d < mind) {
        if (d < 5) {
          const j = this.food.indexOf(minv.v.object._parent);
          minv.v.object._parent.destroy();
          this.food.splice(j, 1);
          return 10;
        }
        return 1;
      }
    }
    return 0;
    
    // если нет никого поблизости - надо перемещаться, исследовать окружающую среду
  }
}