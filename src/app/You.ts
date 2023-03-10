import { Thing } from "./Thing";
import { Moving } from "./Moving";
import Game from "./Game";

const yourColor = "#FFFF00";
const yourMaxSpeed = 0.9;
const yourAcc = 0.5;
const closeDistance = 10;
const yourSize = 5;
const yourLife = 1800;
const yourHealth = 6;
const sight = 120;

const backgroundColor = [41 / 255, 43 / 255, 44 / 255];
const lightColorSource0 = [149 / 255, 232 / 255, 1];
const lightColorSource1 = [16 / 255, 90 / 255, 136 / 255];
const lightMinRange = 25;
const lightMaxRange = 150;

for (let i = 0; i < 3; i++) {
	lightColorSource0[i] = Math.floor(lightColorSource0[i] * backgroundColor[i]);
	lightColorSource1[i] = Math.floor(lightColorSource1[i] * backgroundColor[i]);
}

const sightColorStop0 = `rgba(${lightColorSource0[0]}, ${lightColorSource0[1]}, ${lightColorSource0[2]}, 0)`;
const sightColorStop1 = `rgba(${lightColorSource1[0]}, ${lightColorSource1[1]}, ${lightColorSource1[2]}, 0.5)`;
const sightColorStop2 = "#000000FF";

// 참고 : Life는 수명이고 Health는 체력이다. 시간이 흐르면 Life가 깎이고, 철충한테 맞으면 Health가 깎인다.

export default class You implements Thing {

	public readonly sight = sight;

	readonly moving : Moving = new Moving(yourMaxSpeed, yourAcc, closeDistance);

	life : number
	maxLife : number

	health : number;
	maxHealth : number;

	get valid() { return this.life > 0 && this.health > 0; }

	get x() { return this.moving.x; }
	get y() { return this.moving.y; }
	get size() { return yourSize; }
	
	constructor() {
		this.init();
	}

	/** 너를 처음 상태로 만든다. */
	init() {
		this.life = yourLife;
		this.maxLife = yourLife;
		this.health = yourHealth;
		this.maxHealth = yourHealth;
		this.moving.init();
	}

	update(game : Game) {
		this.moving.update();
	}

	drain() {
		this.life--;
	}

	

	dispose() {
		this.life = 0;
	}

	renderHitbox(context : CanvasRenderingContext2D) {
		context.strokeStyle = yourColor;
		context.lineWidth = 1;
		context.beginPath();
		context.ellipse(this.x, this.y, yourSize, yourSize, 0, 0, Math.PI * 2);
		context.stroke();
	}

	renderSprite(context : CanvasRenderingContext2D) {
		// context.drawImage(yourImage, this.x - 18, this.y - 27, 36, 54);
	}

	renderLight(context : CanvasRenderingContext2D) {
		const { x, y, sight } = this;
		let grad = context.createRadialGradient(x, y, lightMinRange, x, y, lightMaxRange);
		grad.addColorStop(0.0, sightColorStop0);
		grad.addColorStop(0.5, sightColorStop1);
		grad.addColorStop(1.0, sightColorStop2);
		context.fillStyle = grad;
		context.fillRect(x - 500, y - 500, 1000, 1000);
	}

	renderLife(context : CanvasRenderingContext2D, x : number, y : number, distance : number) {
		distance -= 2.5;
		let startAngle = Math.PI * 5 / 6;
		let {life, maxLife} = this;
		let ratio = Math.max(0, life / maxLife);
		let endAngle = startAngle + Math.PI * ratio / 3;
		context.lineWidth = 5;
		context.strokeStyle = "hsla(45, 100%, 75%, 0.25)";
		context.beginPath();
		context.ellipse(x, y, distance, distance, 0, startAngle, endAngle);
		context.stroke();
	}

	renderHealth(context : CanvasRenderingContext2D, x : number, y : number, distance : number) {
		distance -= 2.5;
		let startAngle = Math.PI / 6;
		let { health, maxHealth } = this;
		let ratio = Math.max(0, health / maxHealth);
		let endAngle = startAngle - Math.PI * ratio / 3;
		context.lineWidth = 5;
		context.strokeStyle = "hsla(200, 100%, 70%, 0.25)";
		const hopAngle = Math.PI / 3 / maxHealth;
		const unitAngle = hopAngle * 4 / 5;
		for (let i = 0; i < health; i++) {
			const angle = startAngle - hopAngle * i;
			context.beginPath();
			context.ellipse(x, y, distance, distance, 0, angle, angle - unitAngle, true);
			context.stroke();
		}
	}

	renderYourUI(context : CanvasRenderingContext2D, x : number, y : number, distance : number) {
		this.renderLife(context, x, y, distance);
		this.renderHealth(context, x, y, distance);
	}
}
