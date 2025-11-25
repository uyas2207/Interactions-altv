import * as __WEBPACK_EXTERNAL_MODULE_alt_server_bcde031e__ from "alt-server";
import * as __WEBPACK_EXTERNAL_MODULE_alt_chat_aea54472__ from "alt:chat";
/******/ var __webpack_modules__ = ({

/***/ "./server/commands/interactionCommands.js":
/*!************************************************!*\
  !*** ./server/commands/interactionCommands.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InteractionCommands: () => (/* binding */ InteractionCommands)
/* harmony export */ });
/* harmony import */ var alt_chat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt:chat */ "alt:chat");

class InteractionCommands {
  static register(interactionServer) {
    alt_chat__WEBPACK_IMPORTED_MODULE_0__.registerCmd('create', (player, arg) => {
      if (!arg || !['1', '2', '3'].includes(String(arg))) {
        alt_chat__WEBPACK_IMPORTED_MODULE_0__.send(player, 'Использование: /create 1,2,3');
        return;
      }
      var type = parseInt(arg[0]);
      interactionServer.createPoint(player, type);
    });
  }
}

/***/ }),

/***/ "./server/events/ServerEvents.js":
/*!***************************************!*\
  !*** ./server/events/ServerEvents.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ServerEvents: () => (/* binding */ ServerEvents)
/* harmony export */ });
/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ "alt-server");
/* provided dependency */ var InteractionType = __webpack_require__(/*! ./shared/Consts.js */ "./shared/Consts.js")["InteractionType"];
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }

class ServerEvents {
  static setupSystemEvents(interactionServer) {
    alt_server__WEBPACK_IMPORTED_MODULE_0__.on('playerConnect', /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (player) {
        interactionServer.initializePlayer(player);
        interactionServer.demonstrationScene(player);
      });
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    alt_server__WEBPACK_IMPORTED_MODULE_0__.onClient('client:succesSingleTapInteraction', player => {
      interactionServer.completeInteraction(player, InteractionType.VENDING);
    });
    alt_server__WEBPACK_IMPORTED_MODULE_0__.onClient('client:succesMultiTapInteraction', player => {
      interactionServer.completeInteraction(player, InteractionType.EXERCISE);
    });
    alt_server__WEBPACK_IMPORTED_MODULE_0__.onClient('client:succesHoldInteraction', player => {
      interactionServer.completeInteraction(player, InteractionType.VEHICLE);
    });
  }
}

/***/ }),

/***/ "./shared/Consts.js":
/*!**************************!*\
  !*** ./shared/Consts.js ***!
  \**************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InteractionType: () => (/* binding */ InteractionType)
/* harmony export */ });
var InteractionType = {
  VEHICLE: 1,
  EXERCISE: 2,
  VENDING: 3
};

/***/ }),

/***/ "alt-server":
/*!*****************************!*\
  !*** external "alt-server" ***!
  \*****************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_alt_server_bcde031e__;

/***/ }),

/***/ "alt:chat":
/*!***************************!*\
  !*** external "alt:chat" ***!
  \***************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_alt_chat_aea54472__;

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************!*\
  !*** ./server/startServer.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ "alt-server");
/* harmony import */ var alt_chat__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! alt:chat */ "alt:chat");
/* harmony import */ var _events_ServerEvents_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./events/ServerEvents.js */ "./server/events/ServerEvents.js");
/* harmony import */ var _commands_interactionCommands_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./commands/interactionCommands.js */ "./server/commands/interactionCommands.js");
/* provided dependency */ var InteractionType = __webpack_require__(/*! ./shared/Consts.js */ "./shared/Consts.js")["InteractionType"];
// alt:V built-in module that provides server-side API.

// Your chat resource module.



class InteractionServer {
  constructor() {
    this.playerInteractions = new Map();
    //this.init();
  }

  // создание записи о игроке
  initializePlayer(player) {
    //в случае перезахода не перезаписываются данные игрока (запоминает что уже было выполнено ранее)
    if (this.playerInteractions.has(player.id)) {
      return;
    }
    this.playerInteractions.set(player.id, {
      active: new Set([InteractionType.VEHICLE, InteractionType.EXERCISE, InteractionType.VENDING]),
      completed: new Set()
    });
    alt_server__WEBPACK_IMPORTED_MODULE_0__.log("[Interaction] \u0418\u0433\u0440\u043E\u043A ".concat(player.id, " \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0432 \u0442\u0430\u0431\u043B\u0438\u0446\u0443"));
    this.printAllplayersInteractionsState();
  }

  // При входе — подготовка сцены
  demonstrationScene(player) {
    player.spawn(-1271.63, -1430.71, 4.34);
    if (!this.vehicleCreated) {
      new alt_server__WEBPACK_IMPORTED_MODULE_0__.Vehicle('benson', -1275.78, -1434.56, 4.54, 0, 0, 0.56621);
      this.vehicleCreated = true;
    }
    var activeInteractions = Array.from(this.playerInteractions.get(player.id).active);
    alt_server__WEBPACK_IMPORTED_MODULE_0__.log("[Interaction] activeInteractions ".concat(activeInteractions));
    // говорит клиенту создать демо сцену только для списка доступных типов (тех которые конкретный игрок еще не выполнил)
    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'client:sceneDemo', activeInteractions);
  }
  completeInteraction(player, type) {
    var data = this.playerInteractions.get(player.id);
    if (!data) return;

    // удаляет из активных
    data.active.delete(type);

    // добавляем в выполненные
    data.completed.add(type);
    alt_server__WEBPACK_IMPORTED_MODULE_0__.log("[Interaction] \u0418\u0433\u0440\u043E\u043A ".concat(player.id, " \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u043B \u0438\u043D\u0442\u0435\u0440\u0430\u043A\u0446\u0438\u044E (").concat(type, ")"));
    this.printAllplayersInteractionsState();
    // уведомление в чате игроку
    alt_chat__WEBPACK_IMPORTED_MODULE_1__.send(player, "\u0423\u0441\u043F\u0435\u0445! \u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430 \u0438\u043D\u0442\u0435\u0440\u0430\u043A\u0446\u0438\u044F: ".concat(type));
    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'client:delPoint', type);
  }

  //создание точки по команде клиента
  createPoint(player, type) {
    var data = this.playerInteractions.get(player.id);
    //проверка если у клиента уже есть актвиная точка такого типа
    if (!data.active.has(type)) {
      alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'client:createPoint', type);
      data.active.add(type); //Добавить в map игрока новую, только что созданную точку
      data.completed.delete(type); //удалить из map выполненых точек игрока прошлую точку (так как создана новая)
      this.printAllplayersInteractionsState();
    } else {
      alt_chat__WEBPACK_IMPORTED_MODULE_1__.send(player, 'Нельзя использовать /create для уже существующей точки');
      alt_chat__WEBPACK_IMPORTED_MODULE_1__.send(player, 'Типы интераций: VEHICLE = 1, EXERCISE = 2, VENDING = 3');
    }
  }
  //выводит текщее состояние инетрацкий для всех игроков на сервере
  printAllplayersInteractionsState() {
    this.playerInteractions.forEach((value, key) => {
      alt_server__WEBPACK_IMPORTED_MODULE_0__.log("[Interaction] \u0418\u0433\u0440\u043E\u043A ".concat(key, ":"));
      alt_server__WEBPACK_IMPORTED_MODULE_0__.log(" active: ".concat(Array.from(value.active).join(', ')));
      alt_server__WEBPACK_IMPORTED_MODULE_0__.log(" completed: ".concat(Array.from(value.completed).join(', ')));
    });
  }
}
var interactionServer = new InteractionServer();
_events_ServerEvents_js__WEBPACK_IMPORTED_MODULE_2__.ServerEvents.setupSystemEvents(interactionServer);
_commands_interactionCommands_js__WEBPACK_IMPORTED_MODULE_3__.InteractionCommands.register(interactionServer);
})();

