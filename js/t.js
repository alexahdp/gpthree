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
};

export default t;