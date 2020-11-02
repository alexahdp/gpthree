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
	dist: (v1, v2) => Math.sqrt((v1.x - v2.x)**2 + (v1.y - v2.y)**2),
	t2rgb(t) {
		const color = [
			Math.round(Math.abs(this.cos(t) * 255)),
			Math.round(Math.abs(this.sin(t) * 255)),
			125
		];
		color.toString = function() {
			return `rgb(${this[0]}, ${this[1]}, ${this[2]})`;
		};
		return color;
	},
};

export default t;