/**
 * 이렇게 생긴 행렬을 나타낸다:
 *
 * ````plaintext
 * a 0 e
 * 0 d f
 * 0 0 1
 * ````
 * skew는 고려대상이 아니므로 b, c는 뺐다.
 */
export default class Matrix2D {

	a = 1
	d = 1
	e = 0
	f = 0

	constructor(a: number, d: number, e: number, f: number) {
		this.a = a;
		this.d = d;
		this.e = e;
		this.f = f;
	}
	/** 모델 상에서의 어떤 지점이 뷰에 나타나는 위치 */
	transformPoint(x : number, y : number) : [number, number] {
		let { a, d, e, f } = this;
		return [x*a + e, y*d + f];
	}

	/** 뷰의 어떤 지점을 찍었을 때 그 점의 모델 상에서의 위치 */
	itransformPoint(x : number, y : number) : [number, number] {
		let { a, d, e, f } = this;
		return [ (x-e)/a, (y-f)/d ];
	}

	/** 모델 상의 두 지점이 뷰에 나타날 때 두 점의 변위의 각 성분 */
	transformDimension(w : number, h : number) : [number, number] {
		let { a, d } = this;
		return [w * a, h * d];
	}

	/** 뷰에 나타난 변위의 각 성분의 모델에서의 길이 */
	itransformDimension(w : number, h : number) : [number, number] {
		let { a, d } = this;
		return [w / a, h / d];
	}
}

