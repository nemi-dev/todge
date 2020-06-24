import Game from "./Game";

declare type Type = "you" | "enemy" | "tuna"

declare interface EnemyProfile {
	readonly color : string
	readonly diverge : number
	readonly life : number
	readonly size : number
	readonly speed : number
	readonly damage : number
}

export interface Thing {
	readonly size : number
	readonly valid : boolean
	readonly x : number
	readonly y : number
	update(game : Game) : void;
	renderHitbox(context : CanvasRenderingContext2D) : void
	dispose() : void
}

export function hit(a : Thing, b : Thing) {
		let { x : ax, y : ay, size : ar } = a;
		let { x : bx, y : by, size : br } = b;
		const dist = ar + br;
		return 1
		&& Math.abs(ax - bx) < dist
		&& Math.abs(ay - by) < dist
		&& Math.hypot(ax - bx, ay - by) < ar + br;
}

export class Enemy implements Thing {
	readonly profile : EnemyProfile
	type : Type
	x : number
	y : number
	velX : number
	velY : number
	life : number

	constructor(type : Type, x : number, y : number, angle : number, profile : EnemyProfile) {
		this.profile = profile;
		this.type = type;
		this.x = x;
		this.y = y;
		const diverge = (Math.random() - 0.5) * profile.diverge;
		this.velX = - Math.cos(angle + diverge) * profile.speed;
		this.velY = - Math.sin(angle + diverge) * profile.speed;
		this.life = profile.life;
	}

	get valid() { return this.life > 0; }
	get size() { return this.profile.size; }

	update(game : Game) {
		this.x += this.velX;
		this.y += this.velY;
		this.life--;
	}

	renderHitbox(context : CanvasRenderingContext2D) {
		let { x, y, profile } = this;
		let { size, color } = profile;
		context.strokeStyle = color;
		context.lineWidth = 1;
		context.beginPath();
		context.ellipse(x, y, size, size, 0, 0, Math.PI * 2);
		context.stroke();
	}

	dispose() {
		this.life = 0;
	}
}

const tunaLife = 1800;
const tunaColor = "#FFBF00";
const tunaSize = 4;

export class Tuna implements Thing {
	life : number = tunaLife
	x : number
	y : number

	get size() { return tunaSize; }

	get valid() { return this.life > 0; }

	constructor(x : number, y : number) {
		this.x = x;
		this.y = y;
	}

	update(game : Game) {
		this.life--;
	}

	renderHitbox(context : CanvasRenderingContext2D) {
		context.strokeStyle = tunaColor;
		context.lineWidth = 1;
		context.beginPath();
		context.ellipse(this.x, this.y, tunaSize, tunaSize, 0, 0, Math.PI * 2);
		context.stroke();
	}

	dispose() {
		this.life = 0;
	}
	
}
