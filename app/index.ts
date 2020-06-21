import { View } from './View';
import { MouseInput } from './Input';
import Game from './Game';
import RAFPulseClock from './RAFPulseClock';

const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
gameCanvas.getContext('2d').setTransform(1, 0, 0, 1, 120, 160);

gameCanvas.addEventListener('contextmenu', ev => {
	ev.preventDefault();
	return false;
});

const statusCanvas = document.getElementById('timer-canvas') as HTMLCanvasElement;
const statusContext = statusCanvas.getContext('2d');
statusContext.textBaseline = 'middle';
statusContext.fillStyle = '#FFFFFF';

const view = new View(gameCanvas);
view.setViewSize(360);

const game = new Game(view.viewbox);

const input = new MouseInput();
input.connect(view.canvas, game);


function fitSize() {
	let w : number, h : number;
	let viewRatio = view.width / view.height;
	if (window.innerWidth / window.innerHeight > viewRatio) {
		h = window.innerHeight * 0.8;
		w = h * viewRatio;
	} else {
		w = window.innerWidth * 0.8;
		h = w / viewRatio;
	}
	view.setViewSize(w);
}

window.addEventListener('resize', fitSize);
window.addEventListener('load', fitSize);

const gridStep = 20;

function renderGrid(view : View) {
	let { viewbox, context } = view;
	const { left, right, top, bottom, x: viewboxX, y : viewboxY } = viewbox;
	const startX = (Math.round(left / gridStep) - 1) * gridStep;
	const startY = (Math.round(top / gridStep) - 1) * gridStep;
	const endX = (Math.round(right / gridStep) + 1) * gridStep;
	const endY = (Math.round(bottom / gridStep) + 1) * gridStep;
	context.fillStyle = '#80808040';
	for (let x = startX; x < endX; x += gridStep) {
		for (let y = startY; y < endY; y += gridStep) {
			context.fillRect(x - 1, y - 1, 2, 2);
		}
	}
	
	context.fillStyle = '#80808020';
	for (let x = startX; x < endX; x += gridStep) {
		for (let y = startY; y < endY; y += gridStep) {
			let x_ = x + (x - viewboxX) / 10;
			let y_ = y + (y - viewboxY) / 10;
			context.fillRect(x_ - 2, y_ - 2, 4, 4);
		}
	}

}

const clock = new RAFPulseClock(t => {
	input.update();
	game.hitTest();
	game.update(t);

	view.viewbox.clearRect();
	renderGrid(view);
	game.render(view.context);

});

clock.start();

