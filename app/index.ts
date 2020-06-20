import { View } from './View';
import { MouseInput } from './Input';
import { Model } from './Model';

const canvas = document.getElementsByTagName('canvas')[0];
canvas.getContext('2d').setTransform(1, 0, 0, 1, 60, 80);

export const view = new View(canvas);
view.setViewSize(360);

const model = new Model();
model.mat = view.viewbox.matrix;

const input = new MouseInput();
input.connect(view.canvas, model);


// function handleResize() {
// 	let w : number, h : number;
// 	if (window.innerWidth / window.innerHeight > 3 / 4) {
// 		h = window.innerHeight - 64;
// 		w = h * 3 / 4;
// 	} else {
// 		w = window.innerWidth - 64;
// 		h = w * 4 / 3;
// 	}
// 	view.setViewSize(w);
// }

// window.addEventListener('resize', handleResize);
// window.addEventListener('load', handleResize);











function rAF(t? : number) {
	input.update();
	model.update(input.coordinate);
	view.viewbox.clearRect();
	model.render(view.context);
	requestAnimationFrame(rAF);
}

rAF();

(window as (Window & typeof globalThis & { view : View })).view = view;
