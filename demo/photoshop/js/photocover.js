'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_OPTIONS = {
  RADIUS: 20,
  MAX_WIDTH: 800,
  COLOR: 'black',
  MOUSE: 'pen',
  PEN_BORDER_COLOR: 'red',
  ERASER_BORDER_COLOR: '#666',
  PEN: 'pen',
  ERASER: 'eraser'
};

var PhotoCover = function () {
  function PhotoCover(selector) {
    _classCallCheck(this, PhotoCover);

    this.radius = DEFAULT_OPTIONS.RADIUS;
    this.maxWidth = DEFAULT_OPTIONS.MAX_WIDTH;
    this.color = DEFAULT_OPTIONS.COLOR;
    this.mouseType = DEFAULT_OPTIONS.MOUSE;

    this.operateHistories = [];

    this.img = document.querySelector(selector);

    this.win = window;
    this.doc = document;
    this.body = this.doc.body;

    this.mouse;
    this.width;
    this.height;
    this.left;
    this.top;
    this.canvas;
    this.ctx;

    this._init();
  }

  _createClass(PhotoCover, [{
    key: '_init',
    value: function _init() {
      var _this = this;

      if (!this.img) {
        throw Error('No Image Selected');
        return;
      }

      var _ref = [this.body, this.win, this.img],
          body = _ref[0],
          win = _ref[1],
          img = _ref[2];

      // initial canvas and its size and position

      win.addEventListener('load', function (e) {
        _this.width = img.width;
        _this.height = img.height;

        _this.canvas = document.createElement('canvas');
        _this.ctx = _this.canvas.getContext('2d');
        _this._async();

        _this.canvas.width = img.width;
        _this.canvas.height = img.height;

        body.appendChild(_this.canvas);

        _this._initMouse();
      }.bind(this), false);

      // async canvas position and size during browser resize
      win.addEventListener('resize', function (e) {
        _this._async();
      }.bind(this), false);

      var currentOperate = [];

      var canvasMouseMove = function (e) {
        e.preventDefault();
        currentOperate.push(_this.drawByEvent(e));
      }.bind(this);

      // canvas down
      win.addEventListener('mousedown', function (e) {
        e.preventDefault();
        currentOperate = [];
        currentOperate.push(_this.drawByEvent(e));

        win.addEventListener('mousemove', canvasMouseMove, false);
      }.bind(this), false);

      win.addEventListener('mouseup', function (e) {
        win.removeEventListener('mousemove', canvasMouseMove, false);
        var coordinate = _this.getCoordinateByEvent(e);
        var _ref2 = [e.pageX, e.pageY],
            x = _ref2[0],
            y = _ref2[1];


        if (_this.isOnCanvas(x, y)) {
          _this.operateHistories.push(currentOperate);
          currentOperate = [];
        }
      }.bind(this), false);
    }

    // async x and y from image to canvas

  }, {
    key: '_async',
    value: function _async() {
      var coordinate = this.img.getBoundingClientRect();
      this.top = coordinate.top;
      this.left = coordinate.left;

      this.canvas.style.cssText = '\n      position: absolute;\n      left: ' + (this.left + this.body.scrollLeft) + 'px;\n      top: ' + (this.top + this.body.scrollTop) + 'px;\n      use-select: none;\n    ';
    }

    // initial mouse shape where mouse on canvas

  }, {
    key: '_initMouse',
    value: function _initMouse(type) {
      var _this2 = this;

      var _ref3 = [this.body, this.win],
          body = _ref3[0],
          win = _ref3[1];

      var mouse = document.createElement('div');
      mouse.style.cssText = '\n      display: none;\n      position: absolute;\n      left: 0;\n      top: 0;\n      width: ' + this.radius * 2 + 'px;\n      height: ' + this.radius * 2 + 'px;\n      border: 1px solid red;\n      border-radius: 100%;\n    ';
      this.mouse = mouse;

      body.appendChild(mouse);

      // change mouse style
      win.addEventListener('mousemove', function (e) {
        var _ref4 = [e.pageX, e.pageY],
            x = _ref4[0],
            y = _ref4[1];

        var isOnCanvas = _this2.isOnCanvas(x, y);

        mouse.style.transform = 'translate(' + (x - _this2.radius) + 'px, ' + (y - _this2.radius) + 'px)';

        if (!isOnCanvas) {
          mouse.style.display = 'none';
          body.style.cursor = 'default';
        } else {
          mouse.style.display = 'block';
          body.style.cursor = 'none';
        }
      }.bind(this), false);
    }
  }, {
    key: 'setRadius',
    value: function setRadius(radius) {
      if (radius < 2 || radius > 100) {
        return;
      }

      var mouse = this.mouse;
      this.radius = radius;

      mouse.style.width = radius * 2 + 'px';
      mouse.style.height = radius * 2 + 'px';
    }
  }, {
    key: 'zoomIn',
    value: function zoomIn() {
      var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

      this.setRadius(this.radius + radius);
    }
  }, {
    key: 'zoomOut',
    value: function zoomOut() {
      var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

      this.setRadius(this.radius - radius);
    }
  }, {
    key: 'drawCircle',
    value: function drawCircle(x, y, radius) {
      var ctx = this.ctx;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(x + 1, y + 1, radius || this.radius, 0, 360);
      ctx.fill();
      ctx.closePath();
    }
  }, {
    key: 'getCoordinateByEvent',
    value: function getCoordinateByEvent(event) {
      var x = void 0,
          y = void 0;
      var _ref5 = [this.doc, this.body],
          doc = _ref5[0],
          body = _ref5[1];

      var canvas = this.canvas;

      if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
      } else {
        x = e.clientX + body.scrollLeft + doc.documentElement.scrollLeft;
        y = e.clientY + body.scrollTop + doc.documentElement.scrollTop;
      }

      x -= canvas.offsetLeft;
      y -= canvas.offsetTop;

      return [x, y];
    }
  }, {
    key: 'drawByEvent',
    value: function drawByEvent(event) {
      if (!this.ctx) return;

      var ctx = this.ctx;

      var _getCoordinateByEvent = this.getCoordinateByEvent(event),
          _getCoordinateByEvent2 = _slicedToArray(_getCoordinateByEvent, 2),
          x = _getCoordinateByEvent2[0],
          y = _getCoordinateByEvent2[1];

      if (this.mouseType === DEFAULT_OPTIONS.PEN) {
        this.drawCircle(x, y);
        return [DEFAULT_OPTIONS.PEN, this.color, x, y, this.radius];
      } else if (this.mouseType === DEFAULT_OPTIONS.ERASER) {
        x -= this.radius;
        y -= this.radius;
        var w = this.radius * 2,
            h = this.radius * 2;

        ctx.clearRect(x, y, w, h);
        return [DEFAULT_OPTIONS.ERASER, x, y, w, h];
      }
    }
  }, {
    key: 'isOnCanvas',
    value: function isOnCanvas(x, y) {

      if (x < this.left || x > this.left + this.width || y < this.top || y > this.top + this.height) {
        return false;
      } else {
        return true;
      }
    }
  }, {
    key: 'setMaxWidth',
    value: function setMaxWidth(width) {
      this.maxWidth = width;
    }
  }, {
    key: 'setColor',
    value: function setColor(color) {
      this.color = color;
    }

    // pen, eraser

  }, {
    key: 'setTool',
    value: function setTool(tool) {
      this.mouseType = tool;

      if (tool.toLowerCase() === DEFAULT_OPTIONS.PEN) {
        this.setPen();
      } else if (tool.toLowerCase() === DEFAULT_OPTIONS.ERASER) {
        this.setEraser();
      }
    }
  }, {
    key: 'setPen',
    value: function setPen() {
      var mouse = this.mouse;
      Object.assign(mouse.style, {
        borderRadius: '100%',
        border: '1px solid ' + DEFAULT_OPTIONS.PEN_BORDER_COLOR
      });

      this.mouseType = DEFAULT_OPTIONS.PEN;
    }
  }, {
    key: 'setEraser',
    value: function setEraser() {
      var mouse = this.mouse;
      Object.assign(mouse.style, {
        borderRadius: 0,
        border: '1px dashed ' + DEFAULT_OPTIONS.ERASER_BORDER_COLOR
      });

      this.mouseType = DEFAULT_OPTIONS.ERASER;
    }
  }, {
    key: 'undo',
    value: function undo() {
      var _this3 = this;

      var ctx = this.ctx;
      var color = this.color;

      ctx.clearRect(0, 0, this.width, this.height);
      this.operateHistories.pop();

      this.operateHistories.map(function (steps) {
        steps.map(function (step) {
          if (step[0] === DEFAULT_OPTIONS.PEN) {
            _this3.color = step[1];
            _this3.drawCircle.apply(_this3, step.slice(2));
          } else if (step[0] === DEFAULT_OPTIONS.ERASER) {
            ctx.clearRect.apply(ctx, step.slice(1));
          }
        });
      });

      this.color = color;
    }
  }, {
    key: 'getDataURL',
    value: function getDataURL() {
      var tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.width;
      tempCanvas.height = this.height;
      var tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(this.img, 0, 0, this.width, this.height);
      tempCtx.drawImage(this.canvas, 0, 0, this.width, this.height);

      return tempCanvas.toDataURL();
    }
  }]);

  return PhotoCover;
}();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBob3RvY292ZXIuanMiXSwibmFtZXMiOlsiREVGQVVMVF9PUFRJT05TIiwiUkFESVVTIiwiTUFYX1dJRFRIIiwiQ09MT1IiLCJNT1VTRSIsIlBFTl9CT1JERVJfQ09MT1IiLCJFUkFTRVJfQk9SREVSX0NPTE9SIiwiUEVOIiwiRVJBU0VSIiwiUGhvdG9Db3ZlciIsInNlbGVjdG9yIiwicmFkaXVzIiwibWF4V2lkdGgiLCJjb2xvciIsIm1vdXNlVHlwZSIsIm9wZXJhdGVIaXN0b3JpZXMiLCJpbWciLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJ3aW4iLCJ3aW5kb3ciLCJkb2MiLCJib2R5IiwibW91c2UiLCJ3aWR0aCIsImhlaWdodCIsImxlZnQiLCJ0b3AiLCJjYW52YXMiLCJjdHgiLCJfaW5pdCIsIkVycm9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJjcmVhdGVFbGVtZW50IiwiZ2V0Q29udGV4dCIsIl9hc3luYyIsImFwcGVuZENoaWxkIiwiX2luaXRNb3VzZSIsImJpbmQiLCJjdXJyZW50T3BlcmF0ZSIsImNhbnZhc01vdXNlTW92ZSIsInByZXZlbnREZWZhdWx0IiwicHVzaCIsImRyYXdCeUV2ZW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNvb3JkaW5hdGUiLCJnZXRDb29yZGluYXRlQnlFdmVudCIsInBhZ2VYIiwicGFnZVkiLCJ4IiwieSIsImlzT25DYW52YXMiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJzdHlsZSIsImNzc1RleHQiLCJzY3JvbGxMZWZ0Iiwic2Nyb2xsVG9wIiwidHlwZSIsInRyYW5zZm9ybSIsImRpc3BsYXkiLCJjdXJzb3IiLCJzZXRSYWRpdXMiLCJmaWxsU3R5bGUiLCJiZWdpblBhdGgiLCJhcmMiLCJmaWxsIiwiY2xvc2VQYXRoIiwiZXZlbnQiLCJjbGllbnRYIiwiZG9jdW1lbnRFbGVtZW50IiwiY2xpZW50WSIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJkcmF3Q2lyY2xlIiwidyIsImgiLCJjbGVhclJlY3QiLCJ0b29sIiwidG9Mb3dlckNhc2UiLCJzZXRQZW4iLCJzZXRFcmFzZXIiLCJPYmplY3QiLCJhc3NpZ24iLCJib3JkZXJSYWRpdXMiLCJib3JkZXIiLCJwb3AiLCJtYXAiLCJzdGVwcyIsInN0ZXAiLCJhcHBseSIsInNsaWNlIiwidGVtcENhbnZhcyIsInRlbXBDdHgiLCJkcmF3SW1hZ2UiLCJ0b0RhdGFVUkwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsSUFBTUEsa0JBQWtCO0FBQ3RCQyxVQUFRLEVBRGM7QUFFdEJDLGFBQVcsR0FGVztBQUd0QkMsU0FBTyxPQUhlO0FBSXRCQyxTQUFPLEtBSmU7QUFLdEJDLG9CQUFrQixLQUxJO0FBTXRCQyx1QkFBcUIsTUFOQztBQU90QkMsT0FBSyxLQVBpQjtBQVF0QkMsVUFBUTtBQVJjLENBQXhCOztJQVdNQyxVO0FBQ0osc0JBQVlDLFFBQVosRUFBc0I7QUFBQTs7QUFDcEIsU0FBS0MsTUFBTCxHQUFjWCxnQkFBZ0JDLE1BQTlCO0FBQ0EsU0FBS1csUUFBTCxHQUFnQlosZ0JBQWdCRSxTQUFoQztBQUNBLFNBQUtXLEtBQUwsR0FBYWIsZ0JBQWdCRyxLQUE3QjtBQUNBLFNBQUtXLFNBQUwsR0FBaUJkLGdCQUFnQkksS0FBakM7O0FBRUEsU0FBS1csZ0JBQUwsR0FBd0IsRUFBeEI7O0FBRUEsU0FBS0MsR0FBTCxHQUFXQyxTQUFTQyxhQUFULENBQXVCUixRQUF2QixDQUFYOztBQUVBLFNBQUtTLEdBQUwsR0FBV0MsTUFBWDtBQUNBLFNBQUtDLEdBQUwsR0FBV0osUUFBWDtBQUNBLFNBQUtLLElBQUwsR0FBWSxLQUFLRCxHQUFMLENBQVNDLElBQXJCOztBQUVBLFNBQUtDLEtBQUw7QUFDQSxTQUFLQyxLQUFMO0FBQ0EsU0FBS0MsTUFBTDtBQUNBLFNBQUtDLElBQUw7QUFDQSxTQUFLQyxHQUFMO0FBQ0EsU0FBS0MsTUFBTDtBQUNBLFNBQUtDLEdBQUw7O0FBRUEsU0FBS0MsS0FBTDtBQUNEOzs7OzRCQUVPO0FBQUE7O0FBQ04sVUFBSSxDQUFDLEtB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QXZCLENBQWpCO0FBQ0EwRCxpQkFBV3BFLEtBQVgsR0FBbUIsS0FBS0EsS0FBeEI7QUFDQW9FLGlCQUFXbkUsTUFBWCxHQUFvQixLQUFLQSxNQUF6QjtBQUNBLFVBQUlvRSxVQUFVRCxXQUFXekQsVUFBWCxDQUFzQixJQUF0QixDQUFkO0FBQ0EwRCxjQUFRQyxTQUFSLENBQWtCLEtBQUs5RSxHQUF2QixFQUE0QixDQUE1QixFQUErQixDQUEvQixFQUFrQyxLQUFLUSxLQUF2QyxFQUE4QyxLQUFLQyxNQUFuRDtBQUNBb0UsY0FBUUMsU0FBUixDQUFrQixLQUFLbEUsTUFBdkIsRUFBK0IsQ0FBL0IsRUFBa0MsQ0FBbEMsRUFBcUMsS0FBS0osS0FBMUMsRUFBaUQsS0FBS0MsTUFBdEQ7O0FBRUEsYUFBT21FLFdBQVdHLFNBQVgsRUFBUDtBQUNIIiwiZmlsZSI6InBob3RvY292ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBERUZBVUxUX09QVElPTlMgPSB7XHJcbiAgUkFESVVTOiAyMCxcclxuICBNQVhfV0lEVEg6IDgwMCxcclxuICBDT0xPUjogJ2JsYWNrJyxcclxuICBNT1VTRTogJ3BlbicsXHJcbiAgUEVOX0JPUkRFUl9DT0xPUjogJ3JlZCcsXHJcbiAgRVJBU0VSX0JPUkRFUl9DT0xPUjogJyM2NjYnLFxyXG4gIFBFTjogJ3BlbicsXHJcbiAgRVJBU0VSOiAnZXJhc2VyJ1xyXG59XHJcblxyXG5jbGFzcyBQaG90b0NvdmVyIHtcclxuICBjb25zdHJ1Y3RvcihzZWxlY3Rvcikge1xyXG4gICAgdGhpcy5yYWRpdXMgPSBERUZBVUxUX09QVElPTlMuUkFESVVTXHJcbiAgICB0aGlzLm1heFdpZHRoID0gREVGQVVMVF9PUFRJT05TLk1BWF9XSURUSFxyXG4gICAgdGhpcy5jb2xvciA9IERFRkFVTFRfT1BUSU9OUy5DT0xPUlxyXG4gICAgdGhpcy5tb3VzZVR5cGUgPSBERUZBVUxUX09QVElPTlMuTU9VU0VcclxuXHJcbiAgICB0aGlzLm9wZXJhdGVIaXN0b3JpZXMgPSBbXVxyXG5cclxuICAgIHRoaXMuaW1nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcclxuXHJcbiAgICB0aGlzLndpbiA9IHdpbmRvd1xyXG4gICAgdGhpcy5kb2MgPSBkb2N1bWVudFxyXG4gICAgdGhpcy5ib2R5ID0gdGhpcy5kb2MuYm9keVxyXG5cclxuICAgIHRoaXMubW91c2VcclxuICAgIHRoaXMud2lkdGhcclxuICAgIHRoaXMuaGVpZ2h0XHJcbiAgICB0aGlzLmxlZnRcclxuICAgIHRoaXMudG9wXHJcbiAgICB0aGlzLmNhbnZhc1xyXG4gICAgdGhpcy5jdHhcclxuXHJcbiAgICB0aGlzLl9pbml0KClcclxuICB9XHJcblxyXG4gIF9pbml0KCkge1xyXG4gICAgaWYgKCF0aGlzLmltZykge1xyXG4gICAgICB0aHJvdyBFcnJvcignTm8gSW1hZ2UgU2VsZWN0ZWQnKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBsZXQgW2JvZHksIHdpbiwgaW1nXSA9IFt0aGlzLmJvZHksIHRoaXMud2luLCB0aGlzLmltZ11cclxuXHJcbiAgICAvLyBpbml0aWFsIGNhbnZhcyBhbmQgaXRzIHNpemUgYW5kIHBvc2l0aW9uXHJcbiAgICB3aW4uYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgoZSkgPT4ge1xyXG4gICAgICB0aGlzLndpZHRoID0gaW1nLndpZHRoXHJcbiAgICAgIHRoaXMuaGVpZ2h0ID0gaW1nLmhlaWdodFxyXG5cclxuICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxyXG4gICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuICAgICAgdGhpcy5fYXN5bmMoKVxyXG5cclxuICAgICAgdGhpcy5jYW52YXMud2lkdGggPSBpbWcud2lkdGhcclxuICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodFxyXG5cclxuICAgICAgYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcylcclxuXHJcbiAgICAgIHRoaXMuX2luaXRNb3VzZSgpXHJcblxyXG4gICAgfSkuYmluZCh0aGlzKSwgZmFsc2UpXHJcblxyXG5cclxuICAgIC8vIGFzeW5jIGNhbnZhcyBwb3NpdGlvbiBhbmQgc2l6ZSBkdXJpbmcgYnJvd3NlciByZXNpemVcclxuICAgIHdpbi5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKGUpID0+IHtcclxuICAgICAgdGhpcy5fYXN5bmMoKVxyXG4gICAgfSkuYmluZCh0aGlzKSwgZmFsc2UpXHJcblxyXG5cclxuICAgIGxldCBjdXJyZW50T3BlcmF0ZSA9IFtdXHJcblxyXG4gICAgbGV0IGNhbnZhc01vdXNlTW92ZSA9ICgoZSkgPT4ge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgY3VycmVudE9wZXJhdGUucHVzaCh0aGlzLmRyYXdCeUV2ZW50KGUpKVxyXG4gICAgfSkuYmluZCh0aGlzKVxyXG5cclxuICAgIC8vIGNhbnZhcyBkb3duXHJcbiAgICB3aW4uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKChlKSA9PiB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBjdXJyZW50T3BlcmF0ZSA9IFtdXHJcbiAgICAgIGN1cnJlbnRPcGVyYXRlLnB1c2godGhpcy5kcmF3QnlFdmVudChlKSlcclxuXHJcbiAgICAgIHdpbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBjYW52YXNNb3VzZU1vdmUsIGZhbHNlKVxyXG4gICAgfSkuYmluZCh0aGlzKSwgZmFsc2UpXHJcblxyXG4gICAgd2luLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoKGUpID0+IHtcclxuICAgICAgd2luLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGNhbnZhc01vdXNlTW92ZSwgZmFsc2UpXHJcbiAgICAgIGxldCBjb29yZGluYXRlID0gdGhpcy5nZXRDb29yZGluYXRlQnlFdmVudChlKVxyXG4gICAgICBsZXQgW3gsIHldID0gW2UucGFnZVgsIGUucGFnZVldXHJcblxyXG4gICAgICBpZiAodGhpcy5pc09uQ2FudmFzKHgsIHkpKSB7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlSGlzdG9yaWVzLnB1c2goY3VycmVudE9wZXJhdGUpXHJcbiAgICAgICAgY3VycmVudE9wZXJhdGUgPSBbXVxyXG4gICAgICB9XHJcbiAgICB9KS5iaW5kKHRoaXMpLCBmYWxzZSlcclxuICB9XHJcblxyXG4gIC8vIGFzeW5jIHggYW5kIHkgZnJvbSBpbWFnZSB0byBjYW52YXNcclxuICBfYXN5bmMoKSB7XHJcbiAgICBsZXQgY29vcmRpbmF0ZSA9IHRoaXMuaW1nLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgICB0aGlzLnRvcCA9IGNvb3JkaW5hdGUudG9wXHJcbiAgICB0aGlzLmxlZnQgPSBjb29yZGluYXRlLmxlZnRcclxuXHJcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gYFxyXG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgIGxlZnQ6ICR7dGhpcy5sZWZ0ICsgdGhpcy5ib2R5LnNjcm9sbExlZnR9cHg7XHJcbiAgICAgIHRvcDogJHt0aGlzLnRvcCArIHRoaXMuYm9keS5zY3JvbGxUb3B9cHg7XHJcbiAgICAgIHVzZS1zZWxlY3Q6IG5vbmU7XHJcbiAgICBgXHJcbiAgfVxyXG5cclxuICAvLyBpbml0aWFsIG1vdXNlIHNoYXBlIHdoZXJlIG1vdXNlIG9uIGNhbnZhc1xyXG4gIF9pbml0TW91c2UodHlwZSkge1xyXG4gICAgbGV0IFtib2R5LCB3aW5dID0gW3RoaXMuYm9keSwgdGhpcy53aW5dXHJcbiAgICBsZXQgbW91c2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgbW91c2Uuc3R5bGUuY3NzVGV4dCA9IGBcclxuICAgICAgZGlzcGxheTogbm9uZTtcclxuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgICBsZWZ0OiAwO1xyXG4gICAgICB0b3A6IDA7XHJcbiAgICAgIHdpZHRoOiAke3RoaXMucmFkaXVzICogMn1weDtcclxuICAgICAgaGVpZ2h0OiAke3RoaXMucmFkaXVzICogMn1weDtcclxuICAgICAgYm9yZGVyOiAxcHggc29saWQgcmVkO1xyXG4gICAgICBib3JkZXItcmFkaXVzOiAxMDAlO1xyXG4gICAgYFxyXG4gICAgdGhpcy5tb3VzZSA9IG1vdXNlXHJcblxyXG4gICAgYm9keS5hcHBlbmRDaGlsZChtb3VzZSlcclxuXHJcbiAgICAvLyBjaGFuZ2UgbW91c2Ugc3R5bGVcclxuICAgIHdpbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoKGUpID0+IHtcclxuICAgICAgbGV0IFt4LCB5XSA9IFtlLnBhZ2VYLCBlLnBhZ2VZXVxyXG4gICAgICBsZXQgaXNPbkNhbnZhcyA9IHRoaXMuaXNPbkNhbnZhcyh4LCB5KVxyXG5cclxuICAgICAgbW91c2Uuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3ggLSB0aGlzLnJhZGl1c31weCwgJHt5IC0gdGhpcy5yYWRpdXN9cHgpYFxyXG5cclxuICAgICAgaWYgKCFpc09uQ2FudmFzKSB7XHJcbiAgICAgICAgbW91c2Uuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgIGJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbW91c2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICAgICAgICBib2R5LnN0eWxlLmN1cnNvciA9ICdub25lJ1xyXG4gICAgICB9XHJcblxyXG4gICAgfSkuYmluZCh0aGlzKSwgZmFsc2UpXHJcblxyXG4gIH1cclxuXHJcbiAgc2V0UmFkaXVzKHJhZGl1cykge1xyXG4gICAgaWYgKHJhZGl1cyA8IDIgfHwgcmFkaXVzID4gMTAwKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGxldCBtb3VzZSA9IHRoaXMubW91c2VcclxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzXHJcblxyXG4gICAgbW91c2Uuc3R5bGUud2lkdGggPSByYWRpdXMgKiAyICsgJ3B4J1xyXG4gICAgbW91c2Uuc3R5bGUuaGVpZ2h0ID0gcmFkaXVzICogMiArICdweCdcclxuICB9XHJcblxyXG4gIHpvb21JbihyYWRpdXMgPSAyKSB7XHJcbiAgICB0aGlzLnNldFJhZGl1cyh0aGlzLnJhZGl1cyArIHJhZGl1cylcclxuICB9XHJcblxyXG4gIHpvb21PdXQocmFkaXVzID0gMikge1xyXG4gICAgdGhpcy5zZXRSYWRpdXModGhpcy5yYWRpdXMgLSByYWRpdXMpXHJcbiAgfVxyXG5cclxuICBkcmF3Q2lyY2xlKHgsIHksIHJhZGl1cykge1xyXG4gICAgbGV0IGN0eCA9IHRoaXMuY3R4XHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LmFyYyh4ICsgMSwgeSArIDEsIHJhZGl1cyB8fCB0aGlzLnJhZGl1cywgMCwgMzYwKVxyXG4gICAgY3R4LmZpbGwoKVxyXG4gICAgY3R4LmNsb3NlUGF0aCgpXHJcbiAgfVxyXG5cclxuXHJcbiAgZ2V0Q29vcmRpbmF0ZUJ5RXZlbnQoZXZlbnQpIHtcclxuICAgIGxldCB4LCB5XHJcbiAgICBsZXQgW2RvYywgYm9keV0gPSBbdGhpcy5kb2MsIHRoaXMuYm9keV1cclxuICAgIGxldCBjYW52YXMgPSB0aGlzLmNhbnZhc1xyXG5cclxuXHJcbiAgICBpZiAoZXZlbnQucGFnZVggfHwgZXZlbnQucGFnZVkpIHtcclxuICAgICAgeCA9IGV2ZW50LnBhZ2VYXHJcbiAgICAgIHkgPSBldmVudC5wYWdlWVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgeCA9IGUuY2xpZW50WCArIGJvZHkuc2Nyb2xsTGVmdCArIGRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdFxyXG4gICAgICB5ID0gZS5jbGllbnRZICsgYm9keS5zY3JvbGxUb3AgKyBkb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxyXG4gICAgfVxyXG5cclxuICAgIHggLT0gY2FudmFzLm9mZnNldExlZnRcclxuICAgIHkgLT0gY2FudmFzLm9mZnNldFRvcFxyXG5cclxuICAgIHJldHVybiBbeCwgeV1cclxuICB9XHJcblxyXG4gIGRyYXdCeUV2ZW50KGV2ZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuY3R4KSByZXR1cm5cclxuXHJcbiAgICBsZXQgY3R4ID0gdGhpcy5jdHhcclxuICAgIGxldCBbeCwgeV09IHRoaXMuZ2V0Q29vcmRpbmF0ZUJ5RXZlbnQoZXZlbnQpXHJcblxyXG4gICAgaWYgKHRoaXMubW91c2VUeXBlID09PSBERUZBVUxUX09QVElPTlMuUEVOKSB7XHJcbiAgICAgIHRoaXMuZHJhd0NpcmNsZSh4LCB5KVxyXG4gICAgICByZXR1cm4gW0RFRkFVTFRfT1BUSU9OUy5QRU4sIHRoaXMuY29sb3IsIHgsIHksIHRoaXMucmFkaXVzXVxyXG4gICAgfSBlbHNlIGlmICh0aGlzLm1vdXNlVHlwZSA9PT0gREVGQVVMVF9PUFRJT05TLkVSQVNFUikge1xyXG4gICAgICB4IC09IHRoaXMucmFkaXVzXHJcbiAgICAgIHkgLT0gdGhpcy5yYWRpdXNcclxuICAgICAgbGV0IFt3LCBoXSA9IFt0aGlzLnJhZGl1cyAqIDIsIHRoaXMucmFkaXVzICogMl1cclxuICAgICAgY3R4LmNsZWFyUmVjdCh4LCB5LCB3LCBoKVxyXG4gICAgICByZXR1cm4gW0RFRkFVTFRfT1BUSU9OUy5FUkFTRVIsIHgsIHksIHcsIGhdXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpc09uQ2FudmFzKHgsIHkpIHtcclxuXHJcbiAgICBpZiAoeCA8IHRoaXMubGVmdCB8fCB4ID4gKHRoaXMubGVmdCArIHRoaXMud2lkdGgpIHx8IHkgPCB0aGlzLnRvcCB8fCB5ID4gKHRoaXMudG9wICsgdGhpcy5oZWlnaHQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldE1heFdpZHRoKHdpZHRoKSB7XHJcbiAgICB0aGlzLm1heFdpZHRoID0gd2lkdGhcclxuICB9XHJcblxyXG4gIHNldENvbG9yKGNvbG9yKSB7XHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3JcclxuICB9XHJcblxyXG4gIC8vIHBlbiwgZXJhc2VyXHJcbiAgc2V0VG9vbCh0b29sKSB7XHJcbiAgICB0aGlzLm1vdXNlVHlwZSA9IHRvb2xcclxuXHJcbiAgICBpZiAodG9vbC50b0xvd2VyQ2FzZSgpID09PSBERUZBVUxUX09QVElPTlMuUEVOKSB7XHJcbiAgICAgIHRoaXMuc2V0UGVuKClcclxuICAgIH0gZWxzZSBpZiAodG9vbC50b0xvd2VyQ2FzZSgpID09PSBERUZBVUxUX09QVElPTlMuRVJBU0VSKSB7XHJcbiAgICAgIHRoaXMuc2V0RXJhc2VyKClcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICBzZXRQZW4oKSB7XHJcbiAgICBsZXQgbW91c2UgPSB0aGlzLm1vdXNlXHJcbiAgICBPYmplY3QuYXNzaWduKG1vdXNlLnN0eWxlLCB7XHJcbiAgICAgIGJvcmRlclJhZGl1czogJzEwMCUnLFxyXG4gICAgICBib3JkZXI6IGAxcHggc29saWQgJHtERUZBVUxUX09QVElPTlMuUEVOX0JPUkRFUl9DT0xPUn1gXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMubW91c2VUeXBlID0gREVGQVVMVF9PUFRJT05TLlBFTlxyXG4gIH1cclxuXHJcbiAgc2V0RXJhc2VyKCkge1xyXG4gICAgbGV0IG1vdXNlID0gdGhpcy5tb3VzZVxyXG4gICAgT2JqZWN0LmFzc2lnbihtb3VzZS5zdHlsZSwge1xyXG4gICAgICBib3JkZXJSYWRpdXM6IDAsXHJcbiAgICAgIGJvcmRlcjogYDFweCBkYXNoZWQgJHtERUZBVUxUX09QVElPTlMuRVJBU0VSX0JPUkRFUl9DT0xPUn1gXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMubW91c2VUeXBlID0gREVGQVVMVF9PUFRJT05TLkVSQVNFUlxyXG4gIH1cclxuXHJcbiAgdW5kbygpIHtcclxuICAgIGxldCBjdHggPSB0aGlzLmN0eFxyXG4gICAgbGV0IGNvbG9yID0gdGhpcy5jb2xvclxyXG5cclxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpXHJcbiAgICB0aGlzLm9wZXJhdGVIaXN0b3JpZXMucG9wKClcclxuXHJcbiAgICB0aGlzLm9wZXJhdGVIaXN0b3JpZXMubWFwKChzdGVwcykgPT4ge1xyXG4gICAgICBzdGVwcy5tYXAoKHN0ZXApID0+IHtcclxuICAgICAgICBpZiAoc3RlcFswXSA9PT0gREVGQVVMVF9PUFRJT05TLlBFTikge1xyXG4gICAgICAgICAgdGhpcy5jb2xvciA9IHN0ZXBbMV1cclxuICAgICAgICAgIHRoaXMuZHJhd0NpcmNsZS5hcHBseSh0aGlzLCBzdGVwLnNsaWNlKDIpKVxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RlcFswXSA9PT0gREVGQVVMVF9PUFRJT05TLkVSQVNFUikge1xyXG4gICAgICAgICAgY3R4LmNsZWFyUmVjdC5hcHBseShjdHgsIHN0ZXAuc2xpY2UoMSkpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3JcclxuICB9XHJcblxyXG4gICAgZ2V0RGF0YVVSTCgpIHtcclxuICAgICAgbGV0IHRlbXBDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxyXG4gICAgICB0ZW1wQ2FudmFzLndpZHRoID0gdGhpcy53aWR0aFxyXG4gICAgICB0ZW1wQ2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0XHJcbiAgICAgIGxldCB0ZW1wQ3R4ID0gdGVtcENhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAgIHRlbXBDdHguZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodClcclxuICAgICAgdGVtcEN0eC5kcmF3SW1hZ2UodGhpcy5jYW52YXMsIDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KVxyXG5cclxuICAgICAgcmV0dXJuIHRlbXBDYW52YXMudG9EYXRhVVJMKClcclxuICB9XHJcblxyXG59XHJcbiJdfQ==
