import Matrix2D from "./Matrix2D"

export class Viewbox {

	/** setSize는 어떤 방식으로든 원본 뷰의 크기가 필요하다. Viewbox란 것은 원본 캔버스의 크기와 캔버스의 변환행렬로부터 유도되는 것이기 때문. */
	private readonly view : View

	/** 주인 뷰가 보는 컨텍스트와 같음 */
	private readonly context : CanvasRenderingContext2D

	public readonly matrix : Matrix2D
	/**
	 * 원래라면 Canvas의 크기와 DOMMatrix의 값으로 유도되는 가상의 속성들이나, 값을 쓰는 것보다 읽는 것이 더 많을 거이라 판단하여 속성을 따로 저장해둔다.
	 */
	
	private _left : number
	private _top : number
	private _width : number
	private _height : number

	constructor(view : View, context : CanvasRenderingContext2D, rWidth : number, rHeight : number) {
		this.view = view;
		this.context = context;

		// View 클래스는 캔버스 여러분이 가지고 있던 기존의 변환 행렬을 존중합니다!!
		let { a, d, e, f } = this.context.getTransform();
		this.matrix = new Matrix2D(a, d, e, f);
		this._width = rWidth / a;
		this._height = rHeight / d;

		this._left = - e;
		this._top = - f;

	}

	get left() { return this._left; }
	get top() { return this._top; }

	get width() { return this._width; }
	get height() { return this._height; }

	get x() { return this._left + this._width / 2; }
	get y() { return this._top + this._height / 2; }

	get right() { return this._left + this._width; }
	get bottom() { return this._top + this._height; }
	
	/** 뷰박스의 가운데가 지정한 좌표값이 되도록 뷰박스를 이동시킨다. */
	setPosition(x : number = null, y : number = null) : void {
		const matrix = this.matrix;
		let { a, d } = matrix;
		if (x != null) this._left = x - this._width / 2;
		if (y != null) this._top = y - this._height / 2;

		matrix.e = - this._left * a;
		matrix.f = - this._top * d;
		this.context.setTransform(a, 0, 0, d, matrix.e, matrix.f);
	}

	/** 뷰박스를 이동시킨다.
	 * 신기하게도 Context.translate는 입력값 만큼만 변환시키는 것이 아니라 변환행렬의 다른 값들이 함께 적용된다. */
	move(dx : number, dy : number) {
		const matrix = this.matrix;
		matrix.e += - dx * matrix.a;
		matrix.f += - dy * matrix.d;
		this.context.translate(-dx, -dy);
	}

	/**
	 * 뷰박스의 크기를 설정한다.
	 * height가 없으면 __뷰(캔버스)의 종횡 비율__이 적용된다.  
	 * 아무런 인수가 없으면 기존의 width가 적용된다.  
	 * */
	setSize(width? : number, height? : number) {
		let { x, y } = this;
		(width != null)? this._width = width : width = this._width;
		if (height == null) height = width * this.view.height / this.view.width;
		this._height = height;

		this._left = x - width / 2;
		this._top = y - height / 2;

		let a = this.view.width / width;
		let d = this.view.height / height;
		let e = - this._left * a;
		let f = - this._top * d;
		Object.assign(this.matrix, { a, d, e, f });

		this.context.setTransform(a, 0, 0, d, e, f);
	}

	/** 뷰박스가 보고 있는 곳을 청소한다. */
	clearRect() {
		this.context.clearRect(this._left - 5, this._top - 5, this._width + 10, this._height + 10);
	}
}


/**
 * 기본적으로는 캔버스와 같으나, 뷰포트(Viewport)를 고려하여 크기 조절 시 컨텍스트의 변환 행렬을 조절하는 기능을 추가로 갖고 있다. 이러한 사양 때문에 실제 크기 속성을 함께 가지고 있다.
 */
export class View {

	readonly canvas : HTMLCanvasElement
	readonly context : CanvasRenderingContext2D

	readonly viewbox : Viewbox

	/**
	 * 뷰에 입력된 실제 길이  
	 * HTML canvas의 width, height는 반드시 정수로 저장되기 때문에 정확도를 잃을 수 있다.
	 * */
	private rWidth : number
	private rHeight : number

	get width() { return this.rWidth; }
	get height() { return this.rHeight; }

	/**
	 * 캔버스를 기반으로 뷰를 생성한다.  
	 * 기존에 설정되어 있던 변환행렬을 기반으로 위치, 배율이 현재 객체에 자동으로 등록된다.
	 */
	constructor(canvas : HTMLCanvasElement) {

		this.canvas = canvas;
		this.context = canvas.getContext('2d');

		this.rWidth = this.canvas.width;
		this.rHeight = this.canvas.height;

		this.viewbox = new Viewbox(this, this.context, this.rWidth, this.rHeight);

	}


	/**
	 * 뷰(캔버스)의 크기를 변경하고, 뷰박스 크기는 변경되지 않도록 context의 변환행렬 값을 적절한 것으로 채워 넣는다.
	 * height가 없으면 현재 뷰(캔버스)의 width 변화에 비례한 값이 자동 설정된다.
	 * */
	setViewSize(width : number, height? : number) {
		if (height == null) height = width * this.rHeight / this.rWidth;

		this.rWidth = width;
		this.rHeight = height;

		this.canvas.width = width;
		this.canvas.height = height;

		this.viewbox.setSize();
	}

}