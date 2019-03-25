'use strict';


class Vector {

	constructor (x = 0, y = 0) {
		this.coordX = x;
		this.coordY = y;
	}

	plus(vector) {
		try {
			if (vector instanceof Vector) {
				return new Vector(this.coordX + vector.coordX, this.coordY + vector.coordY);
			} else {
				throw new Error("Можно прибавлять к вектору только вектор типа Vector");
			}	
		} catch (e) {
			console.log(e);	
		}
	}

	times(multiplier) {
		return new Vector(this.coordX * multiplier, this.coordY * multiplier);
	}

}

class Actor {
	
	constructor (position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
		try {
			if (position instanceof Vector && size instanceof Vector && speed instanceof Vector) {
				this.pos = position;
				this.size = size;
				this.speed = speed;
			} else {
				throw new Error("Один из параметров не является вектором");
			}
		} catch(e) {
			console.log(e);
		}
	}

	get left() {
		return this.pos.coordX;
	}

	get top() {
		return this.pos.coordY;
	}

	get right() {
		return this.pos.coordX + this.size.coordX; 
	}

	get bottom() {
		return this.pos.coordY + this.size.coordY;
	}

	get type() {
		return "actor";
	}

	act() {}



}