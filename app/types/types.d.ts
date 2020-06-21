declare interface CoordinateState {
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

declare interface CoordMessage {
	type : "mousedown" | "mouseup" | "touchstart" | "touchend"

	id : number

	startX? : number
	startY? : number
	startTime? : DOMHighResTimeStamp

	endX? : number
	endY? : number
	endTime? : DOMHighResTimeStamp
}

declare interface Listener {
	push(m : CoordMessage) : void
	dispatchAll() : void
	dispatchDrag(m : CoordinateState) : void
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

