export function moveToTarget(this : DesiredPhysical, maxSpeed : number, acc : number, closeDistance : number) {
	let { x, y, velX, velY, destX, destY } = this;
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

export function friction(this : DesiredPhysical, stopVel = 0.001) {
	this.velX *= 0.9;
	if (Math.abs(this.velX) < stopVel) this.velX = 0;
	this.velY *= 0.9;
	if (Math.abs(this.velY) < stopVel) this.velY = 0;
}
