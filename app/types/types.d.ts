declare interface PointState {
	readonly x : number
	readonly y : number
	readonly beforeX : number
	readonly beforeY : number
	readonly moveX : number
	readonly moveY : number
	input(x : number, y : number) : void
	shim(x : number, y : number) : void
	pulse() : void
}

declare interface PointMessage {
	type : "mousedown" | "mouseup" | "touchstart" | "touchend"

	id : number

	startX? : number
	startY? : number
	startTime? : DOMHighResTimeStamp

	endX? : number
	endY? : number
	endTime? : DOMHighResTimeStamp
}

declare interface PointInputListener {
	onPointStart(m : PointMessage) : void
	onPointMove(m : PointState) : void
	onPointEnd(m : PointMessage) : void
}

declare interface Physical {
	x : number
	y : number
	velX : number
	velY : number
}

declare interface DesiredPhysical extends Physical {
	destX : number
	destY : number
}

