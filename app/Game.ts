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

const damage = 20;

const viewboxReplicaOriginal = { x : 0, y : 0, velX : 0, velY : 0, destX : 0, destY : 0 };


class GuideText {

	private text : string
	private x : number
	private y : number
	private font : string

	constructor(text : string, x : number, y : number, size : number, weight : "normal" | "bold") {
		this.x = x;
		this.y = y;
		this.text = text;
		this.font = `${weight} ${size}px "Exo 2", "Noto Sans KR"`;
	}

	render(context : CanvasRenderingContext2D, a : number) {
		let { x, y, text } = this;
		context.fillStyle = `hsla(200, 100%, 70%, ${a})`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = this.font;
		
		context.fillText(text, x, y);
	}
}

const guideMaxLife = 30;
const guideTextDistance = 50;

class GuideTextGroup {
	readonly texts = [
		new GuideText("땃~쥐!", 0, - guideTextDistance, 20, "bold"),
		new GuideText("Todge", 0, - guideTextDistance + 15, 12, "bold"),
		new GuideText("참치캔 게이지", - guideTextDistance, -12, 10, "bold"),
		new GuideText("시간마다 조금씩 감소", - guideTextDistance, 0, 7, "normal"),
		new GuideText("참치캔을 먹어서 회복", - guideTextDistance, 8, 7, "normal"),
		new GuideText("체력 게이지", guideTextDistance, -12, 10, "bold"),
		new GuideText("피격 시 감소", guideTextDistance, 0, 7, "normal"),
		new GuideText("길게 눌러 이동", 0, guideTextDistance, 10, "bold"),
		new GuideText("가까운 지점을 누르면 느리게 이동", 0, guideTextDistance + 10, 7, "normal"),
	];
	guideLife : number

	constructor() {
		this.init(0);
	}

	init(t : DOMHighResTimeStamp) {
		this.guideLife = guideMaxLife;
	}

	get valid() { return this.guideLife > 0 }

	update(t : DOMHighResTimeStamp) {
		this.guideLife--;
	}

	render(context : CanvasRenderingContext2D) {
		const a = this.guideLife / guideMaxLife;
		for (const text of this.texts) text.render(context, a);
	}
}

export default class Game {

	readonly timer : Timer

	messages: CoordMessage[] = [];

	/** 너 임마, 너. */
	you : You

	/** 적들을 담은 배열 */
	enemies : Thing[];

	/** 참치캔을 담은 배열 */
	tunas : Thing[];

	/** 가이드 텍스트 */
	readonly guide : GuideTextGroup = new GuideTextGroup();

	readonly viewbox : Viewbox

	/** 원래 뷰박스에는 속도 속성이 없으므로 움직일 수 있는 어떤 객체가 뷰박스를 대신하는 것으로 한다. 뷰박스를 정의한 의도에 따라서라면 속도 속성을 추가시키는게 좋겠지만, 뷰 계열 클래스는 rAF와는 상관없다. 그게 아니면 뷰박스를 쓰지 말던가... */
	readonly viewboxReplica : DesiredPhysical

	moveViewboxToTarget : Function
	viewboxFriction : Function

	readonly mat : Matrix2D

	torusWidth : number = 220
	torusHeight : number = 280

	/**
	 * 매 프레임마다 증가하는 철충 카운터
	 * */
	enemySpawnCounter : number

	/**
	 * 누적 스폰된 철충 수를 나타낸다.
	 */
	totalEnemiesNumber : number


	/**
	 * 매 프레임마다 증가하는 참치캔 카운터
	 */
	tunaSpawnCounter : number

	/**
	 * 참치캔 카운터가 최대가 되었을 때 참치를 스폰할 확률
	 * [1..5] 범위 내의 자연수로 1당 20%와 같다.
	 */
	tunaChance : number

	status : "free" | "start" | "dead" 

	constructor(viewbox : Viewbox) {
		let you = new You();

		this.you = you;
		this.viewbox = viewbox;
		this.mat = viewbox.matrix;
		
		let viewboxReplica = Object.assign({}, viewboxReplicaOriginal);
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
		this.guide.init(t);
		
		this.viewbox.setPosition(0, 0);
		Object.assign(this.viewboxReplica, viewboxReplicaOriginal);
		
		this.enemySpawnCounter = 0;
		this.totalEnemiesNumber = 0;
		this.tunaSpawnCounter = 0;
		this.timer.startTime = t;
		this.timer.currentTime = t;
		this.onstart = this._onstartInitial;
		this.update = this.updateInit;
		this.dispatchDrag = this.noop;
	}

	/** 게임 시작을 알리는 메서드 */
	start(t : DOMHighResTimeStamp) {
		this.status = "start";
		this.timer.start(t);
		this.onstart = this._onstartPlaying;
		this.update = this.updatePlay;
		this.dispatchDrag = this._dispatchCoordUpdate;
	}

	/** 게임 오버를 알리는 메서드 */
	gameover(t? : DOMHighResTimeStamp) {
		this.status = "dead";
		this.timer.end(t);
		this.you.neutralizeDestination();
		this.onstart = this._onstartDead;
		this.update = this.updateGameover;
		this.dispatchDrag = this.noop;
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

	/**
	 * 랜덤으로 오브젝트를 생성한다.
	 */
	createThingRandom() {
		const chance = Math.pow(this.enemySpawnCounter / (maxSpawnDelay + 1), 2);
		const { x: yourX, y : yourY, sight } = this.you;
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

				this.enemies.push(thing);
				this.enemySpawnCounter = 0;
				this.totalEnemiesNumber++;
			}
		}
		this.enemySpawnCounter++;

		const tunaChance = this.tunaSpawnCounter / maxTunaDelay - 0.3;
		if (Math.random() < tunaChance / 20) {
			let angle = Math.random() * Math.PI * 2;
			let distance = sight * (0.5 + Math.random());
			let x = yourX + Math.cos(angle) * distance;
			let y = yourY + Math.sin(angle) * distance;
			const thing = new Thing("tuna", x, y, tunaSize, "#FFBF00", 1800);
			
			this.tunas.push(thing);
			this.tunaSpawnCounter = 0;
			
		} else {
			this.tunaSpawnCounter++;
		}
	}

	/** 아직 게임이 시작되지 않았을 때 마우스 누름/터치 시작 핸들러 */
	private _onstartInitial(m : CoordMessage) {
		this.you.setDestination(...this.mat.itransformPoint(m.startX, m.startY));
		this.start(m.startTime);
	}

	/** 게임 플레이 중 누름 핸들러 */
	private _onstartPlaying(m : CoordMessage) {
		this.you.setDestination(...this.mat.itransformPoint(m.startX, m.startY));
	}

	/** 게임오버 되었을 때 누름 핸들러 */
	private _onstartDead(m : CoordMessage) {
		this.init(m.startTime);
	}

	onstart = this._onstartInitial

	/** 마우스를 놓을 때 */
	onend(m : CoordMessage) {
		this.you.neutralizeDestination();
	}

	/** 아무 것도 하지 않는다. */
	private noop(...a : any) {} 

	/** 게임 플레이 중 입력좌표 업데이트를 받을 때 실행한다. */
	private _dispatchCoordUpdate(c : CoordinateState) {
		this.you.setDestination(...this.mat.itransformPoint(c.x, c.y));
	}

	dispatchDrag: (c : CoordinateState) => void = this.noop;

	/** 뷰박스를 플레이어에게로 옮긴다. */
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

	/** 객체들을 업데이트한다. 여기에는 삭제도 포함된다. */
	private _update_things(t : DOMHighResTimeStamp) {
		const limit = this.you.sight * 3;
		for (let i = this.enemies.length - 1; i >=0 ; i--) {
			const enemy = this.enemies[i];
			if (!enemy.valid || (Math.abs(enemy.x - this.you.x) > limit || Math.abs(enemy.y - this.you.y) > limit)) {
				this.enemies.splice(i, 1);
			}
		}
		for (let i = this.tunas.length - 1; i >=0 ; i--) {
			if (!this.tunas[i].valid) {
				this.tunas.splice(i, 1);
			}
		}
		for (const enemy of this.enemies) enemy.update(this);
		for (const tuna of this.tunas) tuna.update(this);
		
	}

	private updateInit(t : DOMHighResTimeStamp) {
		this.you.update(this);
		this.you.life = this.you.maxLife;
	}

	private updatePlay(t : DOMHighResTimeStamp) {
		this.timer.update(t);
		this.you.update(this);
		this.moveViewboxToYou();
		if (!this.you.valid) {
			this.gameover(t);
		}
		if (this.guide.valid) this.guide.update(t);
		this._update_things(t);
		this.createThingRandom();
	}

	private updateGameover(t : DOMHighResTimeStamp) {
		this.you.update(this);
		this._update_things(t);
	}

	update : (t : DOMHighResTimeStamp) => void;
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
		context.fillStyle = "hsla(200, 100%, 70%, 0.25)";
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
		if (this.guide.valid) this.guide.render(context);

		this.you.renderSprite(context);
		for (const enemies of this.enemies) enemies.renderHitbox(context);
		for (const tuna of this.tunas) tuna.renderHitbox(context);
		
		this.you.renderHitbox(context);

		this.you.renderLight(context);

		this.you.renderYourUI(context, this.viewboxReplica.x, this.viewboxReplica.y, followDistance * 2);
		this.renderTunaDirection(context);
		this.timer.render(context ,this.viewbox.x, this.viewbox.y + this.viewbox.height / 4);
		this.renderCount(context);
	}
}
