import Matrix2D from './Matrix2D';
import You from './You';
import { PointState } from './Input';
import { Enemy, Tuna, hit } from './Thing';
import { Viewbox } from './View';
import { Moving } from './Moving';
import Timer from './Timer';

const maxSpawnDelay = 160;

const minSpawnCount = 1;
const varSpawnCount = 10;

const maxTunaDelay = 900;

const enemy = {
	speed : 1.2,
	size : 5,
	life : 600,
	color : "#FF0000",
	diverge : Math.PI / 2,
	damage : 2
};

const bigEnemy = {
	speed : 0.8,
	size : 10,
	life : 1200,
	color : "#FF00FF",
	diverge : Math.PI / 3,
	damage : 4
};

const fastEnemy = {
	speed : 2.4,
	size : 5,
	life : 400,
	color : "#FF8000",
	diverge : Math.PI / 6,
	damage : 1
}

const followDistance = 10;


const minDistOfTunaArraw = 50;
const maxDistOfTunaArrow = 120;
const minDistOfShowingArrow = 80;
const D = maxDistOfTunaArrow - minDistOfTunaArraw;
const p = minDistOfShowingArrow - D;
const k = -D * D;
const tunaArrowAngle = Math.PI / 15;
function getTunaArrowDistance(realDistance : number) {
	return k / (realDistance - p) + maxDistOfTunaArrow;
}

declare global {
	interface Window {
		d(i : number) : number
	}
}
window.d = getTunaArrowDistance;


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
		context.font = this.font;
		
		context.fillText(text, x, y);
	}
}

const guideMaxLife = 30;
const guideTextDistance = 60;

const yourMaxSpeed = 0.9;
const viewboxAcc = 0.025;
const viewboxCloseDistance = 20;

class GuideTextGroup {
	readonly texts = [
		new GuideText("땃\u2014쥐!", 0, - guideTextDistance, 20, "bold"),
		new GuideText("Todge", 0, - guideTextDistance + 15, 12, "bold"),
		new GuideText("참치캔을 먹어서", - guideTextDistance, -4, 7, "normal"),
		new GuideText("생명을 유지하세요", - guideTextDistance, 4, 7, "normal"),
		new GuideText("사방에서 몰려오는", guideTextDistance, -4, 7, "normal"),
		new GuideText("철충들을 피하세요", guideTextDistance, 4, 7, "normal"),
		new GuideText("길게 눌러 이동", 0, guideTextDistance, 10, "bold")
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
		context.textAlign = "center";
		context.textBaseline = "middle";
		const a = this.guideLife / guideMaxLife;
		for (const text of this.texts) text.render(context, a);
	}
}

export default class Game {

	readonly timer : Timer


	/** 너 임마, 너. */
	you : You

	/** 적들을 담은 배열 */
	enemies : Enemy[];

	/** 참치캔을 담은 배열 */
	tunas : Tuna[];

	/** 가이드 텍스트 */
	readonly guide : GuideTextGroup = new GuideTextGroup();

	readonly viewbox : Viewbox

	/** 원래 뷰박스에는 속도 속성이 없으므로 움직일 수 있는 어떤 객체가 뷰박스를 대신하는 것으로 한다. 뷰박스를 정의한 의도에 따라서라면 속도 속성을 추가시키는게 좋겠지만, 뷰 계열 클래스는 rAF와는 상관없다. 그게 아니면 뷰박스를 쓰지 말던가... */
	private viewboxReplica = new Moving(yourMaxSpeed, viewboxAcc, viewboxCloseDistance);

	/** 
	 * 외부에서 온 어떤 변환행렬
	 * 아직까지는 입력좌표를 변환하는 데에만 쓰이고 있다. 
	 */
	readonly mat : Matrix2D

	// moveViewboxToTarget : Function
	// viewboxFriction : Function


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
		
		this.timer = new Timer();
		this.init(0);
	}

	
	/** 게임을 처음 상태 (대기 상태)로 돌린다. */
	init(t : DOMHighResTimeStamp) {
		this.status = "free";
		this.you.init();
		this.enemies = [];
		this.tunas = [];
		this.guide.init(t);
		
		this.viewboxReplica.init();
		this.viewbox.setPosition(0, 0);
		
		
		this.enemySpawnCounter = 0;
		this.totalEnemiesNumber = 0;
		this.tunaSpawnCounter = 0;
		this.timer.startTime = t;
		this.timer.currentTime = t;
		this.onPointStart = this._onstartInitial;
		this.update = this.updateInit;
		this.onPointMove = this.noop;
	}

	/** 게임을 시작 상태로 만든다. */
	start(t : DOMHighResTimeStamp) {
		this.status = "start";
		this.timer.start(t);
		this.onPointStart = this._onstartPlaying;
		this.update = this.updatePlay;
		this.onPointMove = this._onPointMoveUpdate;
	}

	/** 게임을 종료 상태로 만든다. */
	gameover(t? : DOMHighResTimeStamp) {
		this.status = "dead";
		this.timer.end(t);
		this.you.moving.removeDestination();
		this.onPointStart = this._onstartDead;
		this.update = this.updateGameover;
		this.onPointMove = this.noop;
	}

	/**
	 * 랜덤으로 오브젝트를 생성한다.
	 */
	createThingRandom() {
		const chance = Math.pow(this.enemySpawnCounter / (maxSpawnDelay + 1), 2);
		const sight = this.you.sight;
		const { x : yourX, y : yourY } = this.you.moving;
		if (Math.random() < chance) {
			const count = Math.floor(Math.random()*varSpawnCount) + minSpawnCount;
			for (let i = 0 ; i < count; i++) {
				let profile : typeof enemy;
				const roll = Math.random();
				if (roll < 0.05) profile = fastEnemy;
				else if (roll < 0.075) profile = bigEnemy;
				else profile = enemy;

				let angle = Math.random() * Math.PI * 2;
				let distance = sight * 1.5;
				let x = yourX + Math.cos(angle) * distance;
				let y = yourY + Math.sin(angle) * distance;
				const thing = new Enemy("enemy", x, y, angle, profile);

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
			this.tunas.push(new Tuna(x, y));
			this.tunaSpawnCounter = 0;
			
		} else {
			this.tunaSpawnCounter++;
		}
	}

	/** 아직 게임이 시작되지 않았을 때 마우스 누름/터치 시작 핸들러 */
	private _onstartInitial(m : PointMessage) {
		this.you.moving.setDestination(...this.mat.itransformPoint(m.startX, m.startY));
		this.start(m.startTime);
	}

	/** 게임 플레이 중 누름 핸들러 */
	private _onstartPlaying(m : PointMessage) {
		this.you.moving.setDestination(...this.mat.itransformPoint(m.startX, m.startY));
	}

	/** 게임오버 되었을 때 누름 핸들러 */
	private _onstartDead(m : PointMessage) {
		this.init(m.startTime);
	}

	onPointStart = this._onstartInitial

	/** 마우스를 놓을 때 */
	onPointEnd(m : PointMessage) {
		this.you.moving.removeDestination();
	}

	/** 아무 것도 하지 않는다. */
	private noop(...a : any) {} 

	/** 게임 플레이 중 입력좌표 업데이트를 받을 때 실행한다. */
	private _onPointMoveUpdate(c : PointState) {
		let [x, y] = this.mat.itransformPoint(c.x, c.y);
		this.you.moving.setDestination(x, y);
	}

	onPointMove: (c : PointState) => void = this.noop;

	/** 뷰박스를 플레이어에게로 옮긴다. */
	moveViewboxToYou() {
		const replica = this.viewboxReplica;
		let viewDistX = this.you.x - this.viewboxReplica.x;
		let viewDistY = this.you.y - this.viewboxReplica.y;
		let distance = Math.hypot(viewDistX, viewDistY);
		if (distance > followDistance) {
			replica.setDestination(this.you.x, this.you.y);
		} else {
			replica.removeDestination();
		}
		replica.update();
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
		
	}

	private updatePlay(t : DOMHighResTimeStamp) {
		this.timer.update(t);
		this.you.update(this);
		this.you.drain();
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
			if (hit(you, enemy)) {
				you.health -= enemy.profile.damage;
				enemy.dispose();
			}
		}
		for (const tuna of this.tunas) {
			if (hit(you, tuna)) {
				you.health = you.maxHealth;
				you.life = you.maxLife;
				tuna.dispose();
			}
		}
	}

	renderCount(context : CanvasRenderingContext2D, x : number, y : number) {
		context.font = '16px "Exo 2"';
		context.fillText(this.totalEnemiesNumber.toString(), x, y);
	}

	renderTunaDirection(context : CanvasRenderingContext2D, x : number, y : number) {
		context.fillStyle = "hsla(45, 100%, 75%, 0.25)";
		const { x: vx, y : vy } = this.viewboxReplica;
		for (const tuna of this.tunas) {
			const dx = tuna.x - vx;
			const dy = tuna.y - vy;
			const distance = Math.hypot(dx, dy);
			if (distance > minDistOfShowingArrow) {
				const nearDist = getTunaArrowDistance(distance);
				const farDist = nearDist + 10;
				const angle = Math.atan2(dy, dx);
				context.beginPath();
				context.moveTo(x + Math.cos(angle) * farDist, y + Math.sin(angle) * farDist);
				context.lineTo(x + Math.cos(angle - tunaArrowAngle) * nearDist, y + Math.sin(angle - tunaArrowAngle) * nearDist);
				context.lineTo(x + Math.cos(angle + tunaArrowAngle) * nearDist, y + Math.sin(angle + tunaArrowAngle) * nearDist);
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

	}

	renderUI(context : CanvasRenderingContext2D) {

		const { velX, velY } = this.viewboxReplica;
		const x = -velX * 4;
		const y = -velY * 4;
		this.you.renderYourUI(context, x, y, followDistance * 4);
		this.renderTunaDirection(context, x, y);


		context.textBaseline = "middle";
		context.fillStyle = "hsla(200, 100%, 70%, 0.25)";
		context.textAlign = 'center';
		this.renderCount(context, x, y - this.viewbox.height / 4);
		this.timer.render(context, x, y + this.viewbox.height / 4);
	}
}
