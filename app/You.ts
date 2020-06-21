import Thing from "./Thing";
import Game from "./Game";
import { friction, moveToTarget } from "./Moving";

const yourMaxSpeed = 0.8;
const yourAcc = 0.25;
const closeDistance = 20;
const yourSize = 5;
const yourLife = 1800;
const yourHealth = 60;
const sight = 120;

// 참고 : Life는 수명이고 Health는 체력이다. 시간이 흐르면 Life가 깎이고, 철충한테 맞으면 Health가 깎인다.

export default class You extends Thing {

	public readonly speed = yourMaxSpeed;
	public readonly acc = yourAcc;
	public readonly closeDistance = closeDistance;
	public readonly sight = sight;

	destX : number
	destY : number

	maxLife : number;

	health : number;
	maxHealth : number;

	private friction = friction.bind(this)

	private moveToTarget = moveToTarget.bind(this, yourMaxSpeed, yourAcc, closeDistance)

	private updatePosition = this.friction

	constructor() {
		super("you", 0, 0, yourSize, "#FFFF00", yourLife);
		this.init();
	}

	/** 너를 처음 상태로 만든다. */
	init() {
		this.life = yourLife;
		this.maxLife = yourLife;
		this.health = yourHealth;
		this.maxHealth = yourHealth;
		this.x = 0;
		this.y = 0;
		this.velX = 0;
		this.velY = 0;
		this.destX = null;
		this.destY = null;
	}

	setDestination(x : number, y : number) {
		this.destX = x;
		this.destY = y;
		this.updatePosition = this.moveToTarget;
	}

	neutralizeDestination() {
		this.destX = null;
		this.destY = null;
		this.updatePosition = this.friction;
	}

	/** @override */
	update(game : Game) {
		super.update(game);
		this.updatePosition();
	}

	get valid() {
		return this.life > 0 && this.health > 0;
	}

	render(context : CanvasRenderingContext2D) {
		super.render(context);
		this.renderSquare(context);

	}
	renderSight(context : CanvasRenderingContext2D) {
		const { x, y, sight } = this;
		let grad = context.createRadialGradient(x, y, sight - 50, x, y, sight + 25);
		grad.addColorStop(0.0, '#00000000');
		grad.addColorStop(1.0, '#000000FF');
		context.fillStyle = grad;
		context.fillRect(x - sight * 2, y - sight * 2, sight * 4, sight * 4);
	}


	renderLife(context : CanvasRenderingContext2D, x : number, y : number, distance : number) {
		distance -= 2.5;
		let startAngle = Math.PI * 5 / 6;
		let {life, maxLife} = this;
		let ratio = Math.max(0, life / maxLife);
		let endAngle = startAngle + Math.PI * ratio / 3;
		context.lineWidth = 5;
		context.strokeStyle = "#ffd24a80";
		context.beginPath();
		context.ellipse(x, y, distance, distance, 0, startAngle, endAngle);
		context.stroke();
	}

	renderHealth(context : CanvasRenderingContext2D, x : number, y : number, distance : number) {
		distance -= 2.5;
		let startAngle = Math.PI / 6;
		let {health, maxHealth} = this;
		let ratio = Math.max(0, health / maxHealth);
		let endAngle = startAngle - Math.PI * ratio / 3;
		context.lineWidth = 5;
		context.strokeStyle = "#69d7ff80";
		context.beginPath();
		context.ellipse(x, y, distance, distance, 0, startAngle, endAngle, true);
		context.stroke();
	}

	renderSquare(context : CanvasRenderingContext2D) {
		let {x, y} = this;
		context.strokeStyle = "#FFFFFF";
		context.lineWidth = 1;
		context.strokeRect(x - 18, y - 27, 36, 54);
	}
	renderYourUI(context : CanvasRenderingContext2D, x : number, y : number, distance : number) {
		this.renderLife(context, x, y, distance);
		this.renderHealth(context, x, y, distance);
	}
}
