/** 마이크로초를 mm : ss . ss 로 나눈다. */
function formatMs(ms : number) {
	let val = Math.round(ms / 10);
	let min = Math.floor(val / 6000);
	let centisec = val % 6000;
	
	let centisec_str = centisec.toString();
	let centisec_len = centisec_str.length;

	if (centisec_len < 4) {
		let a = Array(4 - centisec_len);
		a.fill('0');
		centisec_str = a.join('') + centisec_str;
	}

	let min_str = min.toString();
	let min_len = min_str.length;

	if (min_len < 2) {
		let a = Array(2 - min_len);
		a.fill('0');
		min_str = a.join('') + min_str;
	}

	return [min_str, centisec_str.substr(0, 2), centisec_str.substr(2, 2)];

}

const timerWidth = 56;
const w_3 = timerWidth / 3;
const w_6 = timerWidth / 6;
const timerFontSize = 12;

/**
 * 타이머 컴포넌트
 * DOMHighResTimestamp 때문에 로직이 은근 복잡하다.
 * */
export default class Timer {

	/** 시작 버튼을 누른 시각 */
	startTime : DOMHighResTimeStamp = null;

	/** 퍼즐이 중단된 시각 */
	endTime : DOMHighResTimeStamp = null;

	/** rAF에 의해 입력되는 시각 */
	currentTime : DOMHighResTimeStamp = 0;

	start(startTime : DOMHighResTimeStamp) {
		this.startTime = startTime;
		this.endTime = null;
	}

	end(endTime : DOMHighResTimeStamp) {
		this.endTime = endTime;
	}

	reset() {
		this.startTime = null;
		this.endTime = null;
		this.currentTime = null;
	}

	update (t : DOMHighResTimeStamp) {
		this.currentTime = t;
	}

	render (context : CanvasRenderingContext2D, x : number, y : number) {
		
		let left = x - timerWidth / 2;
		
		context.font = timerFontSize + 'px "Exo 2"';
		
		let [min, sec, cs] = formatMs(this.currentTime - this.startTime);

		context.fillText(min, left + w_6, y);
		context.fillText('\'', left + w_3, y);
		context.fillText('"', left + w_3 * 2 , y);

		context.textAlign = 'right';
		context.fillText(sec[0], left + w_3 + w_6, y);
		context.fillText(cs[0], left + w_3 * 2 + w_6, y);

		context.textAlign = 'left';
		context.fillText(sec[1], left + w_3 + w_6, y);
		context.fillText(cs[1], left + w_3 * 2 + w_6, y);
		
	}

}