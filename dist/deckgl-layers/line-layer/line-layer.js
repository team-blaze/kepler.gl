'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _deck = require('deck.gl');

var _constants = require('luma.gl/constants');

var _constants2 = _interopRequireDefault(_constants);

var _shaderUtils = require('../layer-utils/shader-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultProps = (0, _extends3.default)({}, _deck.LineLayer.defaultProps, {
  // show arc if source is in brush
  brushSource: true,
  // show arc if target is in brush
  brushTarget: true,
  enableBrushing: true,
  getStrokeWidth: function getStrokeWidth(d) {
    return d.strokeWidth;
  },
  getTargetColor: function getTargetColor(x) {
    return x.color || [0, 0, 0, 255];
  },
  strokeScale: 1,

  // brush radius in meters
  brushRadius: 100000,
  mousePosition: [0, 0]
}); // Copyright (c) 2018 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

function addBrushingVsShader(vs) {
  var targetColorVs = (0, _shaderUtils.editShader)(vs, 'line target color vs', 'attribute vec4 instanceColors;', 'attribute vec4 instanceColors; attribute vec4 instanceTargetColors;');

  var brushingVs = (0, _shaderUtils.editShader)(targetColorVs, 'line brushing vs', 'vec2 offset = getExtrusionOffset(target.xy - source.xy, positions.y);', 'vec2 offset = brushing_getExtrusionOffset(target.xy - source.xy, positions.y, project_uViewportSize, vec4(instanceSourcePositions.xy, instanceTargetPositions.xy), instanceWidths);');

  return (0, _shaderUtils.editShader)(brushingVs, 'line color vs', 'vColor = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.;', 'vec4 color = mix(instanceColors, instanceTargetColors, positions.x) / 255.;' + 'vColor = vec4(color.rgb, color.a * opacity);');
}

var LineBrushingLayer = function (_LineLayer) {
  (0, _inherits3.default)(LineBrushingLayer, _LineLayer);

  function LineBrushingLayer() {
    (0, _classCallCheck3.default)(this, LineBrushingLayer);
    return (0, _possibleConstructorReturn3.default)(this, (LineBrushingLayer.__proto__ || Object.getPrototypeOf(LineBrushingLayer)).apply(this, arguments));
  }

  (0, _createClass3.default)(LineBrushingLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      var shaders = (0, _get3.default)(LineBrushingLayer.prototype.__proto__ || Object.getPrototypeOf(LineBrushingLayer.prototype), 'getShaders', this).call(this);
      // const addons = getExtrusion + isPicked + isPtInRange;

      return {
        // ...shaders,
        vs: addBrushingVsShader(shaders.vs),
        fs: shaders.fs,
        // vs: this.props.fp64 ? addons + vs64 : addons + vs,
        modules: shaders.modules.concat(['brushing'])
      };
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      (0, _get3.default)(LineBrushingLayer.prototype.__proto__ || Object.getPrototypeOf(LineBrushingLayer.prototype), 'initializeState', this).call(this);
      var attributeManager = this.state.attributeManager;

      attributeManager.addInstanced({
        instanceTargetColors: {
          size: 4,
          type: _constants2.default.UNSIGNED_BYTE,
          accessor: 'getTargetColor',
          update: this.calculateInstanceTargetColors
        }
      });
    }
  }, {
    key: 'draw',
    value: function draw(_ref) {
      var uniforms = _ref.uniforms;
      var _props = this.props,
          brushSource = _props.brushSource,
          brushTarget = _props.brushTarget,
          brushRadius = _props.brushRadius,
          enableBrushing = _props.enableBrushing,
          mousePosition = _props.mousePosition,
          strokeScale = _props.strokeScale;


      (0, _get3.default)(LineBrushingLayer.prototype.__proto__ || Object.getPrototypeOf(LineBrushingLayer.prototype), 'draw', this).call(this, {
        uniforms: (0, _extends3.default)({}, uniforms, {
          brushing_uBrushSource: brushSource ? 1 : 0,
          brushing_uBrushTarget: brushTarget ? 1 : 0,
          brushing_uBrushRadius: brushRadius,
          brushing_uEnableBrushing: enableBrushing ? 1 : 0,
          brushing_uStrokeScale: strokeScale,
          brushing_uMousePosition: mousePosition ? new Float32Array(this.unproject(mousePosition)) : defaultProps.mousePosition
        })
      });
    }
  }, {
    key: 'calculateInstanceTargetColors',
    value: function calculateInstanceTargetColors(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getTargetColor = _props2.getTargetColor;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          var color = getTargetColor(object);
          value[i + 0] = color[0];
          value[i + 1] = color[1];
          value[i + 2] = color[2];
          value[i + 3] = isNaN(color[3]) ? 255 : color[3];
          i += size;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }]);
  return LineBrushingLayer;
}(_deck.LineLayer);

exports.default = LineBrushingLayer;


LineBrushingLayer.layerName = 'LineBrushingLayer';
LineBrushingLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWNrZ2wtbGF5ZXJzL2xpbmUtbGF5ZXIvbGluZS1sYXllci5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0UHJvcHMiLCJMaW5lTGF5ZXIiLCJicnVzaFNvdXJjZSIsImJydXNoVGFyZ2V0IiwiZW5hYmxlQnJ1c2hpbmciLCJnZXRTdHJva2VXaWR0aCIsImQiLCJzdHJva2VXaWR0aCIsImdldFRhcmdldENvbG9yIiwieCIsImNvbG9yIiwic3Ryb2tlU2NhbGUiLCJicnVzaFJhZGl1cyIsIm1vdXNlUG9zaXRpb24iLCJhZGRCcnVzaGluZ1ZzU2hhZGVyIiwidnMiLCJ0YXJnZXRDb2xvclZzIiwiYnJ1c2hpbmdWcyIsIkxpbmVCcnVzaGluZ0xheWVyIiwic2hhZGVycyIsImZzIiwibW9kdWxlcyIsImNvbmNhdCIsImF0dHJpYnV0ZU1hbmFnZXIiLCJzdGF0ZSIsImFkZEluc3RhbmNlZCIsImluc3RhbmNlVGFyZ2V0Q29sb3JzIiwic2l6ZSIsInR5cGUiLCJHTCIsIlVOU0lHTkVEX0JZVEUiLCJhY2Nlc3NvciIsInVwZGF0ZSIsImNhbGN1bGF0ZUluc3RhbmNlVGFyZ2V0Q29sb3JzIiwidW5pZm9ybXMiLCJwcm9wcyIsImJydXNoaW5nX3VCcnVzaFNvdXJjZSIsImJydXNoaW5nX3VCcnVzaFRhcmdldCIsImJydXNoaW5nX3VCcnVzaFJhZGl1cyIsImJydXNoaW5nX3VFbmFibGVCcnVzaGluZyIsImJydXNoaW5nX3VTdHJva2VTY2FsZSIsImJydXNoaW5nX3VNb3VzZVBvc2l0aW9uIiwiRmxvYXQzMkFycmF5IiwidW5wcm9qZWN0IiwiYXR0cmlidXRlIiwiZGF0YSIsInZhbHVlIiwiaSIsIm9iamVjdCIsImlzTmFOIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOzs7O0FBQ0E7Ozs7QUFFQSxJQUFNQSwwQ0FDREMsZ0JBQVVELFlBRFQ7QUFFSjtBQUNBRSxlQUFhLElB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QUFxQkYsSUFBckIsOEhBQTJCO0FBQUEsY0FBaEJHLE1BQWdCOztBQUN6QixjQUFNdEMsUUFBUUYsZUFBZXdDLE1BQWYsQ0FBZDtBQUNBRixnQkFBTUMsSUFBSSxDQUFWLElBQWVyQyxNQUFNLENBQU4sQ0FBZjtBQUNBb0MsZ0JBQU1DLElBQUksQ0FBVixJQUFlckMsTUFBTSxDQUFOLENBQWY7QUFDQW9DLGdCQUFNQyxJQUFJLENBQVYsSUFBZXJDLE1BQU0sQ0FBTixDQUFmO0FBQ0FvQyxnQkFBTUMsSUFBSSxDQUFWLElBQWVFLE1BQU12QyxNQUFNLENBQU4sQ0FBTixJQUFrQixHQUFsQixHQUF3QkEsTUFBTSxDQUFOLENBQXZDO0FBQ0FxQyxlQUFLcEIsSUFBTDtBQUNEO0FBWHNDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFZeEM7OztFQWhFNEMxQixlOztrQkFBMUJpQixpQjs7O0FBbUVyQkEsa0JBQWtCZ0MsU0FBbEIsR0FBOEIsbUJBQTlCO0FBQ0FoQyxrQkFBa0JsQixZQUFsQixHQUFpQ0EsWUFBakMiLCJmaWxlIjoibGluZS1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxOCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7TGluZUxheWVyfSBmcm9tICdkZWNrLmdsJztcbmltcG9ydCBHTCBmcm9tICdsdW1hLmdsL2NvbnN0YW50cyc7XG5pbXBvcnQge2VkaXRTaGFkZXJ9IGZyb20gJ2RlY2tnbC1sYXllcnMvbGF5ZXItdXRpbHMvc2hhZGVyLXV0aWxzJztcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICAuLi5MaW5lTGF5ZXIuZGVmYXVsdFByb3BzLFxuICAvLyBzaG93IGFyYyBpZiBzb3VyY2UgaXMgaW4gYnJ1c2hcbiAgYnJ1c2hTb3VyY2U6IHRydWUsXG4gIC8vIHNob3cgYXJjIGlmIHRhcmdldCBpcyBpbiBicnVzaFxuICBicnVzaFRhcmdldDogdHJ1ZSxcbiAgZW5hYmxlQnJ1c2hpbmc6IHRydWUsXG4gIGdldFN0cm9rZVdpZHRoOiBkID0+IGQuc3Ryb2tlV2lkdGgsXG4gIGdldFRhcmdldENvbG9yOiB4ID0+IHguY29sb3IgfHwgWzAsIDAsIDAsIDI1NV0sXG4gIHN0cm9rZVNjYWxlOiAxLFxuXG4gIC8vIGJydXNoIHJhZGl1cyBpbiBtZXRlcnNcbiAgYnJ1c2hSYWRpdXM6IDEwMDAwMCxcbiAgbW91c2VQb3NpdGlvbjogWzAsIDBdXG59O1xuXG5mdW5jdGlvbiBhZGRCcnVzaGluZ1ZzU2hhZGVyKHZzKSB7XG4gIGNvbnN0IHRhcmdldENvbG9yVnMgPSBlZGl0U2hhZGVyKFxuICAgIHZzLFxuICAgICdsaW5lIHRhcmdldCBjb2xvciB2cycsXG4gICAgJ2F0dHJpYnV0ZSB2ZWM0IGluc3RhbmNlQ29sb3JzOycsXG4gICAgJ2F0dHJpYnV0ZSB2ZWM0IGluc3RhbmNlQ29sb3JzOyBhdHRyaWJ1dGUgdmVjNCBpbnN0YW5jZVRhcmdldENvbG9yczsnXG4gICk7XG5cbiAgY29uc3QgYnJ1c2hpbmdWcyA9IGVkaXRTaGFkZXIoXG4gICAgdGFyZ2V0Q29sb3JWcyxcbiAgICAnbGluZSBicnVzaGluZyB2cycsXG4gICAgJ3ZlYzIgb2Zmc2V0ID0gZ2V0RXh0cnVzaW9uT2Zmc2V0KHRhcmdldC54eSAtIHNvdXJjZS54eSwgcG9zaXRpb25zLnkpOycsXG4gICAgJ3ZlYzIgb2Zmc2V0ID0gYnJ1c2hpbmdfZ2V0RXh0cnVzaW9uT2Zmc2V0KHRhcmdldC54eSAtIHNvdXJjZS54eSwgcG9zaXRpb25zLnksIHByb2plY3RfdVZpZXdwb3J0U2l6ZSwgdmVjNChpbnN0YW5jZVNvdXJjZVBvc2l0aW9ucy54eSwgaW5zdGFuY2VUYXJnZXRQb3NpdGlvbnMueHkpLCBpbnN0YW5jZVdpZHRocyk7J1xuICApO1xuXG4gIHJldHVybiBlZGl0U2hhZGVyKFxuICAgIGJydXNoaW5nVnMsXG4gICAgJ2xpbmUgY29sb3IgdnMnLFxuICAgICd2Q29sb3IgPSB2ZWM0KGluc3RhbmNlQ29sb3JzLnJnYiwgaW5zdGFuY2VDb2xvcnMuYSAqIG9wYWNpdHkpIC8gMjU1LjsnLFxuICAgIGB2ZWM0IGNvbG9yID0gbWl4KGluc3RhbmNlQ29sb3JzLCBpbnN0YW5jZVRhcmdldENvbG9ycywgcG9zaXRpb25zLngpIC8gMjU1LjtgICtcbiAgICBgdkNvbG9yID0gdmVjNChjb2xvci5yZ2IsIGNvbG9yLmEgKiBvcGFjaXR5KTtgXG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGluZUJydXNoaW5nTGF5ZXIgZXh0ZW5kcyBMaW5lTGF5ZXIge1xuICBnZXRTaGFkZXJzKCkge1xuICAgIGNvbnN0IHNoYWRlcnMgPSBzdXBlci5nZXRTaGFkZXJzKCk7XG4gICAgLy8gY29uc3QgYWRkb25zID0gZ2V0RXh0cnVzaW9uICsgaXNQaWNrZWQgKyBpc1B0SW5SYW5nZTtcblxuICAgIHJldHVybiB7XG4gICAgICAvLyAuLi5zaGFkZXJzLFxuICAgICAgdnM6IGFkZEJydXNoaW5nVnNTaGFkZXIoc2hhZGVycy52cyksXG4gICAgICBmczogc2hhZGVycy5mcyxcbiAgICAgIC8vIHZzOiB0aGlzLnByb3BzLmZwNjQgPyBhZGRvbnMgKyB2czY0IDogYWRkb25zICsgdnMsXG4gICAgICBtb2R1bGVzOiBzaGFkZXJzLm1vZHVsZXMuY29uY2F0KFsnYnJ1c2hpbmcnXSlcbiAgICB9O1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpO1xuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgaW5zdGFuY2VUYXJnZXRDb2xvcnM6IHtcbiAgICAgICAgc2l6ZTogNCxcbiAgICAgICAgdHlwZTogR0wuVU5TSUdORURfQllURSxcbiAgICAgICAgYWNjZXNzb3I6ICdnZXRUYXJnZXRDb2xvcicsXG4gICAgICAgIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVRhcmdldENvbG9yc1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZHJhdyh7dW5pZm9ybXN9KSB7XG4gICAgY29uc3Qge1xuICAgICAgYnJ1c2hTb3VyY2UsXG4gICAgICBicnVzaFRhcmdldCxcbiAgICAgIGJydXNoUmFkaXVzLFxuICAgICAgZW5hYmxlQnJ1c2hpbmcsXG4gICAgICBtb3VzZVBvc2l0aW9uLFxuICAgICAgc3Ryb2tlU2NhbGVcbiAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgIHN1cGVyLmRyYXcoe1xuICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgLi4udW5pZm9ybXMsXG4gICAgICAgIGJydXNoaW5nX3VCcnVzaFNvdXJjZTogYnJ1c2hTb3VyY2UgPyAxIDogMCxcbiAgICAgICAgYnJ1c2hpbmdfdUJydXNoVGFyZ2V0OiBicnVzaFRhcmdldCA/IDEgOiAwLFxuICAgICAgICBicnVzaGluZ191QnJ1c2hSYWRpdXM6IGJydXNoUmFkaXVzLFxuICAgICAgICBicnVzaGluZ191RW5hYmxlQnJ1c2hpbmc6IGVuYWJsZUJydXNoaW5nID8gMSA6IDAsXG4gICAgICAgIGJydXNoaW5nX3VTdHJva2VTY2FsZTogc3Ryb2tlU2NhbGUsXG4gICAgICAgIGJydXNoaW5nX3VNb3VzZVBvc2l0aW9uOiBtb3VzZVBvc2l0aW9uXG4gICAgICAgICAgPyBuZXcgRmxvYXQzMkFycmF5KHRoaXMudW5wcm9qZWN0KG1vdXNlUG9zaXRpb24pKVxuICAgICAgICAgIDogZGVmYXVsdFByb3BzLm1vdXNlUG9zaXRpb25cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlVGFyZ2V0Q29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRUYXJnZXRDb2xvcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0VGFyZ2V0Q29sb3Iob2JqZWN0KTtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gY29sb3JbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBjb2xvclsyXTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IGlzTmFOKGNvbG9yWzNdKSA/IDI1NSA6IGNvbG9yWzNdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxufVxuXG5MaW5lQnJ1c2hpbmdMYXllci5sYXllck5hbWUgPSAnTGluZUJydXNoaW5nTGF5ZXInO1xuTGluZUJydXNoaW5nTGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19