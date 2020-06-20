/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./app/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app/Input.ts":
/*!**********************!*\
  !*** ./app/Input.ts ***!
  \**********************/
/*! exports provided: CoordinateState, Detector, MouseInput, TouchInput */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"CoordinateState\", function() { return CoordinateState; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Detector\", function() { return Detector; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"MouseInput\", function() { return MouseInput; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"TouchInput\", function() { return TouchInput; });\n/*\n 리스너를 여러 개로 만들려면 다음 중 하나는 해야 한다.\n \n - 리스너가 독자적인 큐를 갖도록 하기\n 중앙 집중적 큐를 사용하는 이유는 메시지 우선(메시지 1을 리스너 1에게 디스패치, 메시지 1을 리스너 2에게 디스패치, ...)으로 업데이트하기 위함이다.\n 리스너 중심으로 메시지를 직접 처리하는 것보다 상태 전이가 더 용이할 수 있기 때문 (아닐 수도 있고. 이건 정말로 use-cases에 따라 다르다.)\n 그러나 이렇게 하면서도 acceptCoordinate까지 쓰려면 어떤 리스너들에 대해서는 메시지를 스킵해야 한다. 어떤 입력에 대해서 리스너가 받아들일수도, 안받아들일수도 있기 때문. 그러려면 또다시 받아들일 것인지 말것인지 여부를 판단해야 하는데 그냥 독자적 큐를 쓰는게 낫지.\n \n acceptCoordinate를 썼던 이유는\n 1. 미들웨어가 클릭한 채로 드래그를 중요시하는 경우에 마우스를 클릭하지 않고 움직이는 것으로 인해 발생하는 이벤트를 무시하기 위하여 리스너를 동적으로 연결/연결 해제하기 위함이다.\n 2. 모델의 요구사항이다. 이거는 모델 선에서 처리해야지 씹놈아\n \n 터치 인터페이스인 경우에는 그 특성상 리스너를 굳이 연결 해제할 필요가 없다.\n \n 그래서 acceptCoordinate를 모델 책임으로 넘겼고, 리스너가 독자적 큐를 갖도록 했다! 원한다면 리스너를 여러 개로 만들 수 있다\n \n ### 참고\n push와 dispatch가 별개인 이유는 순전히 이것이 rAF 중심적으로 설계되었고, 모든 상태 변경은 rAF에서만 허용한다고 가정하기 때문이다. dispatch는 rAF 중에만, push는 이벤트가 발생할 수 있는 어떠한 타이밍에서든지 일어날 수 있다. 아직까지는 rAF에서 메시지 dispatch를 먼저 실행하고 실질적 모델 업데이트를 하기 때문에 그게 그거같아 보이지만, 모델 업데이트를 먼저 하도록 바꾸는 것도 가능하다. 그럼 coord도 마저 바꿔야되는데 어 시발 이게 뭐지?\n*/\n/**\n * 전적으로 rAF-Sync를 위해 표현되는 위치 객체로, 현재 rAF에서의 위치와 직전 rAF에서의 위치를 나타낸다.\n * 직전 \"이벤트\"의 위치가 아닌 직전 \"rAF\"인 것에 주의할 것!\n * */\nclass CoordinateState {\n    /** @readonly 현재 x좌표 */\n    get x() { return this.currentX; }\n    /** @readonly 현재 y좌표 */\n    get y() { return this.currentY; }\n    /** @readonly 직전 rAF에서 X좌표 */\n    get beforeX() { return this._beforeX; }\n    /** @readonly 직전 rAF에서 y좌표 */\n    get beforeY() { return this._beforeY; }\n    /** @readonly 직전 rAF에서 현재 rAF까지의 x 변위 */\n    get moveX() {\n        return (this.beforeX != null) && (this.currentX != null) ? (this.currentX - this._beforeX) : 0;\n    }\n    /** @readonly 직전 rAF에서 현재 rAF까지의 y 변위 */\n    get moveY() {\n        return (this.beforeY != null) && (this.currentY != null) ? (this.currentY - this._beforeY) : 0;\n    }\n    /** 쌩 입력값을 이것으로 한다. */\n    input(x, y) {\n        this.inputX = x;\n        this.inputY = y;\n    }\n    /** (눌림을 위해) current값을 강제로 이것으로 한다. */\n    shim(x, y) {\n        this.currentX = x;\n        this.currentY = y;\n    }\n    /** 현재 상태를 이전 상태로, 쌩 입력 좌표를 현재 상태로 전이시킨다. */\n    pulse() {\n        this._beforeX = this.currentX;\n        this._beforeY = this.currentY;\n        this.currentX = this.inputX;\n        this.currentY = this.inputY;\n    }\n}\n/** 입력 인터페이스를 눈치껏 알아채는 객체 */\nclass Detector {\n    constructor() {\n        this.detected = false;\n    }\n    disconnect() {\n        document.removeEventListener('mousedown', this.mouse);\n        document.removeEventListener('touchstart', this.touch);\n        this.detected = true;\n    }\n    open() {\n        if (this.detected)\n            return;\n        this.mouse = ev => {\n            this.whenItsMouse(ev);\n            this.disconnect();\n        };\n        this.touch = ev => {\n            this.whenItsTouch(ev);\n            this.disconnect();\n        };\n        document.addEventListener('mousedown', this.mouse);\n        document.addEventListener('touchstart', this.touch);\n    }\n}\n/**\n * 마우스 입력을 받아들여서 리스너에게 전달하는 클래스\n * 이 클래스는 requestAnimationFrame()을 사용한 업데이트 패턴에 특화된 구조를 가지고 있다.\n * 중요하고 양이 비교적 적은 이벤트(마우스 누름, 마우스 놓음)는 매 이벤트 루프마다 놓치지 않고 캡쳐해 두고, 압도적으로 많이 발생하고 중요하지 않은 이벤트(마우스 움직임)는 변화에 따라 \"현재 상태\"와 \"직전 상태\"만을 저장해 두고 rAF에서 그 상태를 참조하도록 하고 있다.\n * 이 입력 객체는 특히 \"마우스를 누를 때\"에만 실제 좌표를 전달한다.\n */\nclass MouseInput {\n    constructor() {\n        /** 중요 이벤트(마우스 누름, 마우스 놓음)를 저장한 큐 */\n        /**\n         * 마우스 누름 발생 시, 언젠가 발생할 마우스 떼기에 대응하여 임시로 메시지를 만들어 저장해 둘 배열\n         * messagePool[n]은 n번 마우스 버튼 누름에 대응하는 임시 마우스 떼기 메시지이다.\n         * n번 마우스 버튼 떼기가 발생하면 messagePool[n]에 있는 메시지를 꺼내서 end 값을 입력하고 큐에 넣는다.\n         * */\n        this.messageCache = [];\n        /** rAF 발생 당시 마우스 누름 중일 때 사용할 수 있는 좌표 컴포넌트 */\n        this.coordinate = new CoordinateState();\n        /** 마우스 누름 이벤트 발생 시 실행된다.  */\n        this.onstart = (ev) => {\n            ev.preventDefault();\n            let startX = ev.offsetX * this.scale;\n            let startY = ev.offsetY * this.scale;\n            let id = ev.button;\n            let startTime = ev.timeStamp;\n            // pulse를 맞으면 currentX는 beforeX가 된다.\n            // 따라서 rAF가 발생하는 시점에서 이전 위치는 마우스 누름 위치로 간주된다.\n            this.coordinate.shim(startX, startY);\n            // 이것과 rAF 사이에 move가 발생하지 않으면 rAF 발생 시 혀재 위치 또한 마우스 누름 위치가 된다.\n            // rAF 발생 전에 move가 먼저 발생하면 input값을 덮어써서 걔들이 current값이 되겠지?\n            this.coordinate.input(startX, startY);\n            this.listener.push({ type: \"mousedown\", id, startX, startY, startTime });\n            // down-up pair를 위해 마우스 누름 위치를 저장한다.\n            this.messageCache[id] = { type: \"mouseup\", id, startX, startY, startTime };\n            return false;\n        };\n        this.onmove = (ev) => {\n            this.coordinate.input(ev.offsetX * this.scale, ev.offsetY * this.scale);\n        };\n        this.onend = (ev) => {\n            /* MouseEvent.offsetX는 source 상대 위치이다. 띠용! */\n            let x = ev.offsetX * this.scale;\n            let y = ev.offsetY * this.scale;\n            // 마우스 누름 당시 저장했던 마우스 놓기 메시지를 가져온다.\n            let message = this.messageCache[ev.button];\n            delete this.messageCache[ev.button];\n            // 임시 메시지에 실제 마우스 놓기 데이터를 입력하여 메시지를 완성시킨다.\n            message.endX = x;\n            message.endY = y;\n            message.endTime = ev.timeStamp;\n            // 메시지를 큐에 입력한다.\n            this.listener.push(message);\n            // 현재 rAF의 마우스 위치를 떼기 위치로 간주한다.\n            // input에다 좌표를 넣어두면 rAF 발생 시 current로 내려가겠지?\n            this.coordinate.input(x, y);\n        };\n    }\n    /** 입력 컴포넌트를 뷰에 연결한다. */\n    connect(source, listener, scale = 1) {\n        this.disconnect();\n        this.source = source;\n        this.listener = listener;\n        this.scale = scale;\n        this.source.addEventListener('mousedown', this.onstart);\n        this.source.addEventListener('mousemove', this.onmove);\n        document.addEventListener('mouseup', this.onend);\n    }\n    /** 입력 컴포넌트 연결을 해제한다. */\n    disconnect() {\n        let source = this.source;\n        if (source) {\n            source.removeEventListener('mousedown', this.onstart);\n            source.removeEventListener('mousemove', this.onmove);\n            document.removeEventListener('mouseup', this.onend);\n        }\n        this.source = null;\n        this.listener = null;\n    }\n    /**\n     * (rAF) 큐에 있는 메시지를 모두 정리하고, 상태를 전이시킨다.\n     *\n     * # 중요 : 메시지 큐, 메시지 버퍼에 쌓인 것들은 rAF와 독립적으로 발생한 것들이다. 따라서 메시지는 coordState와는 좆도 상관없다.\n     * */\n    update() {\n        this.listener.dispatchAll();\n        this.coordinate.pulse();\n    }\n}\nclass TouchInput {\n    constructor() {\n        this.messageCache = [];\n        /**\n         * 마우스는 항상 하나의 좌표지만 터치는 언제 어디서 어떤 터치가 생길지, 없어질지 모른다.\n         * 근데 메인 터치는 있어야 하는 법이고, 갑자기 메인 터치가 없어지면 여기 있던 놈들 중에서 한 녀석이 메인 터치를 계승한다.\n         * */\n        this.touchStateMap = [];\n        /** @private 메인 터치의 위치 */\n        this.coord = null;\n        this.scale = 1;\n        this.onstart = (ev) => {\n            // 이게 없을 때 캔버스를 스와이프하면 페이지가 스크롤되고 탭을 하면 일부 환경에서 mouseup,mousedown을 일으킨다.\n            ev.preventDefault();\n            const startTime = ev.timeStamp;\n            let touchList = ev.changedTouches;\n            for (const touch of touchList) {\n                let startX = (touch.pageX - this.sourceLeft) * this.scale;\n                let startY = (touch.pageY - this.sourceTop) * this.scale;\n                let id = touch.identifier;\n                let state = new CoordinateState();\n                state.input(startX, startY);\n                state.shim(startX, startY);\n                this.touchStateMap[id] = state;\n                // 메인 터치가 없었다면 이 터치를 메인 터치로 설정한다.\n                if (!this.coord)\n                    this.coord = state;\n                this.listener.push({ type: \"touchstart\", id, startX, startY, startTime });\n                this.messageCache[id] = { type: \"touchend\", id, startX, startY, startTime };\n            }\n            return false;\n        };\n        this.onmove = (ev) => {\n            for (const touch of ev.changedTouches) {\n                if (touch.identifier in this.touchStateMap) {\n                    const state = this.touchStateMap[touch.identifier];\n                    let x = (touch.pageX - this.sourceLeft) * this.scale;\n                    let y = (touch.pageY - this.sourceTop) * this.scale;\n                    state.input(x, y);\n                }\n            }\n        };\n        this.onend = (ev) => {\n            for (const touch of ev.changedTouches) {\n                if (touch.identifier in this.touchStateMap) {\n                    const state = this.touchStateMap[touch.identifier];\n                    const x = (touch.pageX - this.sourceLeft) * this.scale;\n                    const y = (touch.pageY - this.sourceTop) * this.scale;\n                    const message = this.messageCache[touch.identifier];\n                    delete this.messageCache[touch.identifier];\n                    message.endX = x;\n                    message.endY = y;\n                    message.endTime = ev.timeStamp;\n                    this.listener.push(message);\n                    state.input(x, y);\n                    // 놓은 위치의 터치 위치 상태를 뺀다.\n                    delete this.touchStateMap[touch.identifier];\n                    // 메이저 터치가 빠졌으면 후계자를 찾는다.\n                    if (this.coord == state) {\n                        this.coord = null;\n                        for (const i in this.touchStateMap) {\n                            if (this.touchStateMap.hasOwnProperty(i)) {\n                                this.coord = this.touchStateMap[i];\n                                break;\n                            }\n                        }\n                    }\n                }\n            }\n        };\n    }\n    /** @readonly 메인 터치의 위치 */\n    get coordinate() { return this.coord; }\n    ;\n    connect(source, listener, scale = 1) {\n        this.disconnect();\n        this.source = source;\n        this.listener = listener;\n        this.scale = 1;\n        this.source.addEventListener('touchstart', this.onstart);\n        this.source.addEventListener('touchmove', this.onmove);\n        document.addEventListener('touchend', this.onend);\n        let { left, top } = source.getBoundingClientRect();\n        this.sourceLeft = left;\n        this.sourceTop = top;\n    }\n    disconnect() {\n        let source = this.source;\n        if (source) {\n            source.removeEventListener('touchstart', this.onstart);\n            source.removeEventListener('touchmove', this.onmove);\n            document.removeEventListener('touchend', this.onend);\n        }\n        this.source = null;\n        this.listener = null;\n    }\n    update() {\n        this.listener.dispatchAll();\n        for (const i in this.touchStateMap) {\n            if (this.touchStateMap.hasOwnProperty(i)) {\n                const state = this.touchStateMap[i];\n                state.pulse();\n            }\n        }\n    }\n}\n\n\n//# sourceURL=webpack:///./app/Input.ts?");

/***/ }),

/***/ "./app/Matrix2D.ts":
/*!*************************!*\
  !*** ./app/Matrix2D.ts ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Matrix2D; });\n/**\n * 이렇게 생긴 행렬을 나타낸다:\n *\n * ````plaintext\n * a 0 e\n * 0 d f\n * 0 0 1\n * ````\n * skew는 고려대상이 아니므로 b, c는 뺐다.\n */\nclass Matrix2D {\n    constructor(a, d, e, f) {\n        this.a = 1;\n        this.d = 1;\n        this.e = 0;\n        this.f = 0;\n        this.a = a;\n        this.d = d;\n        this.e = e;\n        this.f = f;\n    }\n    /** 모델 상에서의 어떤 지점이 뷰에 나타나는 위치 */\n    transformPoint(x, y) {\n        let { a, d, e, f } = this;\n        return [x * a + e, y * d + f];\n    }\n    /** 뷰의 어떤 지점을 찍었을 때 그 점의 모델 상에서의 위치 */\n    itransformPoint(x, y) {\n        let { a, d, e, f } = this;\n        return [(x - e) / a, (y - f) / d];\n    }\n    /** 모델 상의 두 지점이 뷰에 나타날 때 두 점의 변위의 각 성분 */\n    transformDimension(w, h) {\n        let { a, d } = this;\n        return [w * a, h * d];\n    }\n    /** 뷰에 나타난 변위의 각 성분의 모델에서의 길이 */\n    itransformDimension(w, h) {\n        let { a, d } = this;\n        return [w / a, h / d];\n    }\n}\n\n\n//# sourceURL=webpack:///./app/Matrix2D.ts?");

/***/ }),

/***/ "./app/Model.ts":
/*!**********************!*\
  !*** ./app/Model.ts ***!
  \**********************/
/*! exports provided: Model */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Model\", function() { return Model; });\nclass Model {\n    constructor() {\n        this.path = [];\n        this.messages = [];\n        this.color = \"#0000FF\";\n    }\n    push(m) {\n        this.messages.unshift(m);\n    }\n    dispatchAll() {\n        let m;\n        let x;\n        let y;\n        while ((m = this.messages.pop()) != null) {\n            switch (m.type) {\n                case \"mousedown\":\n                    [x, y] = this.mat.itransformPoint(m.startX, m.startY);\n                    this.color = \"#FF0000\";\n                    this.path.push({ x, y, color: this.color, opacity: 1, velX: 0, velY: 0 });\n                    break;\n                case \"mouseup\":\n                    [x, y] = this.mat.itransformPoint(m.endX, m.endY);\n                    this.color = \"#0000FF\";\n                    this.path.push({ x, y, color: this.color, opacity: 1, velX: 0, velY: 0 });\n                    break;\n            }\n        }\n    }\n    update(c) {\n        for (let i = 0; i < this.path.length; i++) {\n            let point = this.path[i];\n            point.opacity -= .0078125;\n            point.x += point.velX;\n            point.y += point.velY + 0.5;\n            if (point.opacity <= 0) {\n                this.path.splice(i, 1);\n                i -= 1;\n            }\n        }\n        let max = this.path.length;\n        for (let i = 1; i < max; i++) {\n            let { x, y } = this.path[i];\n            let before = this.path[i - 1];\n            let { x: beforeX, y: beforeY } = before;\n            before.velX = (x - beforeX) / 10;\n            before.velY = (y - beforeY) / 10;\n        }\n        let [x, y] = this.mat.itransformPoint(c.x, c.y);\n        let velX = (c.moveX) / 10;\n        let velY = (c.moveY) / 10;\n        this.path.push({ x, y, color: this.color, opacity: 1.0078125, velX, velY });\n    }\n    render(context) {\n        let max = this.path.length - 1;\n        context.lineCap = \"round\";\n        for (let i = 2; i < max; i++) {\n            let { x, y, color, opacity } = this.path[i];\n            let { x: beforeX, y: beforeY } = this.path[i - 1];\n            let { x: beforebeforeX, y: beforebeforeY } = this.path[i - 2];\n            let startX = (beforebeforeX + beforeX) / 2;\n            let startY = (beforebeforeY + beforeY) / 2;\n            let endX = (beforeX + x) / 2;\n            let endY = (beforeY + y) / 2;\n            context.beginPath();\n            context.strokeStyle = color;\n            context.lineWidth = (1 / (1.61803 - opacity) - 0.618034) * 4;\n            context.moveTo(startX, startY);\n            context.quadraticCurveTo(beforeX, beforeY, endX, endY);\n            context.stroke();\n        }\n    }\n}\n\n\n//# sourceURL=webpack:///./app/Model.ts?");

/***/ }),

/***/ "./app/View.ts":
/*!*********************!*\
  !*** ./app/View.ts ***!
  \*********************/
/*! exports provided: Viewbox, View */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Viewbox\", function() { return Viewbox; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"View\", function() { return View; });\n/* harmony import */ var _Matrix2D__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Matrix2D */ \"./app/Matrix2D.ts\");\n\nclass Viewbox {\n    constructor(view, context, rWidth, rHeight) {\n        this.view = view;\n        this.context = context;\n        // View 클래스는 캔버스 여러분이 가지고 있던 기존의 변환 행렬을 존중합니다!!\n        let { a, d, e, f } = this.context.getTransform();\n        this.matrix = new _Matrix2D__WEBPACK_IMPORTED_MODULE_0__[\"default\"](a, d, e, f);\n        this._width = rWidth / a;\n        this._height = rHeight / d;\n        this._left = -e;\n        this._top = -f;\n    }\n    get left() { return this._left; }\n    get top() { return this._top; }\n    get width() { return this._width; }\n    get height() { return this._height; }\n    get x() { return this._left + this._width / 2; }\n    get y() { return this._top + this._height / 2; }\n    get right() { return this._left + this._width; }\n    get bottom() { return this._top + this._height; }\n    /** 뷰박스의 가운데가 지정한 좌표값이 되도록 뷰박스를 이동시킨다. */\n    setPosition(x = null, y = null) {\n        const matrix = this.matrix;\n        let { a, d } = matrix;\n        if (x != null)\n            this._left = x - this._width / 2;\n        if (y != null)\n            this._top = y - this._height / 2;\n        matrix.e = -this._left * a;\n        matrix.f = -this._top * d;\n        this.context.setTransform(a, 0, 0, d, matrix.e, matrix.f);\n    }\n    /** 뷰박스를 이동시킨다.\n     * 신기하게도 Context.translate는 입력값 만큼만 변환시키는 것이 아니라 변환행렬의 다른 값들이 함께 적용된다. */\n    move(dx, dy) {\n        const matrix = this.matrix;\n        matrix.e += -dx * matrix.a;\n        matrix.f += -dy * matrix.d;\n        this.context.translate(-dx, -dy);\n    }\n    /**\n     * 뷰박스의 크기를 설정한다.\n     * height가 없으면 __뷰(캔버스)의 종횡 비율__이 적용된다.\n     * 아무런 인수가 없으면 기존의 width가 적용된다.\n     * */\n    setSize(width, height) {\n        let { x, y } = this;\n        (width != null) ? this._width = width : width = this._width;\n        if (height == null)\n            height = width * this.view.height / this.view.width;\n        this._height = height;\n        this._left = x - width / 2;\n        this._top = y - height / 2;\n        let a = this.view.width / width;\n        let d = this.view.height / height;\n        let e = -this._left * a;\n        let f = -this._top * d;\n        Object.assign(this.matrix, { a, d, e, f });\n        this.context.setTransform(a, 0, 0, d, e, f);\n    }\n    /** 뷰박스가 보고 있는 곳을 청소한다. */\n    clearRect() {\n        this.context.clearRect(this._left - 5, this._top - 5, this._width + 10, this._height + 10);\n    }\n}\n/**\n * 기본적으로는 캔버스와 같으나, 뷰포트(Viewport)를 고려하여 크기 조절 시 컨텍스트의 변환 행렬을 조절하는 기능을 추가로 갖고 있다. 이러한 사양 때문에 실제 크기 속성을 함께 가지고 있다.\n */\nclass View {\n    /**\n     * 캔버스를 기반으로 뷰를 생성한다.\n     * 기존에 설정되어 있던 변환행렬을 기반으로 위치, 배율이 현재 객체에 자동으로 등록된다.\n     */\n    constructor(canvas) {\n        this.canvas = canvas;\n        this.context = canvas.getContext('2d');\n        this.rWidth = this.canvas.width;\n        this.rHeight = this.canvas.height;\n        this.viewbox = new Viewbox(this, this.context, this.rWidth, this.rHeight);\n    }\n    get width() { return this.rWidth; }\n    get height() { return this.rHeight; }\n    /**\n     * 뷰(캔버스)의 크기를 변경하고, 뷰박스 크기는 변경되지 않도록 context의 변환행렬 값을 적절한 것으로 채워 넣는다.\n     * height가 없으면 현재 뷰(캔버스)의 width 변화에 비례한 값이 자동 설정된다.\n     * */\n    setViewSize(width, height) {\n        if (height == null)\n            height = width * this.rHeight / this.rWidth;\n        this.rWidth = width;\n        this.rHeight = height;\n        this.canvas.width = width;\n        this.canvas.height = height;\n        this.viewbox.setSize();\n    }\n}\n\n\n//# sourceURL=webpack:///./app/View.ts?");

/***/ }),

/***/ "./app/index.ts":
/*!**********************!*\
  !*** ./app/index.ts ***!
  \**********************/
/*! exports provided: view */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"view\", function() { return view; });\n/* harmony import */ var _View__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./View */ \"./app/View.ts\");\n/* harmony import */ var _Input__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Input */ \"./app/Input.ts\");\n/* harmony import */ var _Model__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Model */ \"./app/Model.ts\");\n\n\n\nconst canvas = document.getElementsByTagName('canvas')[0];\ncanvas.getContext('2d').setTransform(1, 0, 0, 1, 60, 80);\nconst view = new _View__WEBPACK_IMPORTED_MODULE_0__[\"View\"](canvas);\nview.setViewSize(360);\nconst model = new _Model__WEBPACK_IMPORTED_MODULE_2__[\"Model\"]();\nmodel.mat = view.viewbox.matrix;\nconst input = new _Input__WEBPACK_IMPORTED_MODULE_1__[\"MouseInput\"]();\ninput.connect(view.canvas, model);\n// function handleResize() {\n// \tlet w : number, h : number;\n// \tif (window.innerWidth / window.innerHeight > 3 / 4) {\n// \t\th = window.innerHeight - 64;\n// \t\tw = h * 3 / 4;\n// \t} else {\n// \t\tw = window.innerWidth - 64;\n// \t\th = w * 4 / 3;\n// \t}\n// \tview.setViewSize(w);\n// }\n// window.addEventListener('resize', handleResize);\n// window.addEventListener('load', handleResize);\nfunction rAF(t) {\n    input.update();\n    model.update(input.coordinate);\n    view.viewbox.clearRect();\n    model.render(view.context);\n    requestAnimationFrame(rAF);\n}\nrAF();\nwindow.view = view;\n\n\n//# sourceURL=webpack:///./app/index.ts?");

/***/ })

/******/ });