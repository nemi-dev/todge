import { View } from './View';
import { MouseInput, TouchInput } from './Input';
import Game from './Game';
import RAFPulseClock from './RAFPulseClock';
import { isTouchDevice } from './touchscreen';

const gameElement = document.getElementById('game-frame');
gameElement.addEventListener('contextmenu', ev => {
	ev.preventDefault();
	return false;
}, { capture : true });

const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
gameCanvas.getContext('2d').setTransform(1, 0, 0, 1, gameCanvas.width / 2, gameCanvas.height / 2);

const uiCanvas = document.getElementById('ui-canvas') as HTMLCanvasElement;
uiCanvas.getContext('2d').setTransform(1, 0, 0, 1, uiCanvas.width / 2, uiCanvas.height / 2);

const gameView = new View(gameCanvas);
gameView.context.imageSmoothingEnabled = false;

const uiView = new View(uiCanvas);

const game = new Game(gameView.viewbox);

let input : MouseInput | TouchInput;
if (isTouchDevice()) {
	input = new TouchInput();
	input.connect(gameElement, game);
} else {
	input = new MouseInput();
	input.connect(gameElement, game);
}

function fitSize() {
	let w : number, h : number;
	let viewRatio = gameView.width / gameView.height;
	if (window.innerWidth / window.innerHeight > viewRatio) {
		h = window.innerHeight;
		w = h * viewRatio;
	} else {
		w = window.innerWidth;
		h = w / viewRatio;
	}
	gameElement.style.cssText = `width:${w}px;height:${h}px;`;
	gameView.setViewSize(w);
	uiView.setViewSize(w);
	
}

window.addEventListener('resize', fitSize);
window.addEventListener('load', fitSize);

const gridStep = 20;

function renderGrid(view : View) {
	let { viewbox, context } = view;
	const { left, right, top, bottom } = viewbox;
	const startX = (Math.round(left / gridStep) - 1) * gridStep;
	const startY = (Math.round(top / gridStep) - 1) * gridStep;
	const endX = (Math.round(right / gridStep) + 1) * gridStep;
	const endY = (Math.round(bottom / gridStep) + 1) * gridStep;
	context.fillStyle = "#80808040";
	for (let x = startX; x < endX; x += gridStep) {
		for (let y = startY; y < endY; y += gridStep) {
			context.fillRect(x - 1, y - 1, 2, 2);
		}
	}
	// context.fillStyle = "#80808020";
	// for (let x = startX; x < endX; x += gridStep) {
	// 	for (let y = startY; y < endY; y += gridStep) {
	// 		let x_ = x + (x - viewboxX) / 10;
	// 		let y_ = y + (y - viewboxY) / 10;
	// 		context.fillRect(x_ - 2, y_ - 2, 4, 4);
	// 	}
	// }

}

const clock = new RAFPulseClock(t => {
	input.update();
	game.hitTest();
	game.update(t);

	gameView.clearRect();
	renderGrid(gameView);
	game.render(gameView.context);
	
	uiView.clearRect();
	game.renderUI(uiView.context);
});

clock.start();
