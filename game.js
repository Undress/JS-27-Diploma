'use strict';


class Vector {

	constructor (x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(vector) {	
			if (vector instanceof Vector) {
				return new Vector(this.x + vector.x, this.y + vector.y);
			} else {
				throw new Error("Можно прибавлять к вектору только вектор типа Vector");
			}	
	}

	times(multiplier) {
		return new Vector(this.x * multiplier, this.y * multiplier);
	}

}

class Actor {
	
	constructor (position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
			if (position instanceof Vector && size instanceof Vector && speed instanceof Vector) {
				this.pos = position;
				this.size = size;
				this.speed = speed;
			} else {
				throw new Error("Один из параметров не является вектором");
			}
	}

	get left() {
		return this.pos.x;
	}

	get top() {
		return this.pos.y;
	}

	get right() {
		return this.pos.x + this.size.x; 
	}

	get bottom() {
		return this.pos.y + this.size.y;
	}

	get type() {
		return "actor";
	}

	act() {}

	isIntersect(actor) {

			if (!(actor instanceof Actor)) {
				throw new Error("Параметр не является движущимся объектом");
			} else if (actor == this) {
				return false;
			} else if (this.left < actor.right && this.right > actor.left && this.top < actor.bottom && this.bottom > actor.top) {
				return true;
			}
			return false;
	}
}



class Level {
	constructor (grid = [], actors = []) {
		this.grid = grid;
		this.actors = actors;
		this.status = null;
		this.finishDelay = 1;
	}


	get height() {
		return this.grid.length;
	}

	get width () {
		let len = 0;
		for (let row of this.grid) {
			if (row.length > len) {
				len = row.length;
			}
		}
		return len;
	}

	get player() {
		return this.actors.find(function(element) {
			return element.type == "player";
		});
	}

	isFinished() {
		if (this.status !== null && this.finishDelay < 0) {
			return true;
		} else {
			return false;
		}
	}

	actorAt(actor) {
		if (actor instanceof Actor) {
			for (let anotherActor of this.actors) {
				if (actor.isIntersect(anotherActor)) {
					return anotherActor;
				}
			}
		} else {
			throw new Error("Переданный параметр не является движущимся объектом");
		}
		return undefined;
	}

	obstacleAt(destination, size) {
		if (destination instanceof Vector && size instanceof Vector) {
			if (destination.x < 0 || destination.x+size.x > this.width || destination.y < 0) {
				return "wall";
			} else if ((destination.y+size.y) > this.height) {
				return "lava";
			} else {
				let result = this.grid[Math.floor(destination.y)][Math.floor(destination.x)]; 
				return result;
			}

		} else {
			throw new Error("Переданные параметр не являются вектором");
		}

	}

	removeActor(actor) {
		if (actor instanceof Actor) {
			let actorFound = this.actors.find(
				function (element) {
					return element.title == actor.title;
				}
			 );
			let actorFoundIndex = this.actors.indexOf(actorFound);
			this.actors.splice(actorFoundIndex, 1);
		} else {
			throw new Error("Переданный параметр не является движущимся объектом");
		}
	}

	noMoreActors(type) {
		let actorFound = this.actors.find(
			function(element) {
				return element.type == type;
			});
		if (actorFound === undefined) {
			return true;
		} else {
			return false;
		}
	}

	playerTouched(obstacleType, obstacle) {

		 if (obstacleType == 'lava' || obstacleType == 'fireball') {
			this.status = 'lost';
		} else {
			let coinIndex = this.actors.indexOf(obstacle);
			this.actors.splice(coinIndex, 1);

			if (this.noMoreActors('coin')) {
			this.status = 'won';
		}
		}

	}
}

class LevelParser {
	constructor (objects) {
		this.levelObjects = objects;
	}

	actorFromSymbol(symbol) {
		if (!symbol) {
			return undefined;
		} else {
			return this.levelObjects[symbol];
		}
	}

	obstacleFromSymbol(symbol) {
		if (symbol == 'x') {
			return 'wall';
		} else if (symbol == '!') {
			return 'lava';
		} else {
			return undefined;
		}

	}

	createGrid(gridArray) {
		let grid = [];
		for (let line of gridArray) {
			let gridLine = [];
			for(let element of line) {
				gridLine.push(this.obstacleFromSymbol(element));
			}
			grid.push(gridLine);
		} 
		return grid;
	}

	createActors(actorArray) {
		let result = [];
		if (actorArray.length == 0) {
			return [];
		} else if (!this.levelObjects) {
			return [];
		} else {

			for(let lineNum in actorArray) {
				let y = parseInt(lineNum, 10);
				let line = actorArray[lineNum];
				for (let elementNum in line) {
					let x = parseInt(elementNum, 10);
					let actorConstructor = this.actorFromSymbol(line[elementNum]);
						if (!(typeof actorConstructor == 'function')) {
							continue;
						} else if (!(new actorConstructor() instanceof Actor)){
							continue;
						} else {
							result.push(new actorConstructor(new Vector(x, y)));
						}
				}
			}
		}
		return result;
	}

	parse (levelArray) {
		return new Level(this.createGrid(levelArray), this.createActors(levelArray));
	}

}

class Fireball extends Actor{
	constructor (position, speed) {
		super(position, new Vector(1, 1) ,speed);
	}

	get type() {
		return "fireball";
	}

	getNextPosition(time = 1) {
		return this.pos.plus(this.speed.times(time));
	}

	handleObstacle() {
		this.speed.x *= -1; 
		this.speed.y *= -1; 
	}

	act(time, level) {
		let nextPos = this.getNextPosition(time);
		if(!level.obstacleAt(nextPos, this.size)) {
			this.pos = nextPos;
		} else {
			this.handleObstacle();
		}
	}

}


class HorizontalFireball extends Fireball {
	constructor(position) {
		super(position, new Vector(2, 0));
	}
}


class VerticalFireball extends Fireball {
	constructor(position) {
		super(position, new Vector(0, 2));
	}
}


class FireRain extends Fireball{
	constructor(position) {
		super(position, new Vector(0, 3));
		this.initialPosition = position;
	}

	handleObstacle() {
		this.pos = this.initialPosition;
	}
}

class Coin extends Actor{
	constructor(position) {
		super(position, new Vector(0.6, 0.6));
		this.pos = this.pos.plus(new Vector(0.2, 0.1));
		this.spring = Math.random() * (2 * Math.PI);
		this.initialPos = this.pos;
	}

	get type() {
		return 'coin';
	}

	get springSpeed() {
		return 8;
	}

	get springDist() {
		return 0.07;
	}

	updateSpring(time = 1) {
		this.spring += this.springSpeed * time;
	}

	getSpringVector() {
		return new Vector(0, Math.sin(this.spring) * this.springDist);
	}

	getNextPosition(time = 1) {
		this.updateSpring(time);
		return this.initialPos.plus(this.getSpringVector());
	}

	act(time) {
		this.pos = this.getNextPosition(time);
	}

}

class Player extends Actor{
	constructor(position) {
		super(position, new Vector(0.8, 1.5), new Vector(0, 0));
		this.pos = this.pos.plus(new Vector(0, -0.5));
	}

	get type() {
		return 'player';
	}
}


const actorDict = {
  '@': Player,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'v': FireRain
}

const parser = new LevelParser(actorDict);
loadLevels().then(levelsJson => {
	return JSON.parse(levelsJson);
}).then(schema => {
	return runGame(schema, parser, DOMDisplay);
}).then(() => alert('Вы выиграли приз!'));






