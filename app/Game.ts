import Matrix2D from './Matrix2D';
import { CoordinateState } from './Input';
import Thing from './Thing';
import You from './You';
import { Viewbox } from './View';
import { moveToTarget, friction } from './Moving';
import Timer from './Timer';

const maxSpawnDelay = 160;

const minSpawnCount = 1;
const varSpawnCount = 10;

const maxTunaDelay = 900;

const enemySpeed = 1.2;
const enemySize = 5;
const tunaSize = 4;

const followDistance = 30;

const timerWidth = 56;
const timerHeight = 12;

const textMaxLife = 30;
const damage = 20;

class GuideText {

	text : string
	x : number
	y : number
	size : number
	fontWeight : "normal" | "bold"

	constructor(text : string, x : number, y : number, size : number, weight : "normal" | "bold") {
		this.x = x;
		this.y = y;
		this.text = text;
		this.size = size;
		this.fontWeight = weight
	}
	render(context : CanvasRenderingContext2D, a : number) {
		let { x, y, text } = this;
		context.fillStyle = `hsla(196, 100%, 71%, ${a})`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = `${this.fontWeight} ${this.size}px "Exo 2", "Noto Sans KR"`;
		
		context.fillText(text, x, y);
	}
}

export default class Game {

	readonly timer : Timer

	messages: CoordMessage[] = [];

	you : You
	enemies : Thing[];
	tunas : Thing[];

	readonly guideTexts : GuideText[]
	guideLife : number

	readonly viewbox : Viewbox

	/** 원래 뷰박스에는 속도 속성이 없으므로 움직일 수 있는 어떤 객체가 뷰박스를 대신하는 것으로 한다. 뷰박스를 정의한 의도에 따라서라면 속도 속성을 추가시키는게 좋겠지만, 뷰 계열 클래스는 rAF와는 상관없다. 그게 아니면 뷰박스를 쓰지 말던가... */
	readonly viewboxReplica : DesiredPhysical

	moveViewboxToTarget : Function
	viewboxFriction : Function

	readonly mat : Matrix2D

	torusWidth : number = 220
	torusHeight : number = 280

	/**
	 * - 매 프레임마다 증가한다.
	 * - 값이 증가할수록 적이 출현할 확률이 높아진다.
	 * */
	enemySpawnCounter : number

	currentEnemiesNumber : number
	totalEnemiesNumber : number


	tunaSpawnCounter : number

	status : "free" | "start" | "dead" 

	
	updateFunctions : ((t : DOMHighResTimeStamp) => void)[];

	removeUpdateFunctionLater : ((t : DOMHighResTimeStamp) => void)[] = [];
	updateFunctionLater : ((t : DOMHighResTimeStamp) => void)[] = [];

	constructor(viewbox : Viewbox) {
		let you = new You();
		let viewboxReplica = {
			x : 0,
			y : 0,
			velX : 0,
			velY : 0,
			destX : 0,
			destY : 0
		};

		this.you = you;
		this.viewbox = viewbox;
		this.mat = viewbox.matrix;

		this.guideTexts = [
			new GuideText("땃~쥐!", 0, - followDistance * 2, 20, "bold"),
			new GuideText("Todge", 0, - followDistance * 2 + 15, 12, "bold"),
			new GuideText("참치캔 게이지", - followDistance * 2.5, -12, 10, "bold"),
			new GuideText("시간마다 조금씩 감소", - followDistance * 2.5, 0, 7, "normal"),
			new GuideText("참치캔을 먹어서 회복", - followDistance * 2.5, 8, 7, "normal"),
			new GuideText("체력 게이지", followDistance * 2.5, 0, 10, "bold"),
			new GuideText("길게 눌러 이동", 0, followDistance * 2, 10, "bold"),
			new GuideText("가까운 지점을 누르면 느리게 이동", 0, followDistance * 2 + 10, 7, "normal"),
		];

		
		this.viewboxReplica = viewboxReplica;
		
		this.moveViewboxToTarget = moveToTarget.bind(viewboxReplica, you.speed, you.acc, you.closeDistance);
		this.viewboxFriction = friction.bind(viewboxReplica);

		
		this.timer = new Timer(timerWidth, timerHeight);
		this.init(0);
	}

	
	/** 게임을 처음 상태 (대기 상태)로 돌린다. */
	init(t : DOMHighResTimeStamp) {
		this.status = "free";
		this.you.init();
		this.enemies = [];
		this.tunas = [];
		this.updateFunctions = [this._update_you, this._you_are_invincible];
		this.viewbox.setPosition(0, 0);
		const viewboxReplica = this.viewboxReplica;
		viewboxReplica.x = 0;
		viewboxReplica.y = 0;
		viewboxReplica.velX = 0;
		viewboxReplica.velY = 0;
		viewboxReplica.destX = 0;
		viewboxReplica.destY = 0;
		this.guideLife = textMaxLife;
		this.onstart = this._onStartInitial;
		this.enemySpawnCounter = 0;
		this.totalEnemiesNumber = 0;
		this.currentEnemiesNumber = 0;
		this.tunaSpawnCounter = 0;
		this.timer.startTime = t;
		this.timer.currentTime = t;
	}

	/** 게임 시작을 알리는 메서드 */
	start(t : DOMHighResTimeStamp) {
		this.status = "start";
		// 무적을 뺀다.
		this.updateFunctions.pop();
		this.updateFunctions.push(this._update_guide, this._update_things, this._update_timer);
		this.timer.start(t);
		this.onstart = this._onstart;
	}

	/** 게임 오버를 알리는 메서드 */
	gameover(t? : DOMHighResTimeStamp) {
		this.status = "dead";
		this.timer.end(t);
		this.updateFunctions = [];
		this.onstart = this._onstartDead;
	}


	push(m: CoordMessage) {
		this.messages.unshift(m);
	}

	dispatchAll() {
		let m: CoordMessage;
		while ((m = this.messages.pop()) != null) {
			switch (m.type) {
				case "mousedown":
					this.onstart(m);
					break;
				case "mouseup":
					this.onend(m);
					break;
			}
		}
	}

	createThingRandom() {
		const chance = Math.pow(this.enemySpawnCounter / (maxSpawnDelay + 1), 2);
		const { x: yourX, y : yourY, sight } = this.you;
		const { enemies, tunas } = this;
		if (Math.random() < chance) {
			const count = Math.floor(Math.random()*varSpawnCount) + minSpawnCount;
			for (let i = 0 ; i < count; i++) {
				let angle = Math.random() * Math.PI * 2;
				let diverge = (Math.random() - 0.5)* Math.PI / 2;
				let distance = sight * 1.5;
				let x = yourX + Math.cos(angle) * distance;
				let y = yourY + Math.sin(angle) * distance;
				const thing = new Thing("enemy", x, y, enemySize, "#FF0000", 600);
				thing.velX = - enemySpeed * Math.cos(angle + diverge);
				thing.velY = - enemySpeed * Math.sin(angle + diverge);
				enemies.push(thing);
				this.enemySpawnCounter = 0;
				this.totalEnemiesNumber++;
				this.currentEnemiesNumber++;
			}
		}
		this.enemySpawnCounter++;

		const tunaChance = this.tunaSpawnCounter / maxTunaDelay - 0.3;
		if (Math.random() < tunaChance / 20) {
			let angle = Math.random() * Math.PI * 2;
			let distance = sight * (0.5 + Math.random());
			let x = yourX + Math.cos(angle) * distance;
			let y = yourY + Math.sin(angle) * distance;
			const thing = new Thing("tuna", x, y, tunaSize, "#FFB300", 1800);
			tunas.push(thing);
			this.tunaSpawnCounter = 0;
			
		} else {
			this.tunaSpawnCounter++;
		}
	}

	/** 아직 게임이 시작되지 않았을 때 마우스 누름/터치 시작 핸들러 */
	private _onStartInitial(m : CoordMessage) {
		this.you.setDestination(...this.mat.itransformPoint(m.startX, m.startY));
		this.start(m.startTime);
	}

	/** 게임 플레이 중 누름 핸들러 */
	private _onstart(m : CoordMessage) {
		this.you.setDestination(...this.mat.itransformPoint(m.startX, m.startY));
	}

	/** 게임오버 되었을 때 누름 핸들러 */
	private _onstartDead(m : CoordMessage) {
		this.init(m.startTime);
	}

	onstart = this._onStartInitial


	onend(m : CoordMessage) {
		this.you.neutralizeDestination();
	}

	dispatchDrag(c : CoordinateState) {
		let [x, y] = this.mat.itransformPoint(c.x, c.y);
		this.you.setDestination(x, y);
	}

	moveViewboxToYou() {
		const replica = this.viewboxReplica;
		let viewDistX = this.you.x - this.viewbox.x;
		let viewDistY = this.you.y - this.viewbox.y;
		let distance = Math.hypot(viewDistX, viewDistY);
		if (distance > followDistance) {
			replica.destX = this.you.x;
			replica.destY = this.you.y;
			this.moveViewboxToTarget();
		} else {
			this.viewboxFriction();
		}
		replica.x += replica.velX;
		replica.y += replica.velY;
		this.viewbox.move(replica.velX, replica.velY);
	}

	private _update_you(t : DOMHighResTimeStamp) {
		this.you.update(this);
		this.moveViewboxToYou();
		if (!this.you.valid) {
			this.gameover(t);
		}
	}

	private _you_are_invincible(t : DOMHighResTimeStamp) {
		this.you.life++;
	}

	private _update_guide(t : DOMHighResTimeStamp) {
		this.guideLife--;
		if (this.guideLife < 0) this.removeUpdateFunctionLater.push(this._update_guide);
	}

	private _update_things(t : DOMHighResTimeStamp) {
		const limit = this.you.sight * 3;
		for (let i = this.enemies.length - 1; i >=0 ; i--) {
			const enemy = this.enemies[i];
			if (!enemy.valid) {
				this.enemies.splice(i, 1);
				this.currentEnemiesNumber--;
			} else {
				const distX = enemy.x - this.you.x;
				const distY = enemy.y - this.you.y;
				if ((Math.abs(distX) > limit || Math.abs(distY) > limit) && Math.hypot(distX, distY)) {
					this.enemies.splice(i, 1);
					this.currentEnemiesNumber--;
				}
			}
		}
		for (let i = this.tunas.length - 1; i >=0 ; i--) {
			if (!this.tunas[i].valid) {
				this.tunas.splice(i, 1);
			}
		}
		for (const enemy of this.enemies) {
			enemy.update(this);
		}
		for (const tuna of this.tunas) {
			tuna.update(this);
		}
		this.createThingRandom();
	}

	private _update_timer(t :DOMHighResTimeStamp) {
		this.timer.update(t);
	}


	update(t : DOMHighResTimeStamp) {
		for (const updateFunction of this.updateFunctions) {
			updateFunction.call(this, t);
		}
		let toRemove : (t : DOMHighResTimeStamp) => void
		while (toRemove = this.removeUpdateFunctionLater.pop()) {
			this.updateFunctions.splice(this.updateFunctions.indexOf(toRemove), 1);
		}
		
	}

	hitTest() {
		const you = this.you;
		for (const enemy of this.enemies) {
			if (Thing.hit(you, enemy)) {
				you.health -= damage;
				enemy.life = 0;
			}
		}
		for (const tuna of this.tunas) {
			if (Thing.hit(you, tuna)) {
				you.health = you.maxHealth;
				you.life = you.maxLife;
				tuna.life = 0;
			}
		}
	}

	renderCount(context : CanvasRenderingContext2D) {
		context.font = '16px "Exo 2"';
		context.textBaseline = "middle";
		context.fillStyle = "#69d7ff40";
		context.textAlign = 'center';

		context.fillText(this.totalEnemiesNumber.toString(), this.viewbox.x , this.viewbox.y - this.viewbox.height / 4);

	}

	renderTunaDirection(context : CanvasRenderingContext2D) {
		context.fillStyle = "#FFB30040";
		const farDist = followDistance * 2;
		const nearDist = farDist - 8;
		const theta = Math.PI / 15;
		const { x, y } = this.you
		for (const tuna of this.tunas) {
			const dx = tuna.x - x;
			const dy = tuna.y - y;
			if (Math.hypot(dx, dy) > farDist) {
				const angle = Math.atan2(dy, dx);
				context.beginPath();
				context.moveTo(x + Math.cos(angle) * farDist, y + Math.sin(angle) * farDist);
				context.lineTo(x + Math.cos(angle - theta) * nearDist, y + Math.sin(angle - theta) * nearDist);
				context.lineTo(x + Math.cos(angle + theta) * nearDist, y + Math.sin(angle + theta) * nearDist);
				context.fill();
			}
			
		}
	}

	render(context: CanvasRenderingContext2D) {
		if (this.guideLife >= 0) for (const guide of this.guideTexts) {
			guide.render(context, this.guideLife / textMaxLife);
		}
		for (const enemies of this.enemies) enemies.render(context);
		
		for (const tuna of this.tunas) tuna.render(context);
		
		this.you.render(context);
		
		this.you.renderSight(context);


		this.you.renderYourUI(context, this.viewboxReplica.x, this.viewboxReplica.y, followDistance * 2);
		this.renderTunaDirection(context);

		this.timer.render(context ,this.viewbox.x, this.viewbox.y + this.viewbox.height / 4);
		this.renderCount(context);

	}
}
