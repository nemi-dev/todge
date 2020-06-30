/*
	@update 2020-06-25
	하나의 이니셰이티브에서 리스너는 게임(Game 객체)하나로 국한된다. 따라서 리스너는 오직 하나다. 이니셰이티브 종속적인 컴포넌트로 까지 떨어뜨릴 수도 있지만.... 그렇겐 하지말자 ㅎㅎ
*/

/**
 * 전적으로 rAF-Sync를 위해 표현되는 위치 객체로, 현재 rAF에서의 위치와 직전 rAF에서의 위치를 나타낸다.  
 * 직전 "이벤트"의 위치가 아닌 직전 "rAF"인 것에 주의할 것!
 * */
export class PointState {


	/** 임시적으로 캡쳐한 입력 X좌표 */
	private inputX : number
	/** 임시적으로 캡쳐한 입력 Y좌표 */
	private inputY : number

	/*
	 * inputX, inputY는 드래그를 하는 한에서는 현재 위치로 사용될 수 있으나,
	 * 드래그, 터치 스와이프를 하지 않는 동안에는 마지막으로 마우스 이벤트가 일어난 지점이 계속 저장되어 있다.
	 * 게다가 update()에서 dispatch와 pulse는 마우스 눌림 여부와 관계없이 항상 실행된다.
	 * 따라서 inputX, inputY는 "현재"를 나타내기에는 부적절하고, "현재 값"을 나타내기 위한 또 다른 속성이 필요하다.
	*/
	/** "현재" X좌표 */
	private currentX : number
	/** "현재" Y좌표 */
	private currentY : number

	/** 직전 rAF에서 X좌표 */
	private _beforeX : number
	/** 직전 rAF에서 y좌표 */
	private _beforeY : number

	/** @readonly 현재 x좌표 */
	get x() { return this.currentX }
	/** @readonly 현재 y좌표 */
	get y() { return this.currentY }

	/** @readonly 직전 rAF에서 X좌표 */
	get beforeX() { return this._beforeX }
	/** @readonly 직전 rAF에서 y좌표 */
	get beforeY() { return this._beforeY }

	/** @readonly 직전 rAF에서 현재 rAF까지의 x 변위 */
	get moveX() {
		return (this.beforeX != null) && (this.currentX != null)? (this.currentX - this._beforeX) : 0;
	}
	/** @readonly 직전 rAF에서 현재 rAF까지의 y 변위 */
	get moveY() {
		return (this.beforeY != null) && (this.currentY != null)? (this.currentY - this._beforeY) : 0;
	}

	/** 쌩 입력값을 이것으로 한다. */
	input(x : number, y : number) {
		this.inputX = x;
		this.inputY = y;
	}

	/** current 값을 강제로 주어진 값으로 한다.
	 * 이렇게 하면 마우스 눌림/터치 시작 때 pulse가 실행되면 입력된 값들이 before 값으로 떨어지게 된다. */
	shim(x : number, y : number) {
		this.currentX = x;
		this.currentY = y;
	}

	/** 현재 상태를 이전 상태로, 쌩 입력 좌표를 현재 상태로 전이시킨다. */
	pulse() : void {
		this._beforeX = this.currentX;
		this._beforeY = this.currentY;
		
		this.currentX = this.inputX;
		this.currentY = this.inputY;
	}
}

/** 입력 인터페이스를 눈치껏 알아채는 객체 */
export class Detector {

	private detected = false;
	private disconnect() {
		document.removeEventListener('mousedown', this.mouse);
		document.removeEventListener('touchstart', this.touch);
		this.detected = true;
	}

	private mouse : (ev : MouseEvent) => void
	private touch : (ev : TouchEvent) => void

	public whenItsMouse : (ev : MouseEvent) => void
	public whenItsTouch : (ev : TouchEvent) => void

	open() {
		if (this.detected) return; 
		this.mouse = ev => {
			this.whenItsMouse(ev);
			this.disconnect();
		};
		this.touch = ev => {
			this.whenItsTouch(ev);
			this.disconnect();
		}
		document.addEventListener('mousedown', this.mouse);
		document.addEventListener('touchstart', this.touch);
	}

}

class PointMessageQueue {

	private readonly messageQueue : PointMessage[] = [];

	protected listener : PointInputListener

	push(m : PointMessage) {
		this.messageQueue.unshift(m);
	}

	dispatchAll() {
		let m : PointMessage
		while ((m = this.messageQueue.pop()) != null) {
			switch (m.type) {
				case "pointstart":
					this.listener.onPointStart(m);
					break;
				case "pointend":
					this.listener.onPointEnd(m);
					break;
			}
		}
	}
}

/**
 * 마우스 입력을 받아들여서 리스너에게 전달하는 클래스  
 * 이 클래스는 requestAnimationFrame()을 사용한 업데이트 패턴에 특화된 구조를 가지고 있다.  
 * 중요하고 양이 비교적 적은 이벤트(마우스 누름, 마우스 놓음)는 매 이벤트 루프마다 놓치지 않고 캡쳐해 두고, 압도적으로 많이 발생하고 중요하지 않은 이벤트(마우스 움직임)는 변화에 따라 "현재 상태"와 "직전 상태"만을 저장해 두고 rAF에서 그 상태를 참조하도록 하고 있다.  
 * 이 입력 객체는 특히 "마우스를 누를 때"에만 실제 좌표를 전달한다.
 * 그리고 사실 이벤트 큐 처리와 rAF는 (거의) 같은 사이클에 일어난다. 스로틀링 같은 걸 일으키는 똥컴이 아니라면 말이지...
 */
export class MouseInput extends PointMessageQueue {

	/** 이벤트를 발생시키는 HTML 엘리먼트 */
	private source : HTMLElement

	/** (rAF?) 지금 누르고 있는 버튼 */
	private buttons = 0;

	/**
	 * 마우스 누름 발생 시, 언젠가 발생할 마우스 떼기에 대응하여 임시로 메시지를 만들어 저장해 둘 배열
	 * messagePool[n]은 n번 마우스 버튼 누름에 대응하는 임시 마우스 떼기 메시지이다.
	 * n번 마우스 버튼 떼기가 발생하면 messagePool[n]에 있는 메시지를 꺼내서 end 값을 입력하고 큐에 넣는다.
	 * */
	private readonly messageCache : PointMessage[] = [];

	/** rAF 발생 당시 마우스 누름 중일 때 사용할 수 있는 좌표 컴포넌트 */
	public readonly point = new PointState();

	/**
	 * 마우스 누름 이벤트 발생 시 실행된다.
	 * 화살표 함수로 만들어놓지 않으면 TypeScript 버그 때문인지, 놓친 게 있는지는 모르겠지만 this 바인딩이 제대로 되지 않는다는 문제가 있다.
	 * */
	private readonly onstart = (ev : MouseEvent) => {
		ev.preventDefault();

		this.buttons = ev.buttons;
		let {
			offsetX : startX,
			offsetY : startY,
			button : id,
			timeStamp : startTime
		} = ev;

		/* 
		이전 위치와 현재 위치를 마우스 누름 위치로 한다. 이 두 줄은 다음과 같은 상황이 있을 때를 대비하고 있다.

		1. 클릭/터치 시작과 rAF 사이에 움직임이 있을 수 있다.
		2. 클릭/터치 시작과 끝 사이에 움직임이 없다.
		*/
		this.point.shim(startX, startY);
		this.point.input(startX, startY);

		/* 메시지 큐에 클릭/터치 시작 메시지를 추가한다. 이것은 그야말로 rAF와 이벤트 간의 불협화음이 있을거라 생각하고 만들었기 때문에 수정이 필요해 보인다. */
		this.push({ type : "pointstart", id, startX, startY, startTime });
		
		/** 나중에 클릭/터치가 끝이 났을 때 짝(해당하는 마우스 버튼/ 터치 ID)이 맞는 메시지를 디스패치하기 위해 클릭/터치 끝 메시지를 미리 만들어 놓는다. */
		this.messageCache[id] = { type : "pointend", id, startX, startY, startTime };

		return false;
	}

	/** 마우스 누름 여부와 상관없이 마우스를 움직일 때 실행된다. */
	private readonly onmove = (ev : MouseEvent) => {
		this.point.input(ev.offsetX, ev.offsetY);
	}

	private readonly onend = (ev : MouseEvent) => {
		this.buttons = ev.buttons;
		/* mouseup 이벤트는 버블 가능하므로 리스너가 도큐먼트에 연결되어 있어도 eventTarget이 source이면 offset값은 여전히 source에 상대적인 위치가 된다. */
		let x = ev.offsetX;
		let y = ev.offsetY;

		// 마우스 누름 당시 저장했던 마우스 놓기 메시지를 가져온다.
		let message = this.messageCache[ev.button];
		delete this.messageCache[ev.button];
		if (message) {
			message.endX = x;
			message.endY = y;
			message.endTime = ev.timeStamp;
			this.push(message);			
			this.point.input(x, y);
		}
	}

	/** 입력 컴포넌트를 뷰에 연결한다. */
	connect (source : HTMLElement, listener : PointInputListener) {
		this.disconnect();
		this.source = source;
		this.listener = listener;
		this.source.addEventListener('mousedown', this.onstart);
		this.source.addEventListener('mousemove', this.onmove);
		document.addEventListener('mouseup', this.onend);
	}

	/** 입력 컴포넌트 연결을 해제한다. */
	disconnect () {
		let source = this.source;
		if (source) {
			source.removeEventListener('mousedown', this.onstart);
			source.removeEventListener('mousemove', this.onmove);
			document.removeEventListener('mouseup', this.onend);
		}
		this.source = null;
		this.listener = null;
	}

	/**
	 * (rAF) 큐에 있는 메시지를 모두 정리하고, 상태를 전이시킨다.
	 * 
	 * **중요 : 메시지 큐, 메시지 버퍼에 쌓인 것들은 rAF와 독립적으로 발생한 것들이다. 따라서 메시지는 pointState와는 좆도 상관없다.**
	 * */
	update() {
		this.dispatchAll();
		this.point.pulse();
		if (this.buttons) this.listener.onPointMove(this.point);
	}

}

/**
 * 터치 입력을 받아들여 메시지를 처리하고 리스너에게 전달하는 컴포넌트
 * 
 * 이 객체는 터치 움직임에 따라 이전 위치를 저장하여 터치의 움직임을 추적할 수 있으며, requestAnimationFrame()을 사용한 업데이트 패턴에 특화된 구조를 가지고 있다.
 * 
 * MouseInput 객체와 거의 같으나 아주 미세한 곳에서 차이가 있다.
 * 
 * 1. 터치 입력을 받아들인다. 물론 붙이는 리스너도 touchstart, touchend로 결정된다.
 * 2. 터치 이벤트의 구조가 다르다. 터치는 여러 개가 있을 수 있고, 마우스와 달리 모두 다른 곳에 위치해 있을 수 있다. 
 */
export class TouchInput extends PointMessageQueue {
	private source : HTMLElement

	/** Touch 객체는 offsetX를 가지고 있지 않다. 결국 pageX를 써야 한다는 것인데, 입력을 받아들이는 엘리먼트의 왼쪽 위를 기준으로 하려면 추가적으로 엘리먼트의 좌표를 알고 있어야 한다. 또한, 이 값들은 입력 객체 연결 시에만 초기화되기 때문에 연결 후에 엘리먼트의 위치가 바뀌지 않는다는 가정도 포함되어 있다. 엘리먼트의 위치가 바뀌어도 입력 위치가 적절히 조율되도록 하려면 이 속성들을 빼고 거의 모든 이벤트 핸들러에서 getBoundingClientRect()를 사용하애 한다. 아니면 위치가 바뀌는걸 눈치껏 알아채는 방법을 쓰든가... */
	private sourceLeft : number
	private sourceTop : number

	private readonly messageCache : PointMessage[] = []

	/**
	 * 마우스는 항상 하나의 좌표지만 터치는 언제 어디서 어떤 터치가 생길지, 없어질지 모른다.
	 * 근데 메인 터치는 있어야 하는 법이고, 갑자기 메인 터치가 없어지면 여기 있던 놈들 중에서 한 녀석이 메인 터치를 계승한다.
	 * */
	private readonly touchStateMap : PointState[] = []

	/** @private 메인 터치의 위치 */
	private _point : PointState = null;

	/** @readonly 메인 터치의 위치 */
	get point() { return this._point };

	
	public readonly onstart = (ev : TouchEvent) => {
		ev.preventDefault();

		const startTime = ev.timeStamp;
		let touchList = ev.changedTouches;

		for (const touch of touchList) {
			let startX = (touch.pageX - this.sourceLeft);
			let startY = (touch.pageY - this.sourceTop);
			let id = touch.identifier;

			let state = new PointState();
			state.input(startX, startY);
			state.shim(startX, startY);
			this.touchStateMap[id] = state;

			// 메인 터치가 없었다면 이 터치를 메인 터치로 설정한다.
			if (!this.point) this._point = state;

			this.push({ type : "pointstart", id, startX, startY, startTime });
			this.messageCache[id] = { type : "pointend", id, startX, startY, startTime };

		}

		return false;
	}

	public readonly onmove = (ev : TouchEvent) => {
		for (const touch of ev.changedTouches) {
			if (touch.identifier in this.touchStateMap)	{
				const state = this.touchStateMap[touch.identifier];
				let x = (touch.pageX - this.sourceLeft);
				let y = (touch.pageY - this.sourceTop);
				state.input(x, y);
			}
		}
	}

	public readonly onend = (ev : TouchEvent) => {
		for (const touch of ev.changedTouches) {
			if (touch.identifier in this.touchStateMap)	{
				const message = this.messageCache[touch.identifier];
				delete this.messageCache[touch.identifier];
				if (message) {

					const state = this.touchStateMap[touch.identifier];

					const x = (touch.pageX - this.sourceLeft);
					const y = (touch.pageY - this.sourceTop);


					message.endX = x;
					message.endY = y;
					message.endTime = ev.timeStamp;

					this.push(message);

					state.input(x, y);

					// 놓은 위치의 터치 위치 상태를 뺀다.
					delete this.touchStateMap[touch.identifier];
					// 메이저 터치가 빠졌으면 후계자를 찾는다.
					if (this.point == state) {
						this._point = null;
						for (const i in this.touchStateMap) {
							if (this.touchStateMap.hasOwnProperty(i)) {
								this._point = this.touchStateMap[i];
								break;
							}
						}
					}
				}
					
			}
		}
	}

	connect(source : HTMLElement, listener : PointInputListener) {
		this.disconnect();
		this.source = source;
		this.listener = listener;
		this.source.addEventListener('touchstart', this.onstart);
		this.source.addEventListener('touchmove', this.onmove);
		document.addEventListener('touchend', this.onend);
		let { left, top } = source.getBoundingClientRect();
		this.sourceLeft = left;
		this.sourceTop = top;
	}

	disconnect() {
		let source = this.source;
		if (source) {
			source.removeEventListener('touchstart', this.onstart);
			source.removeEventListener('touchmove', this.onmove);
			document.removeEventListener('touchend', this.onend);
		}
		this.source = null;
		this.listener = null;
	}

	update() {
		this.dispatchAll();
		for (const i in this.touchStateMap) this.touchStateMap[i].pulse();
		if (this._point) this.listener.onPointMove(this._point);
		
	}
}
