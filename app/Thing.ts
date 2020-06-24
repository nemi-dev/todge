import Game from "./Game";

declare type Type = "you" | "enemy" | "tuna"

export default class Thing {
	x : number = 0
	y : number = 0
	r : number = 0
	velX : number = 0
	velY : number = 0
	life : number
	color : string

	type : Type

	constructor(type : Type, x : number, y : number, r : number, color : string, life : number) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.r = r;
		this.color = color;
		this.life = life;
	}

	update(game : Game) {
		this.x += this.velX;
		this.y += this.velY;
		this.life--;
	}

	renderHitbox(context : CanvasRenderingContext2D) {
		let { x, y, r, color } = this;
		context.strokeStyle = color;
		context.lineWidth = 1;
		context.beginPath();
		context.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
		context.stroke();
	}

	get valid() { return this.life > 0; }

	static hit(a : Thing, b : Thing, torusWidth? : number, torusHeight? : number) {
		let { x : ax, y : ay, r : ar } = a;
		let { x : bx, y : by, r : br } = b;
		return Math.hypot(ax - bx, ay - by) < ar + br;
	}
	

}
