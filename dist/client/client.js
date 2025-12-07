import * as __WEBPACK_EXTERNAL_MODULE_alt_client_680395b4__ from "alt-client";
import * as __WEBPACK_EXTERNAL_MODULE_natives__ from "natives";
/******/ var __webpack_modules__ = ({

/***/ "./client/classes/AnimationManager.js":
/*!********************************************!*\
  !*** ./client/classes/AnimationManager.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnimationManager: () => (/* binding */ AnimationManager)
/* harmony export */ });
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");
/* harmony import */ var natives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! natives */ "natives");
/* harmony import */ var _config_InteractionConfig_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @config/InteractionConfig.js */ "./client/config/InteractionConfig.js");
/* provided dependency */ var wait = __webpack_require__(/*! ./client/utilities/utilities.js */ "./client/utilities/utilities.js")["wait"];
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }



class AnimationManager {
  // метод для загрузки словаря анимаций
  static loadAnimDict(dict) {
    return _asyncToGenerator(function* () {
      //если анимация уже есть 
      if (natives__WEBPACK_IMPORTED_MODULE_1__.hasAnimDictLoaded(dict)) {
        return true;
      }
      natives__WEBPACK_IMPORTED_MODULE_1__.requestAnimDict(dict);
      var counter = 0;
      while (!natives__WEBPACK_IMPORTED_MODULE_1__.hasAnimDictLoaded(dict) && counter < 100) {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u041F\u043E\u043F\u0442\u044B\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u044E ".concat(dict, " \u043D\u043E\u043C\u0435\u0440: ").concat(counter + 1));
        yield wait(200);
        counter++;
      }
      if (!natives__WEBPACK_IMPORTED_MODULE_1__.hasAnimDictLoaded(dict)) {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u044E:".concat(dict));
        return false;
      }
    })();
  }

  // спавн пропа перед началом анимации
  static spawnProp(modelName) {
    var _this = this;
    return _asyncToGenerator(function* () {
      var ped = alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.scriptID;
      var modelHash = alt_client__WEBPACK_IMPORTED_MODULE_0__.hash(modelName);

      // загружает проп
      if (!natives__WEBPACK_IMPORTED_MODULE_1__.hasModelLoaded(modelHash)) {
        natives__WEBPACK_IMPORTED_MODULE_1__.requestModel(modelHash);
        var counter = 0;
        while (!natives__WEBPACK_IMPORTED_MODULE_1__.hasModelLoaded(modelHash) && counter < 100) {
          yield wait(20);
          counter++;
        }
        //если не получилось загрузить
        if (!natives__WEBPACK_IMPORTED_MODULE_1__.hasModelLoaded(modelHash)) {
          alt_client__WEBPACK_IMPORTED_MODULE_0__.log("spawnProp: \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043C\u043E\u0434\u0435\u043B\u044C ".concat(modelName));
          return null;
        }
      }

      // получает позицию игрока и создаёт объект рядом с ним
      var pos = natives__WEBPACK_IMPORTED_MODULE_1__.getEntityCoords(ped, true);
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log("getEntityCoords pos: ".concat(pos));
      var object = natives__WEBPACK_IMPORTED_MODULE_1__.createObject(modelHash, pos.x, pos.y, pos.z, true, true, false);

      // Получаем настройки для конкретной модели
      var modelConfig = _this.config.propSettings.modelOffsets[modelName];
      var {
        offsetX,
        offsetY,
        offsetZ,
        rotX,
        rotY,
        rotZ
      } = modelConfig;
      var attachSettings = _this.config.propSettings.attachSettings;
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log("attachEntityToEntity args:\n            modelHash=".concat(modelHash, ", object=").concat(object, ", ped=").concat(ped, ", boneIndex=").concat(_this.config.propSettings.boneIndex, ",\n            offs=").concat(offsetX, ",").concat(offsetY, ",").concat(offsetZ, ", rot=").concat(rotX, ",").concat(rotY, ",").concat(rotZ, ", p9=").concat(attachSettings.p9, ", soft=").concat(attachSettings.useSoftPinning, ",\n            coll=").concat(attachSettings.collision, ", isPed=").concat(attachSettings.isPed, ", vertex=").concat(attachSettings.vertexIndex, ", fixedRot=").concat(attachSettings.fixedRot, ", extra=").concat(attachSettings.p15));

      // приклеивает проп к правой руке
      natives__WEBPACK_IMPORTED_MODULE_1__.attachEntityToEntity(object, ped, _this.config.propSettings.boneIndex, offsetX, offsetY, offsetZ, rotX, rotY, rotZ, attachSettings.p9, attachSettings.useSoftPinning, attachSettings.collision, attachSettings.isPed, attachSettings.vertexIndex, attachSettings.fixedRot, attachSettings.p15);
      return object;
    })();
  }

  //удаляет проп после завршения анимации
  static deleteProp(object) {
    if (!object) return;
    if (natives__WEBPACK_IMPORTED_MODULE_1__.doesEntityExist(object)) {
      natives__WEBPACK_IMPORTED_MODULE_1__.deleteEntity(object);
    }
  }

  // Анимация взаимодействия с автоматом
  static playVendingMachineAnimation() {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Запуск анимации покупки из автомата');
      var player = alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local;
      var ped = player.scriptID;
      var vendingConfig = _this2.config.vendingMachine;
      var animConfig = vendingConfig.animations;

      // Перемещает игрока и задаёт новую ориентацию
      natives__WEBPACK_IMPORTED_MODULE_1__.freezeEntityPosition(player, true);
      natives__WEBPACK_IMPORTED_MODULE_1__.setEntityCoordsNoOffset(player, vendingConfig.position.x, vendingConfig.position.y, vendingConfig.position.z, false, false, false);
      natives__WEBPACK_IMPORTED_MODULE_1__.setEntityRotation(player, 0, 0, vendingConfig.position.rotZ, 2, true);

      // пауза для корректного позиционирования
      yield wait(300);
      try {
        natives__WEBPACK_IMPORTED_MODULE_1__.taskPlayAnim(ped, animConfig.dict, animConfig.use, 8.0, -8.0, -1, 0, 0, false, false, false);
        yield wait(2200);
        var drinkCan = yield _this2.spawnProp('ng_proc_sodacan_01a');
        natives__WEBPACK_IMPORTED_MODULE_1__.taskPlayAnim(ped, animConfig.dict, animConfig.drink, 8.0, -8.0, -1, 0, 0, false, false, false);
        yield wait(1800);
        AnimationManager.deleteProp(drinkCan);
      } finally {
        natives__WEBPACK_IMPORTED_MODULE_1__.clearPedTasks(ped);
        natives__WEBPACK_IMPORTED_MODULE_1__.freezeEntityPosition(player, false);
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Анимация покупки завершена');
      }
    })();
  }
}
_defineProperty(AnimationManager, "config", _config_InteractionConfig_js__WEBPACK_IMPORTED_MODULE_2__.animationConfig);

/***/ }),

/***/ "./client/classes/Interactions/HoldInteraction.js":
/*!********************************************************!*\
  !*** ./client/classes/Interactions/HoldInteraction.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HoldInteraction: () => (/* binding */ HoldInteraction)
/* harmony export */ });
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");
/* harmony import */ var natives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! natives */ "natives");
/* harmony import */ var _InteractionBase_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./InteractionBase.js */ "./client/classes/Interactions/InteractionBase.js");
/* harmony import */ var _notifications_NotificationManager_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @notifications/NotificationManager.js */ "./client/classes/Notifications/NotificationManager.js");
/* provided dependency */ var drawNotification = __webpack_require__(/*! ./client/utilities/utilities.js */ "./client/utilities/utilities.js")["drawNotification"];
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }




class HoldInteraction extends _InteractionBase_js__WEBPACK_IMPORTED_MODULE_2__.InteractionBase {
  constructor(pointData) {
    super(pointData);
    this.currentProgressPromise = null;
    this.progressShouldStop = false;
  }

  // основной метод для настройки обработки прогресс-бара (долгого зажатия E)
  startInteraction() {
    var _this = this;
    return _asyncToGenerator(function* () {
      _this.bar = _notifications_NotificationManager_js__WEBPACK_IMPORTED_MODULE_3__.NotificationManager.getInstance().createProgressBar('lockpick', 'Взлом замка', 0, "");
      _this.keyPressHandler = /*#__PURE__*/function () {
        var _ref = _asyncToGenerator(function* (key) {
          //реагирует только на клавишу E
          if (key !== 69) return;
          //дебаунс от спама - проверяем можно ли обработать это нажатие
          if (!_this.canProcessKeyPress(key)) {
            return; // если дебаунс активен, отменяет последующие действия
          }
          // если при нажатии на E уже запущен процесс взлома произойдет return
          if (_this.currentProgressPromise) {
            return;
          }
          _this.progressShouldStop = false;
          alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Запуск нового прогресса...');
          //анимация для взлома
          natives__WEBPACK_IMPORTED_MODULE_1__.taskPlayAnim(alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.scriptID, 'amb@world_human_stand_mobile@male@text@base', 'base', 8.0, -8.0, -1, 49, 0, false, false, false);

          //создает и сохраняет Promise для отслеживания выполнения runProgress
          _this.currentProgressPromise = _this.runProgress()
          //обработка успешного завершения прогресса
          .then(() => {
            alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Прогресс завершен успешно');
            drawNotification('Задача выполнена!');
            alt_client__WEBPACK_IMPORTED_MODULE_0__.emitServer('client:succesHoldInteraction'); //передача на сервер информации об успешном завршении интракции, сервер запомнит что игрок выполнил конкретную интеракцию и удале ее маркер и колшейп
          })
          //способ прервать выполнение прогресса(происходит после того как игрок отпустит E и в runProgress сработает проверка this.progressShouldStop = true на зажатую E)
          .catch(error => {
            //преднамеренное прерывание
            if (error.message === 'Прерывание') {
              alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Прогресс прерван');
              // сбрасывает прогрессбар в начальное состояние
              _this.updateInteraction(0); //метод для изменения текста уведомления
              //отменяет текущую анимацю (при остановке прогресса и при успешном завершении)
              natives__WEBPACK_IMPORTED_MODULE_1__.clearPedTasks(alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.scriptID);
              drawNotification('startInteraction Процесс прерван!');
            }
          })
          //выполняется в любом случае - при успехе или ошибке
          .finally(() => {
            // сбрасывает ссылку на Promise чтобы разрешить новый запуск
            _this.currentProgressPromise = null;
            alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Промис прогресса очищен в finally');
          });
        });
        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }();

      // Обработчик отпускания клавиши E
      _this.keyUpHandler = key => {
        // игнорирует отпускание других клавиш
        if (key !== 69) return;
        if (_this.currentProgressPromise && !_this.progressShouldStop) {
          _this.progressShouldStop = true;
          alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Клавиша E отпущена, установлен shouldStop');
        }
      };

      // создаются обработчики событий
      alt_client__WEBPACK_IMPORTED_MODULE_0__.on('keydown', _this.keyPressHandler);
      alt_client__WEBPACK_IMPORTED_MODULE_0__.on('keyup', _this.keyUpHandler);
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Созданы обработчики progressBar');
    })();
  }

  // основной метод выполнения прогресса (взлома)
  runProgress() {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('runProgress начал выполнение');
      // цикл из 10 шагов прогресса (от 10% до 100%)
      var _loop = function* _loop(percentcounter) {
        // обнволение прогрессбара визуально  
        _this2.updateInteraction(percentcounter);

        // ожидание 1 секунды с возможностью прерывания и очисткой обработчиков timeout и interval
        yield new Promise((resolve, reject) => {
          // для проверки от множественного вызова resolve/reject
          var isResolved = false;

          // функции для безопасного завершения Promise с очисткой timeout и interval
          var safeResolve = () => {
            if (!isResolved) {
              isResolved = true;
              alt_client__WEBPACK_IMPORTED_MODULE_0__.clearTimeout(timeout);
              alt_client__WEBPACK_IMPORTED_MODULE_0__.clearInterval(interval);
              alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u0435\u043B safeResolve");
              resolve();
            }
          };
          var safeReject = error => {
            if (!isResolved) {
              isResolved = true;
              alt_client__WEBPACK_IMPORTED_MODULE_0__.clearTimeout(timeout);
              alt_client__WEBPACK_IMPORTED_MODULE_0__.clearInterval(interval);
              alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u0435\u043B safeReject");
              reject(error);
            }
          };

          // ВАРИАНТ 1: УСПЕШНОЕ ЗАВЕРШЕНИЕ
          // Таймер который вызовет safeResolve() через 1 секунду
          var timeout = alt_client__WEBPACK_IMPORTED_MODULE_0__.setTimeout(() => {
            safeResolve();
            alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0428\u0430\u0433 ".concat(percentcounter, " \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));
          }, 1000);

          // ВАРИАНТ 2: ПРЕРЫВАНИЕ
          // Интервал который проверяет условия прерывания каждые 200ms
          var interval = alt_client__WEBPACK_IMPORTED_MODULE_0__.setInterval(() => {
            // Игрок отпустил клавишу -> Была запрошена остановка (shouldStop)
            if (_this2.progressShouldStop) {
              safeReject(new Error('Прерывание'));
              alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0428\u0430\u0433 ".concat(percentcounter, " \u043F\u0440\u0435\u0440\u0432\u0430\u043D"));
            }
          }, 200); // проверяет каждые 200 миллисекунд
        });
      };
      for (var percentcounter = 1; percentcounter <= 10; percentcounter++) {
        yield* _loop(percentcounter);
      }
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('runProgress завершил цикл - ВЗЛОМ УСПЕШЕН!');
    })();
  }
  stopInteraction() {
    natives__WEBPACK_IMPORTED_MODULE_1__.clearPedTasks(alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.scriptID);

    //проверки нужны на случай успешного выполнения и последущего выхода из колшейпа (полсле выполнения все удаляется, после выхода происходит повторная попытка удаления)
    if (this.keyPressHandler) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.off('keydown', this.keyPressHandler);
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Удален обработчик keyPressHandler stopInteraction');
    }
    if (this.keyUpHandler) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.off('keyup', this.keyUpHandler);
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Удален обработчик keyup stopInteraction');
    }

    //флаг shouldStop для остановки runProgress
    if (this.progressShouldStop) {
      this.progressShouldStop = false;
    }
    if (this.bar) {
      this.bar.hide();
    }
  }

  //метод для изменения текста уведомления
  updateInteraction(i) {
    this.bar.update(i / 10, "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441: ".concat(i * 10, "%"));
  }
  getInteractionText() {
    return "Удерживайте E";
  }
}

/***/ }),

/***/ "./client/classes/Interactions/InteractionBase.js":
/*!********************************************************!*\
  !*** ./client/classes/Interactions/InteractionBase.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InteractionBase: () => (/* binding */ InteractionBase)
/* harmony export */ });
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");

//Шаблон для классов наследников
class InteractionBase {
  constructor(pointData) {
    this.point = pointData;
    this.keyEDebounceMs = 1500; // задержка между нажатиями
    this.lastKeyEPressTime = 0;
  }
  startInteraction() {}
  stopInteraction() {}
  updateInteraction() {}
  getInteractionText() {
    return "";
  }

  //общий метод для дебаунса от спама
  canProcessKeyPress(key) {
    // Проверяем дебаунс только для клавиши E (код 69 соответствует клавише E)
    if (key === 69) {
      // Получаем текущее время в миллисекундах
      var currentTime = Date.now();
      // Вычисляем сколько времени прошло с последнего нажатия клавиши E
      var timeSinceLastPress = currentTime - this.lastKeyEPressTime;

      // Если прошло меньше времени, чем установленный дебаунс, игнорируем нажатие
      if (timeSinceLastPress < this.keyEDebounceMs) {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0414\u0435\u0431\u0430\u0443\u043D\u0441 E: \u043D\u0430\u0436\u0430\u0442\u0438\u0435 \u043F\u0440\u043E\u0438\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E (".concat(timeSinceLastPress, "ms < ").concat(this.keyEDebounceMs, "ms)"));
        return false; // Запрещаем обработку нажатия
      }

      // Обновляем время последнего нажатия клавиши E на текущее время
      this.lastKeyEPressTime = currentTime;
    }

    // Для других клавиш дебаунс не применяется - всегда разрешаем обработку
    return true;
  }
}

/***/ }),

/***/ "./client/classes/Interactions/MultiTapInteraction.js":
/*!************************************************************!*\
  !*** ./client/classes/Interactions/MultiTapInteraction.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiTapInteraction: () => (/* binding */ MultiTapInteraction)
/* harmony export */ });
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");
/* harmony import */ var natives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! natives */ "natives");
/* harmony import */ var _InteractionBase_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./InteractionBase.js */ "./client/classes/Interactions/InteractionBase.js");
/* harmony import */ var _notifications_NotificationManager_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @notifications/NotificationManager.js */ "./client/classes/Notifications/NotificationManager.js");
/* provided dependency */ var wait = __webpack_require__(/*! ./client/utilities/utilities.js */ "./client/utilities/utilities.js")["wait"];
/* provided dependency */ var drawNotification = __webpack_require__(/*! ./client/utilities/utilities.js */ "./client/utilities/utilities.js")["drawNotification"];
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }




class MultiTapInteraction extends _InteractionBase_js__WEBPACK_IMPORTED_MODULE_2__.InteractionBase {
  constructor(pointData) {
    super(pointData);
    this.required = 10;
    this.counter = 0;
  }
  startInteraction() {
    var _superprop_getCanProcessKeyPress = () => super.canProcessKeyPress,
      _this = this;
    //отображение уведмоления
    this.multipleTaps = _notifications_NotificationManager_js__WEBPACK_IMPORTED_MODULE_3__.NotificationManager.getInstance().createTapCounter('exercise', 'Отжимания', 0, this.required, 'Быстро нажимайте E!');
    //логика при нажатии на кнопку
    this.handler = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (key) {
        if (key !== 69) return; //игнорирует все кнопки кроме E
        //дебаунс от спама
        if (!_superprop_getCanProcessKeyPress().call(_this, key)) {
          return;
        }
        _this.counter++;
        _this.updateInteraction(); //метод для изменения текста уведомления
        //анимация 1 отжимания (так как за 1 секунду делается только 1 отжимание)
        natives__WEBPACK_IMPORTED_MODULE_1__.taskPlayAnim(alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.scriptID, 'amb@world_human_push_ups@male@base', 'base', 8.0, -8.0, -1, 1, 0, false, false, false);
        yield wait(1000);
        //анимация ожидания следующего отжимания (следущего нажатия E)
        natives__WEBPACK_IMPORTED_MODULE_1__.taskPlayAnim(alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.scriptID, 'amb@world_human_push_ups@male@idle_a', 'idle_a', 8.0, -8.0, -1, 1, 0, false, false, false);
        if (_this.counter === _this.required) {
          _this.stopInteraction();
          natives__WEBPACK_IMPORTED_MODULE_1__.taskPlayAnim(alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.scriptID, 'amb@world_human_push_ups@male@exit', 'exit', 8.0, -8.0, -1, 0, 0, false, false, false);
          drawNotification('Задача выполнена!');
          alt_client__WEBPACK_IMPORTED_MODULE_0__.emitServer('client:succesMultiTapInteraction'); //передача на сервер информации об успешном завршении интракции
        }
      });
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();
    // регистрирует обработчик
    alt_client__WEBPACK_IMPORTED_MODULE_0__.on('keydown', this.handler);
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Создан обработчик нажатия Е');
  }

  //метод для изменения текста уведомления
  updateInteraction() {
    this.multipleTaps.update(this.counter, "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C: ".concat(this.required - this.counter, " \u0440\u0430\u0437"));
  }
  stopInteraction() {
    //проверки нужны на случай успешного выполнения и последущего выхода из колшейпа (полсле выполнения все удаляется, после выхода происходит повторная попытка удаления)
    if (this.handler) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.off('keydown', this.handler);
      this.handler = null;
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Обработчик keydown удален');
    }
    if (this.multipleTaps) {
      this.multipleTaps.hide();
      this.multipleTaps = null;
    }
  }
  getInteractionText() {
    return "Быстро нажимайте E!";
  }
}

/***/ }),

/***/ "./client/classes/Interactions/SingleTapInteraction.js":
/*!*************************************************************!*\
  !*** ./client/classes/Interactions/SingleTapInteraction.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SingleTapInteraction: () => (/* binding */ SingleTapInteraction)
/* harmony export */ });
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");
/* harmony import */ var _InteractionBase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./InteractionBase.js */ "./client/classes/Interactions/InteractionBase.js");
/* harmony import */ var _notifications_NotificationManager_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @notifications/NotificationManager.js */ "./client/classes/Notifications/NotificationManager.js");
/* harmony import */ var _classes_AnimationManager_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @classes/AnimationManager.js */ "./client/classes/AnimationManager.js");
/* harmony import */ var _notifications_PersistentNotification_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @notifications/PersistentNotification.js */ "./client/classes/Notifications/PersistentNotification.js");
/* provided dependency */ var drawNotification = __webpack_require__(/*! ./client/utilities/utilities.js */ "./client/utilities/utilities.js")["drawNotification"];
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }





class SingleTapInteraction extends _InteractionBase_js__WEBPACK_IMPORTED_MODULE_1__.InteractionBase {
  startInteraction() {
    var _this = this;
    this.notif = new _notifications_PersistentNotification_js__WEBPACK_IMPORTED_MODULE_4__.PersistentNotification(_notifications_NotificationManager_js__WEBPACK_IMPORTED_MODULE_2__.NotificationManager.getInstance(), 'vending', 'Торговый автомат', 'Нажмите E чтобы купить напиток'); //создает и запоминает webview уведомление для 1 нажатия
    this.notif.show();
    this.handler = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (key) {
        if (key !== 69) return;
        _this.stopInteraction();
        yield _classes_AnimationManager_js__WEBPACK_IMPORTED_MODULE_3__.AnimationManager.playVendingMachineAnimation(); // запуск анимации покупки в автомате
        drawNotification('Задача выполнена!');
        alt_client__WEBPACK_IMPORTED_MODULE_0__.emitServer('client:succesSingleTapInteraction'); //передача на сервер информации об успешном завршении интракции
      });
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();
    alt_client__WEBPACK_IMPORTED_MODULE_0__.on('keydown', this.handler);
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Создан обработчик нажатия Е');
  }
  stopInteraction() {
    //native.clearPedTasks(alt.Player.local.scriptID);

    //проверки нужны на случай успешного выполнения и последущего выхода из колшейпа (полсле выполнения все удаляется, после выхода происходит повторная попытка удаления)
    if (this.handler) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.off('keydown', this.handler);
      this.handler = null;
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Обработчик keydown удален');
    }
    if (this.notif) {
      this.notif.hide();
      this.notif = null;
    }
  }
  getInteractionText() {
    return "Нажмите E";
  }
}

/***/ }),

/***/ "./client/classes/Notifications/NotificationBase.js":
/*!**********************************************************!*\
  !*** ./client/classes/Notifications/NotificationBase.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NotificationBase: () => (/* binding */ NotificationBase)
/* harmony export */ });
//import * as alt from 'alt-client';

// базовый класс шаблон для наследования
class NotificationBase {
  constructor(manager, id) {
    // сохраняет ссылку на менеджер для доступа к общему состоянию
    this.manager = manager;
    this.id = id;
    // для хранения данных уведомления
    this.data = {};
  }
  show(eventName, args) {
    // отправляет событие в webview с id уведомления и аргументами
    this.manager.webView.emit(eventName, this.id, args[0], args[1], args[2], args[3]);

    // сохраняет уведомление в списке активных уведомлений
    this.manager.activeNotifications.set(this.id, {
      type: this.type,
      // тип уведомления (persistent, progress, tapCounter)
      title: this.data.title,
      // заголовок уведомления
      text: this.data.text,
      // текст уведомления
      progress: this.data.progress,
      // значение прогресса (для ProgressBar)
      currentTaps: this.data.currentTaps,
      // количество нажатий (для TapCounter)
      requiredTaps: this.data.requiredTaps // количество нажатий (для TapCounter)
    });
    this.manager.isWebViewOpen = true;
  }
  update(eventName, args) {
    this.manager.webView.emit(eventName, this.id, args[0], args[1], args[2]);
  }
  hide(eventName) {
    this.manager.webView.emit(eventName, this.id);

    // удаляет уведомление из списка активных уведомлений
    this.manager.activeNotifications.delete(this.id);

    // делает isWebViewOpen = false;
    this.manager.updateWebViewState();
  }
}

/***/ }),

/***/ "./client/classes/Notifications/NotificationManager.js":
/*!*************************************************************!*\
  !*** ./client/classes/Notifications/NotificationManager.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NotificationManager: () => (/* binding */ NotificationManager)
/* harmony export */ });
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");
/* harmony import */ var _ProgressBar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ProgressBar.js */ "./client/classes/Notifications/ProgressBar.js");
/* harmony import */ var _TapCounter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TapCounter.js */ "./client/classes/Notifications/TapCounter.js");
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }




// основной менеджер
class NotificationManager {
  static getInstance() {
    if (!this.instance) {
      // если экземпляр не существует создает его
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('instance создан в первый раз:');
      this.instance = new NotificationManager();
    }
    //alt.log('Передан instance:');
    //alt.log(`this.instance: ${JSON.stringify(this.instance, null, '\t')}`);
    // возвращает существующий или только что созданный экземпляр
    return this.instance;
  }
  constructor() {
    // защита от потворного вызова constructor
    if (NotificationManager.instance) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Повторный вызов constructor NotificationManager');
      return NotificationManager.instance;
    }
    this.webView = null; // сслыка на место хранения webview
    this.isInitialized = false; // для защиты от вызова webview до инициализации
    this.isWebViewOpen = false; // для проверки показывается ли в текущий момент webview (в теории можно убрать и проверять через this.activeNotifications.size)
    this.activeNotifications = new Map(); //хранит список всех активных webview

    NotificationManager.instance = this;
  }
  initialize() {
    var _this = this;
    return _asyncToGenerator(function* () {
      // защита от повторной инициализации
      if (_this.isInitialized) {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log('NotificationManager уже инициализирован (ПОВТОРНАЯ ПОПЫТКА ВЫЗОВА INITIALIZE)');
        return;
      }
      yield _this.init();
    })();
  }
  init() {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      _this2.webView = new alt_client__WEBPACK_IMPORTED_MODULE_0__.WebView("http://resource/client/html/index.html");
      var resolveLoad, resolveTimeout;
      var isResolved = false;
      //попытка инициализации, если не инициализируется за 2 секунды будет isLoaded false
      var loadPromise = new Promise(resolve => {
        resolveLoad = () => {
          if (!isResolved) {
            //защита от повторого завершения промиса для Promise.race
            isResolved = true;
            resolve(true);
          }
        };
      });
      var timeoutPromise = new Promise(resolve => {
        resolveTimeout = () => {
          if (!isResolved) {
            //защита от повторого завершения промиса для Promise.race
            isResolved = true;
            resolve(false);
          }
        };
      });
      _this2.webView.once("load", resolveLoad);
      alt_client__WEBPACK_IMPORTED_MODULE_0__.setTimeout(resolveTimeout, 2000);
      var isLoaded = yield Promise.race([loadPromise, timeoutPromise]);
      _this2.isInitialized = isLoaded;
    })();
  }
  createProgressBar(id, title) {
    var progress = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var text = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
    var progressBar = new _ProgressBar_js__WEBPACK_IMPORTED_MODULE_1__.ProgressBar(this, id, title, progress, text); // создает ProgressBar с переданными параметрами
    progressBar.show();
    return progressBar; //возвращает ProgressBar для запоминаяния в классе Interaction
  }
  createTapCounter(id, title) {
    var currentTaps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var requiredTaps = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var text = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
    var tapCounter = new _TapCounter_js__WEBPACK_IMPORTED_MODULE_2__.TapCounter(this, id, title, currentTaps, requiredTaps, text); // создает TapCounter с переданными параметрами
    tapCounter.show();
    return tapCounter; //возвращает TapCounter для запоминаяния в класс Interaction
  }

  // общий метод для isWebViewOpen = false;
  updateWebViewState() {
    if (this.activeNotifications.size === 0) {
      this.isWebViewOpen = false;
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('updateWebViewState сделал isWebViewOpen = false;');
    }
  }
}
_defineProperty(NotificationManager, "instance", null);

/***/ }),

/***/ "./client/classes/Notifications/PersistentNotification.js":
/*!****************************************************************!*\
  !*** ./client/classes/Notifications/PersistentNotification.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PersistentNotification: () => (/* binding */ PersistentNotification)
/* harmony export */ });
/* harmony import */ var _NotificationBase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NotificationBase.js */ "./client/classes/Notifications/NotificationBase.js");


// класс для стандартных уведомлений с текстом 
class PersistentNotification extends _NotificationBase_js__WEBPACK_IMPORTED_MODULE_0__.NotificationBase {
  constructor(manager, id, title, text) {
    // вызов конструктора базового класса
    super(manager, id);
    // тип уведомления для идентификации
    this.type = "persistent";
    // инциализация данных для стандартного уведомления
    this.data = {
      title: title,
      text: text
    };
  }
  show() {
    // защита от использования webview до инициализации 
    if (!this.manager.isInitialized) return;
    // вызов метода базового класса для show
    super.show("showPersistentNotification", [this.data.title, this.data.text]);
  }
  update(title, text) {
    // защита от использования webview до инициализации 
    if (!this.manager.isInitialized) return;

    // обновляет заголовок и текст уведомления если передан новый
    if (title !== undefined) {
      this.data.title = title;
    }
    if (text !== undefined) {
      this.data.text = text;
    }

    // вызов метода базового класса с обновленными данными
    super.update("updatePersistentNotification", [this.data.title, this.data.text]);
  }
  hide() {
    // защита от использования webview до инициализации 
    if (!this.manager.isInitialized) return;
    // вызов метода базового класса для скрытия
    super.hide("hidePersistentNotification");
  }
}

/***/ }),

/***/ "./client/classes/Notifications/ProgressBar.js":
/*!*****************************************************!*\
  !*** ./client/classes/Notifications/ProgressBar.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProgressBar: () => (/* binding */ ProgressBar)
/* harmony export */ });
/* harmony import */ var _NotificationBase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NotificationBase.js */ "./client/classes/Notifications/NotificationBase.js");

// класс для уведомлений с прогресс-баром
class ProgressBar extends _NotificationBase_js__WEBPACK_IMPORTED_MODULE_0__.NotificationBase {
  constructor(manager, id, title, initialProgress, text) {
    // вызов конструктора базового класса
    super(manager, id);
    // тип уведомления для идентификации
    this.type = "progress";
    // инциализация данных для прогресс-бара
    this.data = {
      title: title,
      // заголовок прогресс-бара
      progress: initialProgress || 0,
      // начальное значение прогресса (по умолчанию 0)
      text: text // текст под прогресс-баром
    };
  }
  show() {
    // защита от использования webview до инициализации
    if (!this.manager.isInitialized) return;
    // вызов метода базового класса с данными прогресс-бара
    super.show("showProgressBar", [this.data.title, this.data.progress, this.data.text]);
  }
  update(progress, text) {
    // защита от использования webview до инициализации 
    if (!this.manager.isInitialized) return;

    // обновление значения прогресса
    this.data.progress = progress;
    // обновляет текст если передан новый
    if (text !== undefined) this.data.text = text;

    // вызов метода базового класса с обновленными данными прогресса
    super.update("updateProgressBar", [this.data.progress, this.data.text]);
  }
  hide() {
    // защита от использования webview до инициализации 
    if (!this.manager.isInitialized) return;
    // вызов метода базового класса для скрытия ProgressBar
    super.hide("hideProgressBar");
  }
}

/***/ }),

/***/ "./client/classes/Notifications/TapCounter.js":
/*!****************************************************!*\
  !*** ./client/classes/Notifications/TapCounter.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TapCounter: () => (/* binding */ TapCounter)
/* harmony export */ });
/* harmony import */ var _NotificationBase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NotificationBase.js */ "./client/classes/Notifications/NotificationBase.js");


// класс для уведомлений счетчиков нажатий
class TapCounter extends _NotificationBase_js__WEBPACK_IMPORTED_MODULE_0__.NotificationBase {
  constructor(manager, id, title, currentTaps, requiredTaps, text) {
    // вызов конструктора базового класса
    super(manager, id);
    // тип уведомления для идентификации
    this.type = "tapCounter";
    // инициализирует данные счетчика нажатий
    this.data = {
      title: title,
      currentTaps: currentTaps,
      requiredTaps: requiredTaps,
      text: text
    };
  }
  show() {
    // защита от использования webview до инициализации
    if (!this.manager.isInitialized) return;
    // вызов метода базового класса с данными счетчика
    super.show("showTapCounter", [this.data.title, this.data.currentTaps, this.data.requiredTaps, this.data.text]);
  }
  update(currentTaps, text) {
    // защита от использования webview до инициализации
    if (!this.manager.isInitialized) return;
    this.data.currentTaps = currentTaps;
    if (text !== undefined) this.data.text = text;

    //вызов метода базового класса с обновленными данными счетчика
    super.update("updateTapCounter", [this.data.currentTaps, this.data.text]);
  }
  hide() {
    // защита от использования webview до инициализации 
    if (!this.manager.isInitialized) return;
    //вызов метода базового класса для скрытия счетчика
    super.hide("hideTapCounter");
  }
}

/***/ }),

/***/ "./client/classes/PointVisuals.js":
/*!****************************************!*\
  !*** ./client/classes/PointVisuals.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PointVisuals: () => (/* binding */ PointVisuals)
/* harmony export */ });
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");


// класс для создания и уничтожения визуальных элементов точки и колшейпов
class PointVisuals {
  constructor(position) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this.position = position;
    this.config = config;
    this.marker = null;
    this.colshape = null;
  }
  create() {
    var marker = new alt_client__WEBPACK_IMPORTED_MODULE_0__.Marker(this.config.markerType, this.position, this.config.color);
    marker.scale = this.config.scale;
    var colshape = new alt_client__WEBPACK_IMPORTED_MODULE_0__.ColshapeSphere(this.position.x, this.position.y, this.position.z + this.config.heightOffset, this.config.radius);
    return {
      marker,
      colshape
    };
  }
  destroy() {
    if (this.marker && this.marker.destroy) {
      this.marker.destroy();
      this.marker = null;
    }
    if (this.colshape && this.colshape.destroy) {
      this.colshape.destroy();
      this.colshape = null;
    }
  }
}

/***/ }),

/***/ "./client/config/InteractionConfig.js":
/*!********************************************!*\
  !*** ./client/config/InteractionConfig.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   animationConfig: () => (/* binding */ animationConfig),
/* harmony export */   interactionPoints: () => (/* binding */ interactionPoints)
/* harmony export */ });
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");
/* provided dependency */ var InteractionType = __webpack_require__(/*! ./shared/Consts.js */ "./shared/Consts.js")["InteractionType"];

var interactionPoints = [{
  //данные точки для взлома машины
  position: new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(-1275.08, -1431.94, 3.47),
  config: {
    interactionType: InteractionType.VEHICLE,
    color: new alt_client__WEBPACK_IMPORTED_MODULE_0__.RGBA(241, 196, 15),
    scale: new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(1.5, 1.5, 1.5),
    markerType: 1,
    heightOffset: 1,
    // + по координате z
    radius: 1
  }
}, {
  //данные точки для упражнений
  position: new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(-1273.76, -1427.74, 3.34),
  config: {
    interactionType: InteractionType.EXERCISE,
    color: new alt_client__WEBPACK_IMPORTED_MODULE_0__.RGBA(46, 204, 113),
    scale: new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(1.5, 1.5, 1.5),
    markerType: 1,
    heightOffset: 1,
    // + по координате z
    radius: 1
  }
}, {
  //данные точки для автомата с колой
  position: new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(-1269.45, -1428.14, 3.34),
  config: {
    interactionType: InteractionType.VENDING,
    color: new alt_client__WEBPACK_IMPORTED_MODULE_0__.RGBA(52, 152, 219),
    scale: new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(1.5, 1.5, 1.5),
    markerType: 1,
    heightOffset: 1,
    radius: 1
  }
}];
var animationConfig = {
  // Настройки для спавна пропов
  propSettings: {
    boneIndex: 71,
    // индекс кости правой руки
    // настройки для разных моделей пропов
    modelOffsets: {
      'ng_proc_sodacan_01a': {
        offsetX: 0.12,
        offsetY: -0.07,
        offsetZ: -0.07,
        rotX: -70.0,
        rotY: 0.0,
        rotZ: 0.0
      }
    },
    // общие настройки для attachEntityToEntity
    attachSettings: {
      p9: false,
      // false обычный attach
      useSoftPinning: true,
      // мягкое прикрепление
      collision: false,
      // учитывать коллизии
      isPed: true,
      // объект прикреплён к педу
      vertexIndex: 0,
      // индекс вершины
      fixedRot: true,
      // фиксировать вращение
      p15: 0 // вроде как разеревный параметр который ничего не делает
    }
  },
  // настройки для анимации торгового автомата
  vendingMachine: {
    position: {
      x: -1269.3890380859375,
      y: -1428.19775390625,
      z: 4.3421630859375,
      rotZ: -51.023
    },
    animations: {
      dict: 'mini@sprunk',
      use: 'plyr_buy_drink_pt1',
      drink: 'plyr_buy_drink_pt2'
    }
  }
};

/***/ }),

/***/ "./client/utilities/utilities.js":
/*!***************************************!*\
  !*** ./client/utilities/utilities.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   drawNotification: () => (/* binding */ drawNotification),
/* harmony export */   wait: () => (/* binding */ wait)
/* harmony export */ });
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");
/* harmony import */ var natives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! natives */ "natives");


function wait(ms) {
  return new Promise(resolve => alt_client__WEBPACK_IMPORTED_MODULE_0__.setTimeout(resolve, ms));
}

//для вызова уведомлений со стороны сервера
//alt.onServer('drawNotification', drawNotification);

//вызов гташных уведмолени с помощью нативок 
function drawNotification(message) {
  var autoHide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  natives__WEBPACK_IMPORTED_MODULE_1__.beginTextCommandThefeedPost('STRING');
  natives__WEBPACK_IMPORTED_MODULE_1__.addTextComponentSubstringPlayerName(message);
  var notificationId = natives__WEBPACK_IMPORTED_MODULE_1__.endTextCommandThefeedPostTicker(false, false);
  // Таймер для скрытия уведомления через 3 секунды если кроме текста сообщения также передали true
  if (autoHide) {
    alt_client__WEBPACK_IMPORTED_MODULE_0__.setTimeout(() => {
      natives__WEBPACK_IMPORTED_MODULE_1__.thefeedRemoveItem(notificationId);
    }, 3000);
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

/***/ "alt-client":
/*!*****************************!*\
  !*** external "alt-client" ***!
  \*****************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_alt_client_680395b4__;

/***/ }),

/***/ "natives":
/*!**************************!*\
  !*** external "natives" ***!
  \**************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_natives__;

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
  !*** ./client/startClient.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");
/* harmony import */ var _classes_AnimationManager_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @classes/AnimationManager.js */ "./client/classes/AnimationManager.js");
/* harmony import */ var _classes_PointVisuals_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./classes/PointVisuals.js */ "./client/classes/PointVisuals.js");
/* harmony import */ var _interactions_SingleTapInteraction_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @interactions/SingleTapInteraction.js */ "./client/classes/Interactions/SingleTapInteraction.js");
/* harmony import */ var _interactions_MultiTapInteraction_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @interactions/MultiTapInteraction.js */ "./client/classes/Interactions/MultiTapInteraction.js");
/* harmony import */ var _interactions_HoldInteraction_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @interactions/HoldInteraction.js */ "./client/classes/Interactions/HoldInteraction.js");
/* harmony import */ var _notifications_NotificationManager_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @notifications/NotificationManager.js */ "./client/classes/Notifications/NotificationManager.js");
/* harmony import */ var _config_InteractionConfig_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @config/InteractionConfig.js */ "./client/config/InteractionConfig.js");
/* provided dependency */ var InteractionType = __webpack_require__(/*! ./shared/Consts.js */ "./shared/Consts.js")["InteractionType"];
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }








class Interaction {
  constructor() {
    this.currentInteraction = null;
    this.activeInteractions = null;
    this.colshapes = []; // массив существующих колшейпов
    this.markers = []; // массив существующих маркеров

    this.interactionPoints = _config_InteractionConfig_js__WEBPACK_IMPORTED_MODULE_7__.interactionPoints;
    this.init();
  }
  init() {
    var _this = this;
    return _asyncToGenerator(function* () {
      _this.initializeNotificationManager();
      alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('client:sceneDemo', /*#__PURE__*/function () {
        var _ref = _asyncToGenerator(function* (activeInteractions) {
          _this.spawnPoints(activeInteractions); //создание колшейпов и маркеров
          yield _this.preloadAnims(); //предзагрузка всех необходимых анимаций 
        });
        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
      //запрос с серввера на удаление точки (после успешного выполнения интеракции на клиенте)
      alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('client:delPoint', interactionType => {
        _this.delPoint(interactionType);
      });
      //для создания точки по команде /create (с сервера)
      alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('client:createPoint', type => {
        _this.createPoint(type);
      });
      alt_client__WEBPACK_IMPORTED_MODULE_0__.on('entityEnterColshape', (colshape, entity) => _this.handleEntityEnterColshape(colshape, entity));
      alt_client__WEBPACK_IMPORTED_MODULE_0__.on('entityLeaveColshape', (colshape, entity) => _this.handleEntityLeaveColshape(colshape, entity));
    })();
  }

  // метод для инициализации NotificationManager
  initializeNotificationManager() {
    return _asyncToGenerator(function* () {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('1. Инициализация NotificationManager');
      // получает экземпляр Singleton (создается при первом вызове)
      var notificationManager = _notifications_NotificationManager_js__WEBPACK_IMPORTED_MODULE_6__.NotificationManager.getInstance();

      //инициализирует WebView
      yield notificationManager.initialize();
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('1. NotificationManager инициализирован через Interaction');
    })();
  }

  //предзагрузка всех необходимых анимаций 
  preloadAnims() {
    return _asyncToGenerator(function* () {
      // последовательная загрузка необходимых анимаций
      yield _classes_AnimationManager_js__WEBPACK_IMPORTED_MODULE_1__.AnimationManager.loadAnimDict('mini@sprunk');
      yield _classes_AnimationManager_js__WEBPACK_IMPORTED_MODULE_1__.AnimationManager.loadAnimDict('amb@world_human_push_ups@male@base');
      yield _classes_AnimationManager_js__WEBPACK_IMPORTED_MODULE_1__.AnimationManager.loadAnimDict('amb@world_human_push_ups@male@idle_a');
      yield _classes_AnimationManager_js__WEBPACK_IMPORTED_MODULE_1__.AnimationManager.loadAnimDict('amb@world_human_push_ups@male@exit');
      yield _classes_AnimationManager_js__WEBPACK_IMPORTED_MODULE_1__.AnimationManager.loadAnimDict('amb@world_human_stand_mobile@male@text@base');
    })();
  }
  spawnPoints(activeInteractions) {
    //alt.log(`activeInteractions ${activeInteractions}`)
    this.interactionPoints.forEach((point, index) => {
      if (activeInteractions.includes(point.config.interactionType)) {
        var visuals = new _classes_PointVisuals_js__WEBPACK_IMPORTED_MODULE_2__.PointVisuals(point.position, point.config).create();

        // добавление дополнительных свойств для колшейпов
        visuals.colshape.interactionType = point.config.interactionType;
        visuals.colshape.pointIndex = index; // для идентификации точки

        // добавление данных созданной точки в массивы
        this.markers.push(visuals.marker);
        this.colshapes.push(visuals.colshape);
      }
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0421\u043E\u0437\u0434\u0430\u043D\u043E \u043C\u0430\u0440\u043A\u0435\u0440\u043E\u0432: ".concat(this.markers.length));
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0421\u043E\u0437\u0434\u0430\u043D\u043E \u043A\u043E\u043B\u0448\u0435\u0439\u043F\u043E\u0432: ".concat(this.colshapes.length));
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u041C\u0430\u0441\u0441\u0438\u0432 \u043A\u043E\u043B\u0448\u0435\u0439\u043F\u043E\u0432:", this.colshapes);
  }
  delPoint(interactionType) {
    // поиск индекса в массиве colshapes по interactionType
    var index = this.colshapes.findIndex(colshape => colshape && colshape.interactionType === interactionType);
    if (index === -1) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u043D\u0435\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0443\u044E \u0442\u043E\u0447\u043A\u0443: ".concat(interactionType));
      return;
    }
    var marker = this.markers[index];
    var colshape = this.colshapes[index];
    if (marker && marker.destroy) {
      marker.destroy();
      this.markers[index] = null;
    }
    if (colshape && colshape.destroy) {
      colshape.destroy();
      this.colshapes[index] = null;
    }
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0422\u043E\u0447\u043A\u0430 \u0441 interactionType ".concat(interactionType, " \u0443\u0434\u0430\u043B\u0435\u043D\u0430."));
  }
  //для создания точки по команде /create (с сервера)
  createPoint(type) {
    //поиск по инедексу 
    var pointIndex = this.interactionPoints.findIndex(point => point.config.interactionType === type);
    if (pointIndex === -1) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u0438\u043F \u0442\u043E\u0447\u043A\u0438: ".concat(type));
      return;
    }
    var pointData = this.interactionPoints[pointIndex]; // получение данных по индексу

    var visuals = new _classes_PointVisuals_js__WEBPACK_IMPORTED_MODULE_2__.PointVisuals(pointData.position, pointData.config).create();

    // Добавление дополнительных свойств для колшейпов
    visuals.colshape.interactionType = pointData.config.interactionType;
    visuals.colshape.pointIndex = pointIndex;

    // добавление данных созданной точки в массивы
    this.markers.push(visuals.marker);
    this.colshapes.push(visuals.colshape);
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0421\u043E\u0437\u0434\u0430\u043D\u0430 \u0442\u043E\u0447\u043A\u0430 \u0442\u0438\u043F\u0430 ".concat(type));
  }

  //метод который вызывается при входе в колшейп
  handleEntityEnterColshape(colshape, entity) {
    if (!(entity instanceof alt_client__WEBPACK_IMPORTED_MODULE_0__.Player)) return;
    if (!colshape.interactionType) return; //если в будущем будут добавлены другие колшейпы
    if (!this.checkDistance(colshape)) return; //проверка дистанции от читеров

    this.currentInteraction = this.createInteraction(colshape.interactionType, colshape.index); //запоминает и создает webview уведмоления в зависимости от типа колшейпа в который вошел игрок
    this.currentInteraction.startInteraction(); //вызов логики для конкретного типа взаимодействия
  }

  //проверка дистанции от читеров
  checkDistance(colshape) {
    var pointData = this.interactionPoints[colshape.pointIndex];
    var distance = pointData.position.distanceTo(alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.pos);
    if (distance > 3) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log("distance: ".concat(distance, "> 3"));
      return false;
    } else {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Проверка дистанции пройдена успешно');
      return true;
    }
  }

  //метод который вызывается при выходе из колшейпа
  handleEntityLeaveColshape(colshape, entity) {
    if (!(entity instanceof alt_client__WEBPACK_IMPORTED_MODULE_0__.Player)) return;
    if (!this.currentInteraction) return; //если в будущем будут добавлены другие колшейпы

    this.currentInteraction.stopInteraction(); //вызов логики отмены для конкретного типа взаимодействия
    this.currentInteraction = null;
  }
  //создает webview уведмоления в зависимости от типа колшейпа в который вошел игрок
  createInteraction(type, index) {
    var pointData = this.interactionPoints[index];
    switch (type) {
      case InteractionType.VEHICLE:
        return new _interactions_HoldInteraction_js__WEBPACK_IMPORTED_MODULE_5__.HoldInteraction(pointData);
      case InteractionType.EXERCISE:
        return new _interactions_MultiTapInteraction_js__WEBPACK_IMPORTED_MODULE_4__.MultiTapInteraction(pointData);
      case InteractionType.VENDING:
        return new _interactions_SingleTapInteraction_js__WEBPACK_IMPORTED_MODULE_3__.SingleTapInteraction(pointData);
    }
  }
}
new Interaction();
})();

