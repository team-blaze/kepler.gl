'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _deck = require('deck.gl');

var _luma = require('luma.gl');

var _constants = require('luma.gl/constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ScatterplotIconLayer = function (_ScatterplotLayer) {
  (0, _inherits3.default)(ScatterplotIconLayer, _ScatterplotLayer);

  function ScatterplotIconLayer() {
    (0, _classCallCheck3.default)(this, ScatterplotIconLayer);
    return (0, _possibleConstructorReturn3.default)(this, (ScatterplotIconLayer.__proto__ || Object.getPrototypeOf(ScatterplotIconLayer)).apply(this, arguments));
  }

  (0, _createClass3.default)(ScatterplotIconLayer, [{
    key: '_getModel',
    value: function _getModel(gl) {
      // use default scatterplot shaders
      var shaders = this.getShaders();
      var defaultPos = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];
      var iconGeometry = this.props.iconGeometry;


      var geometry = iconGeometry ? new _luma.Geometry({
        drawMode: _constants2.default.TRIANGLES,
        attributes: {
          positions: new Float32Array(iconGeometry)
        }
      }) : new _luma.Geometry({
        drawMode: _constants2.default.TRIANGLE_FAN,
        attributes: {
          positions: new Float32Array(defaultPos)
        }
      });

      return new _luma.Model(gl, (0, _extends3.default)({}, shaders, {
        id: this.props.id,
        geometry: geometry,
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }]);
  return ScatterplotIconLayer;
}(_deck.ScatterplotLayer); // Copyright (c) 2018 Uber Technologies, Inc.
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

exports.default = ScatterplotIconLayer;


ScatterplotIconLayer.layerName = 'ScatterplotIconLayer';
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kZWNrZ2wtbGF5ZXJzL3N2Zy1pY29uLWxheWVyL3NjYXR0ZXJwbG90LWljb24tbGF5ZXIuanMiXSwibmFtZXMiOlsiU2NhdHRlcnBsb3RJY29uTGF5ZXIiLCJnbCIsInNoYWRlcnMiLCJnZXRTaGFkZXJzIiwiZGVmYXVsdFBvcyIsImljb25HZW9tZXRyeSIsInByb3BzIiwiZ2VvbWV0cnkiLCJHZW9tZXRyeSIsImRyYXdNb2RlIiwiR0wiLCJUUklBTkdMRVMiLCJhdHRyaWJ1dGVzIiwicG9zaXRpb25zIiwiRmxvYXQzMkFycmF5IiwiVFJJQU5HTEVfRkFOIiwiTW9kZWwiLCJpZCIsImlzSW5zdGFuY2VkIiwic2hhZGVyQ2FjaGUiLCJjb250ZXh0IiwiU2NhdHRlcnBsb3RMYXllciIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOzs7Ozs7SUFFcUJBLG9COzs7Ozs7Ozs7OzhCQUNUQyxFLEVBQUk7QUFDWjtBQUNBLFVBQU1DLFVBQVUsS0FBS0MsVUFBTCxFQUFoQjtBQUNBLFVBQU1DLGFBQWEsQ0FBQyxDQUFDLENBQUYsRUFBSyxDQUFDLENBQU4sRUFBUyxDQUFULEVBQVksQ0FBQyxDQUFiLEVBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLENBQS9CLEVBQWtDLENBQUMsQ0FBbkMsRUFBc0MsQ0FBdEMsQ0FBbkI7QUFIWSxVQUlMQyxZQUpLLEdBSVcsS0FBS0MsS0FKaEIsQ0FJTEQsWUFKSzs7O0FBTVosVUFBTUUsV0FBV0YsZUFDYixJQUFJRyxjQUFKLENBQWE7QUFDWEMsa0JBQVVDLG9CQUFHQyxTQURGO0FBRVhDLG9CQUFZO0FBQ1ZDLHFCQUFXLElBQUlDLFlBQUosQ0FBaUJULFlBQWpCO0FBREQ7QUFGRCxPQUFiLENBRGEsR0FPYixJQUFJRyxjQUFKLENBQWE7QUFDWEMsa0JBQVVDLG9CQUFHSyxZQURGO0FBRVhILG9CQUFZO0FBQ1ZDLHFCQUFXLElBQUlDLFlBQUosQ0FBaUJWLFVBQWpCO0FBREQ7QUFGRCxPQUFiLENBUEo7O0FBY0EsYUFBTyxJQUFJWSxXQUFKLENBQVVmLEVBQVYsNkJBQ0ZDLE9BREU7QUFFTGUsWUFBSSxLQUFLWCxLQUFMLENBQVdXLEVBRlY7QUFHTFYsMEJBSEs7QUFJTFcscUJBQWEsSUFKUjtBQUtMQyxxQkFBYSxLQUFLQyxPQUFMLENBQWFEO0FBTHJCLFNBQVA7QUFPRDs7O0VBNUIrQ0Usc0IsR0F4QmxEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztrQkFNcUJyQixvQjs7O0FBK0JyQkEscUJBQXFCc0IsU0FBckIsR0FBaUMsc0JBQWpDIiwiZmlsZSI6InNjYXR0ZXJwbG90LWljb24tbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTggVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge1NjYXR0ZXJwbG90TGF5ZXJ9IGZyb20gJ2RlY2suZ2wnO1xuaW1wb3J0IHtHZW9tZXRyeSwgTW9kZWx9IGZyb20gJ2x1bWEuZ2wnO1xuaW1wb3J0IEdMIGZyb20gJ2x1bWEuZ2wvY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NhdHRlcnBsb3RJY29uTGF5ZXIgZXh0ZW5kcyBTY2F0dGVycGxvdExheWVyIHtcbiAgX2dldE1vZGVsKGdsKSB7XG4gICAgLy8gdXNlIGRlZmF1bHQgc2NhdHRlcnBsb3Qgc2hhZGVyc1xuICAgIGNvbnN0IHNoYWRlcnMgPSB0aGlzLmdldFNoYWRlcnMoKTtcbiAgICBjb25zdCBkZWZhdWx0UG9zID0gWy0xLCAtMSwgMCwgLTEsIDEsIDAsIDEsIDEsIDAsIDEsIC0xLCAwXTtcbiAgICBjb25zdCB7aWNvbkdlb21ldHJ5fSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCBnZW9tZXRyeSA9IGljb25HZW9tZXRyeVxuICAgICAgPyBuZXcgR2VvbWV0cnkoe1xuICAgICAgICAgIGRyYXdNb2RlOiBHTC5UUklBTkdMRVMsXG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgcG9zaXRpb25zOiBuZXcgRmxvYXQzMkFycmF5KGljb25HZW9tZXRyeSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICA6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgICAgZHJhd01vZGU6IEdMLlRSSUFOR0xFX0ZBTixcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IG5ldyBGbG9hdDMyQXJyYXkoZGVmYXVsdFBvcylcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBNb2RlbChnbCwge1xuICAgICAgLi4uc2hhZGVycyxcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgZ2VvbWV0cnksXG4gICAgICBpc0luc3RhbmNlZDogdHJ1ZSxcbiAgICAgIHNoYWRlckNhY2hlOiB0aGlzLmNvbnRleHQuc2hhZGVyQ2FjaGVcbiAgICB9KTtcbiAgfVxufVxuXG5TY2F0dGVycGxvdEljb25MYXllci5sYXllck5hbWUgPSAnU2NhdHRlcnBsb3RJY29uTGF5ZXInO1xuIl19