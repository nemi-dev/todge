import Matrix2D from './Matrix2D';
import { CoordinateState } from './Input';

export class Model {
	path: Point[] = [];

	messages: CoordMessage[] = [];
	mat : Matrix2D

	color: string = "#0000FF";

	push(m: CoordMessage) {
		this.messages.unshift(m);
	}

	dispatchAll() {
		let m: CoordMessage;
		let x: number;
		let y: number;
		while ((m = this.messages.pop()) != null) {
			switch (m.type) {
				case "mousedown":
					[x, y] = this.mat.itransformPoint(m.startX, m.startY);
					this.color = "#FF0000";
					this.path.push({ x, y, color: this.color, opacity: 1, velX: 0, velY: 0 });
					break;
				case "mouseup":
					[x, y] = this.mat.itransformPoint(m.endX, m.endY);
					this.color = "#0000FF";
					this.path.push({ x, y, color: this.color, opacity: 1, velX: 0, velY: 0 });
					break;
			}
		}
	}

	update(c: CoordinateState) {

		for (let i = 0; i < this.path.length; i++) {
			let point = this.path[i];
			point.opacity -= .0078125;
			point.x += point.velX;
			point.y += point.velY + 0.5;
			if (point.opacity <= 0) {
				this.path.splice(i, 1);
				i -= 1;
			}
		}
		let max = this.path.length;
		for (let i = 1; i < max; i++) {
			let { x, y } = this.path[i];
			let before = this.path[i - 1];
			let { x: beforeX, y: beforeY } = before;
			before.velX = (x - beforeX) / 10;
			before.velY = (y - beforeY) / 10;
		}
		let [x, y] = this.mat.itransformPoint(c.x, c.y);
		let velX = (c.moveX) / 10;
		let velY = (c.moveY) / 10;
		this.path.push({ x, y, color: this.color, opacity: 1.0078125, velX, velY });

	}

	render(context: CanvasRenderingContext2D) {
		let max = this.path.length - 1;
		context.lineCap = "round";
		for (let i = 2; i < max; i++) {
			let { x, y, color, opacity } = this.path[i];
			let { x: beforeX, y: beforeY } = this.path[i - 1];
			let { x: beforebeforeX, y: beforebeforeY } = this.path[i - 2];
			let startX = (beforebeforeX + beforeX) / 2;
			let startY = (beforebeforeY + beforeY) / 2;
			let endX = (beforeX + x) / 2;
			let endY = (beforeY + y) / 2;
			context.beginPath();
			context.strokeStyle = color;

			context.lineWidth = (1 / (1.61803 - opacity) - 0.618034) * 4;

			context.moveTo(startX, startY);
			context.quadraticCurveTo(beforeX, beforeY, endX, endY);
			context.stroke();
		}
	}
}
