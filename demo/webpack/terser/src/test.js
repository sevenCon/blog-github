'use strict';

exports.__esModule = true;
exports.B = exports.A = void 0;

require('core-js/modules/es6.function.name');

var A =
  /*#__PURE__*/
  (function() {
    function A() {
      this.name = 'AAAAAAAAAAAAAA';
    }

    var _proto = A.prototype;

    _proto.getName = function getName() {
      return this.name;
    };

    return A;
  })();

exports.A = A;

var B =
  /*#__PURE__*/
  (function() {
    function B(_ref) {
      var val = _ref.val;
      this.name = 'constructor bbbbbbbbbbb';
      this.val = val;
    }

    var _proto2 = B.prototype;

    _proto2.getName = function getName() {
      console.log(this.val);
      return this.val;
    };

    return B;
  })();

exports.B = B;
