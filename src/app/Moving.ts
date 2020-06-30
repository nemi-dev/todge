const stopVel = 0.001;

const initState = {
	x : 0,
	y : 0,
	velX : 0,
	velY : 0
}

export class Moving {

	readonly maxSpeed : number
	readonly acc : number
	readonly closeDistance : number
	x : number = 0
	y : number = 0
	velX : number = 0
	velY : number = 0
	destX : number = null
	destY : number = null

	constructor(maxSpeed : number, acc : number, closeDistance : number) {
		this.maxSpeed = maxSpeed;
		this.acc = acc;
		this.closeDistance = closeDistance;
	}

	private moveToTarget() {
		const { x, y, velX, velY, destX, destY, maxSpeed, closeDistance, acc } = this;
		let dx = destX - x;
		let dy = destY - y;
		if (dx != 0 || dy != 0) {
			let angle = Math.atan2(dy, dx);
			let targetVelX = Math.cos(angle) * maxSpeed;
			let targetVelY = Math.sin(angle) * maxSpeed;
			let distance = Math.hypot(dx, dy);
			if (distance < closeDistance) {
				targetVelX *= distance / closeDistance;
				targetVelY *= distance / closeDistance;
			}
			let dVelX = targetVelX - velX;
			let dVelY = targetVelY - velY;
			this.velX += Math.sign(dVelX) * Math.min(Math.abs(dVelX), acc);
			this.velY += Math.sign(dVelY) * Math.min(Math.abs(dVelY), acc);
		}
	}

	private friction() {
		if (Math.abs(this.velX) < stopVel) this.velX = 0;
		else this.velX *= 0.9;
		if (Math.abs(this.velY) < stopVel) this.velY = 0;
		else this.velY *= 0.9;
	}

	init() {
		Object.assign(this, initState);
		this.removeDestination();
	}

	updateVel = this.friction;

	setDestination(x : number, y : number) {
		this.destX = x;
		this.destY = y;
		this.updateVel = this.moveToTarget;
	}

	removeDestination() {
		this.destX = null;
		this.destY = null;
		this.updateVel = this.friction;
	}

	update() {
		this.updateVel();
		this.x += this.velX;
		this.y += this.velY;
	}

}

// export function moveToTarget(this : DesiredPhysical, maxSpeed : number, acc : number, closeDistance : number) {
// 	let { x, y, velX, velY, destX, destY } = this;
// 	let dx = destX - x;
// 	let dy = destY - y;
// 	if (dx != 0 || dy != 0) {
// 		let angle = Math.atan2(dy, dx);
// 		let targetVelX = Math.cos(angle) * maxSpeed;
// 		let targetVelY = Math.sin(angle) * maxSpeed;
// 		let distance = Math.hypot(dx, dy);
// 		if (distance < closeDistance) {
// 			targetVelX *= distance / closeDistance;
// 			targetVelY *= distance / closeDistance;
// 		}
// 		let dVelX = targetVelX - velX;
// 		let dVelY = targetVelY - velY;
// 		this.velX += Math.sign(dVelX) * Math.min(Math.abs(dVelX), acc);
// 		this.velY += Math.sign(dVelY) * Math.min(Math.abs(dVelY), acc);
// 	}
// }

// export function friction(this : DesiredPhysical, stopVel = 0.001) {
// 	this.velX *= 0.9;
// 	if (Math.abs(this.velX) < stopVel) this.velX = 0;
// 	this.velY *= 0.9;
// 	if (Math.abs(this.velY) < stopVel) this.velY = 0;
// }
