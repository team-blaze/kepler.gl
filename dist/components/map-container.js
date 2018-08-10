'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends4 = require('babel-runtime/helpers/extends');

var _extends5 = _interopRequireDefault(_extends4);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.default = MapContainerFactory;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactMapGl = require('react-map-gl');

var _reactMapGl2 = _interopRequireDefault(_reactMapGl);

var _deck = require('deck.gl');

var _deck2 = _interopRequireDefault(_deck);

var _constants = require('luma.gl/constants');

var _constants2 = _interopRequireDefault(_constants);

var _luma = require('luma.gl');

var _pickingModule = require('../shaderlib/picking-module');

var _pickingModule2 = _interopRequireDefault(_pickingModule);

var _brushingModule = require('../shaderlib/brushing-module');

var _brushingModule2 = _interopRequireDefault(_brushingModule);

var _mapPopover = require('./map/map-popover');

var _mapPopover2 = _interopRequireDefault(_mapPopover);

var _mapControl = require('./map/map-control');

var _mapControl2 = _interopRequireDefault(_mapControl);

var _styledComponents = require('./common/styled-components');

var _mapboxUtils = require('../layers/mapbox-utils');

var _mapboxUtils2 = require('../utils/map-style-utils/mapbox-utils');

var _defaultSettings = require('../constants/default-settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// components
// Copyright (c) 2018 Uber Technologies, Inc.
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

// libraries
var MAP_STYLE = {
  container: {
    display: 'inline-block',
    position: 'relative'
  },
  top: {
    position: 'absolute', top: '0px', pointerEvents: 'none'
  }
};

// default-settings


// Overlay type


var getGlConst = function getGlConst(d) {
  return _constants2.default[d];
};

var MAPBOXGL_STYLE_UPDATE = 'style.load';
MapContainerFactory.deps = [_mapPopover2.default, _mapControl2.default];

function MapContainerFactory(MapPopover, MapControl) {
  var _class, _temp;

  var MapContainer = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(MapContainer, _Component);

    function MapContainer(props) {
      (0, _classCallCheck3.default)(this, MapContainer);

      var _this = (0, _possibleConstructorReturn3.default)(this, (MapContainer.__proto__ || Object.getPrototypeOf(MapContainer)).call(this, props));

      _this._onCloseMapPopover = function () {
        _this.props.visStateActions.onLayerClick(null);
      };

      _this._onLayerSetDomain = function (idx, colorDomain) {
        _this.props.visStateActions.layerConfigChange(_this.props.layers[idx], {
          colorDomain: colorDomain
        });
      };

      _this._onWebGLInitialized = function (gl) {
        (0, _luma.registerShaderModules)([_pickingModule2.default, _brushingModule2.default], {
          ignoreMultipleRegistrations: true
        });

        // allow Uint32 indices in building layer
        // gl.getExtension('OES_element_index_uint');
      };

      _this._onMouseMove = function (evt) {
        var brush = _this.props.interactionConfig.brush;


        if (evt.nativeEvent && brush.enabled) {
          _this.setState({
            mousePosition: [evt.nativeEvent.offsetX, evt.nativeEvent.offsetY]
          });
        }
      };

      _this._handleMapToggleLayer = function (layerId) {
        var _this$props = _this.props,
            _this$props$index = _this$props.index,
            mapIndex = _this$props$index === undefined ? 0 : _this$props$index,
            visStateActions = _this$props.visStateActions;

        visStateActions.toggleLayerForMap(mapIndex, layerId);
      };

      _this._setMapboxMap = function (mapbox) {
        if (!_this._map && mapbox) {
          _this._map = mapbox.getMap();
          // bind mapboxgl event listener
          _this._map.on(MAPBOXGL_STYLE_UPDATE, function () {
            // force refresh mapboxgl layers

            (0, _mapboxUtils.updateMapboxLayers)(_this._map, _this._renderMapboxLayers(), _this.previousLayers, _this.props.mapLayers, { force: true });

            if (typeof _this.props.onMapStyleLoaded === 'function') {
              _this.props.onMapStyleLoaded(_this._map);
            }
          });

          _this._map.on('render', function () {
            if (typeof _this.props.onMapRender === 'function') {
              _this.props.onMapRender(_this._map);
            }
          });
        }
      };

      _this._onBeforeRender = function (_ref) {
        var gl = _ref.gl;

        _this._setlayerBlending(gl);
      };

      _this._setlayerBlending = function (gl) {
        var blending = _defaultSettings.LAYER_BLENDINGS[_this.props.layerBlending];
        var blendFunc = blending.blendFunc,
            blendEquation = blending.blendEquation;


        (0, _luma.setParameters)(gl, (0, _extends5.default)((0, _defineProperty3.default)({}, _constants2.default.BLEND, true), blendFunc ? {
          blendFunc: blendFunc.map(getGlConst),
          blendEquation: Array.isArray(blendEquation) ? blendEquation.map(getGlConst) : getGlConst(blendEquation)
        } : {}));
      };

      _this._renderLayer = function (overlays, idx) {
        var _this$props2 = _this.props,
            layers = _this$props2.layers,
            layerData = _this$props2.layerData,
            hoverInfo = _this$props2.hoverInfo,
            clicked = _this$props2.clicked,
            mapLayers = _this$props2.mapLayers,
            mapState = _this$props2.mapState,
            interactionConfig = _this$props2.interactionConfig;
        var mousePosition = _this.state.mousePosition;

        var layer = layers[idx];
        var data = layerData[idx];

        var layerInteraction = {
          mousePosition: mousePosition
        };

        var objectHovered = clicked || hoverInfo;
        var layerCallbacks = {
          onSetLayerDomain: function onSetLayerDomain(val) {
            return _this._onLayerSetDomain(idx, val);
          }
        };

        if (!_this._shouldRenderLayer(layer, data, mapLayers)) {
          return overlays;
        }

        var layerOverlay = [];

        // Layer is Layer class
        if (typeof layer.renderLayer === 'function') {
          layerOverlay = layer.renderLayer({
            data: data,
            idx: idx,
            layerInteraction: layerInteraction,
            objectHovered: objectHovered,
            mapState: mapState,
            interactionConfig: interactionConfig,
            layerCallbacks: layerCallbacks
          });
        }

        if (layerOverlay.length) {
          overlays = overlays.concat(layerOverlay);
        }
        return overlays;
      };

      _this.state = {
        mousePosition: [0, 0]
      };
      _this.previousLayers = {
        // [layers.id]: mapboxLayerConfig
      };
      return _this;
    }

    (0, _createClass3.default)(MapContainer, [{
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        // unbind mapboxgl event listener
        if (this._map) {
          this._map.off(MAPBOXGL_STYLE_UPDATE);
        }
      }

      /* component private functions */

    }, {
      key: '_renderObjectLayerPopover',


      /* component render functions */
      /* eslint-disable complexity */
      value: function _renderObjectLayerPopover() {
        // TODO: move this into reducer so it can be tested
        var _props = this.props,
            mapState = _props.mapState,
            hoverInfo = _props.hoverInfo,
            clicked = _props.clicked,
            datasets = _props.datasets,
            interactionConfig = _props.interactionConfig,
            layers = _props.layers,
            mapLayers = _props.mapLayers;

        // if clicked something, ignore hover behavior

        var objectInfo = clicked || hoverInfo;
        if (!interactionConfig.tooltip.enabled || !objectInfo || !objectInfo.picked) {
          // nothing hovered
          return null;
        }

        var lngLat = objectInfo.lngLat,
            object = objectInfo.object,
            overlay = objectInfo.layer;

        // deckgl layer to kepler-gl layer

        var layer = layers[overlay.props.idx];

        if (!layer || !layer.config.isVisible || !object || !layer.getHoverData || mapLayers && !mapLayers[layer.id].isVisible) {
          // layer is not visible
          return null;
        }

        var dataId = layer.config.dataId;
        var _datasets$dataId = datasets[dataId],
            allData = _datasets$dataId.allData,
            fields = _datasets$dataId.fields;

        var data = layer.getHoverData(object, allData);

        // project lnglat to screen so that tooltip follows the object on zoom
        var viewport = overlay.context.viewport;

        var _ref2 = this._getHoverXY(viewport, lngLat) || objectInfo,
            x = _ref2.x,
            y = _ref2.y;

        var popoverProps = {
          data: data,
          fields: fields,
          fieldsToShow: interactionConfig.tooltip.config.fieldsToShow[dataId],
          layer: layer,
          isVisible: true,
          x: x,
          y: y,
          freezed: Boolean(clicked),
          onClose: this._onCloseMapPopover,
          mapState: mapState
        };

        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(MapPopover, popoverProps)
        );
      }

      /* eslint-enable complexity */

    }, {
      key: '_getHoverXY',
      value: function _getHoverXY(viewport, lngLat) {
        var screenCoord = !viewport || !lngLat ? null : viewport.project(lngLat);

        return screenCoord && { x: screenCoord[0], y: screenCoord[1] };
      }
    }, {
      key: '_shouldRenderLayer',
      value: function _shouldRenderLayer(layer, data, mapLayers) {
        var isAvailableAndVisible = !(mapLayers && mapLayers[layer.id]) || mapLayers[layer.id].isVisible;
        return layer.shouldRenderLayer(data) && isAvailableAndVisible;
      }
    }, {
      key: '_renderOverlay',
      value: function _renderOverlay() {
        var _props2 = this.props,
            mapState = _props2.mapState,
            layerData = _props2.layerData,
            layerOrder = _props2.layerOrder,
            visStateActions = _props2.visStateActions;


        var deckGlLayers = [];

        // wait until data is ready before render data layers
        if (layerData && layerData.length) {
          // last layer render first
          deckGlLayers = layerOrder.slice().reverse().reduce(this._renderLayer, []);
        }

        return _react2.default.createElement(_deck2.default, {
          viewState: mapState,
          id: 'default-deckgl-overlay',
          layers: deckGlLayers,
          onWebGLInitialized: this._onWebGLInitialized,
          onBeforeRender: this._onBeforeRender,
          onLayerHover: visStateActions.onLayerHover,
          onLayerClick: visStateActions.onLayerClick
        });
      }
    }, {
      key: '_renderMapboxLayers',
      value: function _renderMapboxLayers() {
        var _props3 = this.props,
            layers = _props3.layers,
            layerData = _props3.layerData,
            layerOrder = _props3.layerOrder;


        return (0, _mapboxUtils.generateMapboxLayers)(layers, layerData, layerOrder);
      }
    }, {
      key: '_renderMapboxOverlays',
      value: function _renderMapboxOverlays() {
        if (this._map && this._map.isStyleLoaded()) {

          var mapboxLayers = this._renderMapboxLayers();

          (0, _mapboxUtils.updateMapboxLayers)(this._map, mapboxLayers, this.previousLayers, this.props.mapLayers);

          this.previousLayers = mapboxLayers.reduce(function (final, layer) {
            return (0, _extends5.default)({}, final, (0, _defineProperty3.default)({}, layer.id, layer.config));
          }, {});
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var _props4 = this.props,
            mapState = _props4.mapState,
            mapStyle = _props4.mapStyle,
            mapStateActions = _props4.mapStateActions;
        var updateMap = mapStateActions.updateMap,
            onMapClick = mapStateActions.onMapClick;


        if (!mapStyle.bottomMapStyle) {
          // style not yet loaded
          return _react2.default.createElement('div', null);
        }

        var _props5 = this.props,
            mapLayers = _props5.mapLayers,
            layers = _props5.layers,
            datasets = _props5.datasets,
            mapboxApiAccessToken = _props5.mapboxApiAccessToken,
            mapControls = _props5.mapControls,
            toggleMapControl = _props5.toggleMapControl;


        var mapProps = (0, _extends5.default)({}, mapState, {
          preserveDrawingBuffer: true,
          mapboxApiAccessToken: mapboxApiAccessToken,
          onViewportChange: updateMap,
          transformRequest: _mapboxUtils2.transformRequest
        });

        return _react2.default.createElement(
          _styledComponents.StyledMapContainer,
          { style: MAP_STYLE.container, onMouseMove: this._onMouseMove },
          _react2.default.createElement(MapControl, {
            datasets: datasets,
            dragRotate: mapState.dragRotate,
            isSplit: mapState.isSplit,
            isExport: this.props.isExport,
            layers: layers,
            mapIndex: this.props.index,
            mapLayers: mapLayers,
            mapControls: mapControls,
            scale: mapState.scale || 1,
            top: 0,
            onTogglePerspective: mapStateActions.togglePerspective,
            onToggleSplitMap: mapStateActions.toggleSplitMap,
            onMapToggleLayer: this._handleMapToggleLayer,
            onToggleFullScreen: mapStateActions.toggleFullScreen,
            onToggleMapControl: toggleMapControl
          }),
          _react2.default.createElement(
            this.props.MapComponent,
            (0, _extends5.default)({}, mapProps, {
              key: 'bottom',
              ref: this._setMapboxMap,
              mapStyle: mapStyle.bottomMapStyle,
              onClick: onMapClick,
              getCursor: this.props.hoverInfo ? function () {
                return 'pointer';
              } : undefined
            }),
            this._renderOverlay(),
            this._renderMapboxOverlays()
          ),
          mapStyle.topMapStyle && _react2.default.createElement(
            'div',
            { style: MAP_STYLE.top },
            _react2.default.createElement(this.props.MapComponent, (0, _extends5.default)({}, mapProps, {
              key: 'top',
              mapStyle: mapStyle.topMapStyle
            }))
          ),
          this._renderObjectLayerPopover()
        );
      }
    }]);
    return MapContainer;
  }(_react.Component), _class.propTypes = {
    // required
    datasets: _propTypes2.default.object,
    interactionConfig: _propTypes2.default.object.isRequired,
    layerBlending: _propTypes2.default.string.isRequired,
    layerOrder: _propTypes2.default.arrayOf(_propTypes2.default.any).isRequired,
    layerData: _propTypes2.default.arrayOf(_propTypes2.default.any).isRequired,
    layers: _propTypes2.default.arrayOf(_propTypes2.default.any).isRequired,
    mapState: _propTypes2.default.object.isRequired,
    mapStyle: _propTypes2.default.object.isRequired,
    mapControls: _propTypes2.default.object.isRequired,
    mapboxApiAccessToken: _propTypes2.default.string.isRequired,
    toggleMapControl: _propTypes2.default.func.isRequired,
    visStateActions: _propTypes2.default.object.isRequired,
    mapStateActions: _propTypes2.default.object.isRequired,

    // optional
    isExport: _propTypes2.default.bool,
    clicked: _propTypes2.default.object,
    hoverInfo: _propTypes2.default.object,
    mapLayers: _propTypes2.default.object,
    onMapToggleLayer: _propTypes2.default.func,
    onMapStyleLoaded: _propTypes2.default.func,
    onMapRender: _propTypes2.default.func
  }, _class.defaultProps = {
    MapComponent: _reactMapGl2.default
  }, _temp);


  return MapContainer;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL21hcC1jb250YWluZXIuanMiXSwibmFtZXMiOlsiTWFwQ29udGFpbmVyRmFjdG9yeSIsIk1BUF9TVFlMRSIsImNvbnRhaW5lciIsImRpc3BsYXkiLCJwb3NpdGlvbiIsInRvcCIsInBvaW50ZXJFdmVudHMiLCJnZXRHbENvbnN0IiwiR0wiLCJkIiwiTUFQQk9YR0xfU1RZTEVfVVBEQVRFIiwiZGVwcyIsIk1hcFBvcG92ZXJGYWN0b3J5IiwiTWFwQ29udHJvbEZhY3RvcnkiLCJNYXBQb3BvdmVyIiwiTWFwQ29udHJvbCIsIk1hcENvbnRhaW5lciIsInByb3BzIiwiX29uQ2xvc2VNYXBQb3BvdmVyIiwidmlzU3RhdGVBY3Rpb25zIiwib25MYXllckNsaWNrIiwiX29uTGF5ZXJTZXREb21haW4iLCJpZHgiLCJjb2xvckRvbWFpbiIsImxheWVyQ29uZmlnQ2hhbmdlIiwibGF5ZXJzIiwiX29uV2ViR0xJbml0aWFsaXplZCIsInBpY2tpbmdNb2R1bGUiLCJicnVzaGluZ01vZHVsZSIsImlnbm9yZU11bHRpcGxlUmVnaXN0cmF0aW9ucyIsIl9vbk1vdXNlTW92ZSIsImJydXNoIiwiaW50ZXJhY3Rpb25Db25maWciLCJldnQiLCJuYXRpdmVFdmVudCIsImVuYWJsZWQiLCJzZXRTdGF0ZSIsIm1vdXNlUG9zaXRpb24iLCJvZmZzZXRYIiwib2Zmc2V0WSIsIl9oYW5kbGVNYXBUb2dnbGVMYXllciIsImluZGV4IiwibWFwSW5kZXgiLCJ0b2dnbGVMYXllckZvck1hcCIsImxheWVySWQiLCJfc2V0TWFwYm94TWFwIiwibWFwYm94IiwiX21hcCIsImdldE1hcCIsIm9uIiwiX3JlbmRlck1hcGJveExheWVycyIsInByZXZpb3VzTGF5ZXJzIiwibWFwTGF5ZXJzIiwiZm9yY2UiLCJvbk1hcFN0eWxlTG9hZGVkIiwib25NYXBSZW5kZXIiLCJfb25CZWZvcmVSZW5kZXIiLCJnbCIsIl9zZXRsYXllckJsZW5kaW5nIiwiYmxlbmRpbmciLCJMQVlFUl9CTEVORElOR1MiLCJsYXllckJsZW5kaW5nIiwiYmxlbmRGdW5jIiwiYmxlbmRFcXVhdGlvbiIsIkJMRU5EIiwibWFwIiwiQXJyYXkiLCJpc0FycmF5IiwiX3JlbmRlckxheWVyIiwib3ZlcmxheXMiLCJsYXllckRhdGEiLCJob3ZlckluZm8iLCJjbGlja2VkIiwibWFwU3RhdGUiLCJzdGF0ZSIsImxheWVyIiwiZGF0YSIsImxheWVySW50ZXJhY3Rpb24iLCJvYmplY3RIb3ZlcmVkIiwibGF5ZXJDYWxsYmFja3MiLCJvblNldExheWVyRG9tYWluIiwidmFsIiwiX3Nob3VsZFJlbmRlckxheWVyIiwibGF5ZXJPdmVybGF5IiwicmVuZGVyTGF5ZXIiLCJsZW5ndGgiLCJjb25jYXQiLCJvZmYiLCJkYXRhc2V0cyIsIm9iamVjdEluZm8iLCJ0b29sdGlwIiwicGlja2VkIiwibG5nTGF0Iiwib2JqZWN0Iiwib3ZlcmxheSIsImNvbmZpZyIsImlzVmlzaWJsZSIsImdldEhvdmVyRGF0YSIsImlkIiwiZGF0YUlkIiwiYWxsRGF0YSIsImZpZWxkcyIsInZpZXdwb3J0IiwiY29udGV4dCIsIl9nZXRIb3ZlclhZIiwieCIsInkiLCJwb3BvdmVyUHJvcHMiLCJmaWVsZHNUb1Nob3ciLCJmcmVlemVkIiwiQm9vbGVhbiIsIm9uQ2xvc2UiLCJzY3JlZW5Db29yZCIsInByb2plY3QiLCJpc0F2YWlsYWJsZUFuZFZpc2libGUiLCJzaG91bGRSZW5kZXJMYXllciIsImxheWVyT3JkZXIiLCJkZWNrR2xMYXllcnMiLCJzbGljZSIsInJldmVyc2UiLCJyZWR1Y2UiLCJvbkxheWVySG92ZXIiLCJpc1N0eWxlTG9hZGVkIiwibWFwYm94TGF5ZXJzIiwiZmluYWwiLCJtYXBTdHlsZSIsIm1hcFN0YXRlQWN0aW9ucyIsInVwZGF0ZU1hcCIsIm9uTWFwQ2xpY2siLCJib3R0b21NYXBTdHlsZSIsIm1hcGJveEFwaUFjY2Vzc1Rva2VuIiwibWFwQ29udHJvbHMiLCJ0b2dnbGVNYXBDb250cm9sIiwibWFwUHJvcHMiLCJwcmVzZXJ2ZURyYXdpbmdCdWZmZXIiLCJvblZpZXdwb3J0Q2hhbmdlIiwidHJhbnNmb3JtUmVxdWVzdCIsImRyYWdSb3RhdGUiLCJpc1NwbGl0IiwiaXNFeHBvcnQiLCJzY2FsZSIsInRvZ2dsZVBlcnNwZWN0aXZlIiwidG9nZ2xlU3BsaXRNYXAiLCJ0b2dnbGVGdWxsU2NyZWVuIiwidW5kZWZpbmVkIiwiX3JlbmRlck92ZXJsYXkiLCJfcmVuZGVyTWFwYm94T3ZlcmxheXMiLCJ0b3BNYXBTdHlsZSIsIl9yZW5kZXJPYmplY3RMYXllclBvcG92ZXIiLCJDb21wb25lbnQiLCJwcm9wVHlwZXMiLCJQcm9wVHlwZXMiLCJpc1JlcXVpcmVkIiwic3RyaW5nIiwiYXJyYXlPZiIsImFueSIsImZ1bmMiLCJib29sIiwib25NYXBUb2dnbGVMYXllciIsImRlZmF1bHRQcm9wcyIsIk1hcENvbXBvbmVudCIsIk1hcGJveEdMTWFwIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBMkR3QkEsbUI7O0FBdEN4Qjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUdBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFHQTs7QUFFQTs7QUFHQTs7OztBQVhBO0FBOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBdUJBLElBQU1DLFlBQVk7QUFDaEJDLGFBQVc7QUFDVEMsYUFBUyxjQURBO0FBRVRDLGNBQVU7QUFGRCxHQURLO0FBS2hCQyxPQUFLO0FBQ0hELGNBQVUsVUFEUCxFQUNtQkMsS0FBSyxLQUR4QixFQUMrQkMsZUFBZTtBQUQ5QztBQUxXLENBQWxCOztBQUhBOzs7QUFMQTs7O0FBa0JBLElBQU1DLGFBQWEsU0FBYkEsVUFBYTtBQUFBLFNBQUtDLG9CQUFHQyxDQUFILENBQUw7QUFBQSxDQUFuQjs7QUFFQSxJ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O0FBQ3BCQyxrQkFBY0M7QUFETSxHQTVCMEM7OztBQW1ZbEUsU0FBT2pKLFlBQVA7QUFDRCIsImZpbGUiOiJtYXAtY29udGFpbmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE4IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gbGlicmFyaWVzXG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgTWFwYm94R0xNYXAgZnJvbSAncmVhY3QtbWFwLWdsJztcbmltcG9ydCBEZWNrR0wgZnJvbSAnZGVjay5nbCc7XG5pbXBvcnQgR0wgZnJvbSAnbHVtYS5nbC9jb25zdGFudHMnO1xuaW1wb3J0IHtyZWdpc3RlclNoYWRlck1vZHVsZXMsIHNldFBhcmFtZXRlcnN9IGZyb20gJ2x1bWEuZ2wnO1xuaW1wb3J0IHBpY2tpbmdNb2R1bGUgZnJvbSAnc2hhZGVybGliL3BpY2tpbmctbW9kdWxlJztcbmltcG9ydCBicnVzaGluZ01vZHVsZSBmcm9tICdzaGFkZXJsaWIvYnJ1c2hpbmctbW9kdWxlJztcblxuLy8gY29tcG9uZW50c1xuaW1wb3J0IE1hcFBvcG92ZXJGYWN0b3J5IGZyb20gJ2NvbXBvbmVudHMvbWFwL21hcC1wb3BvdmVyJztcbmltcG9ydCBNYXBDb250cm9sRmFjdG9yeSBmcm9tICdjb21wb25lbnRzL21hcC9tYXAtY29udHJvbCc7XG5pbXBvcnQge1N0eWxlZE1hcENvbnRhaW5lcn0gZnJvbSAnY29tcG9uZW50cy9jb21tb24vc3R5bGVkLWNvbXBvbmVudHMnO1xuXG4vLyBPdmVybGF5IHR5cGVcbmltcG9ydCB7Z2VuZXJhdGVNYXBib3hMYXllcnMsIHVwZGF0ZU1hcGJveExheWVyc30gZnJvbSAnLi4vbGF5ZXJzL21hcGJveC11dGlscyc7XG5cbmltcG9ydCB7dHJhbnNmb3JtUmVxdWVzdH0gZnJvbSAndXRpbHMvbWFwLXN0eWxlLXV0aWxzL21hcGJveC11dGlscyc7XG5cbi8vIGRlZmF1bHQtc2V0dGluZ3NcbmltcG9ydCB7TEFZRVJfQkxFTkRJTkdTfSBmcm9tICdjb25zdGFudHMvZGVmYXVsdC1zZXR0aW5ncyc7XG5cbmNvbnN0IE1BUF9TVFlMRSA9IHtcbiAgY29udGFpbmVyOiB7XG4gICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgfSxcbiAgdG9wOiB7XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzBweCcsIHBvaW50ZXJFdmVudHM6ICdub25lJ1xuICB9XG59O1xuXG5jb25zdCBnZXRHbENvbnN0ID0gZCA9PiBHTFtkXTtcblxuY29uc3QgTUFQQk9YR0xfU1RZTEVfVVBEQVRFID0gJ3N0eWxlLmxvYWQnO1xuTWFwQ29udGFpbmVyRmFjdG9yeS5kZXBzID0gW1xuICBNYXBQb3BvdmVyRmFjdG9yeSwgTWFwQ29udHJvbEZhY3RvcnldO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBNYXBDb250YWluZXJGYWN0b3J5KE1hcFBvcG92ZXIsIE1hcENvbnRyb2wpIHtcbiAgY2xhc3MgTWFwQ29udGFpbmVyIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgLy8gcmVxdWlyZWRcbiAgICAgIGRhdGFzZXRzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgaW50ZXJhY3Rpb25Db25maWc6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIGxheWVyQmxlbmRpbmc6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgIGxheWVyT3JkZXI6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5hbnkpLmlzUmVxdWlyZWQsXG4gICAgICBsYXllckRhdGE6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5hbnkpLmlzUmVxdWlyZWQsXG4gICAgICBsYXllcnM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5hbnkpLmlzUmVxdWlyZWQsXG4gICAgICBtYXBTdGF0ZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgbWFwU3R5bGU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIG1hcENvbnRyb2xzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICBtYXBib3hBcGlBY2Nlc3NUb2tlbjogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgdG9nZ2xlTWFwQ29udHJvbDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIHZpc1N0YXRlQWN0aW9uczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgbWFwU3RhdGVBY3Rpb25zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cbiAgICAgIC8vIG9wdGlvbmFsXG4gICAgICBpc0V4cG9ydDogUHJvcFR5cGVzLmJvb2wsXG4gICAgICBjbGlja2VkOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgaG92ZXJJbmZvOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgbWFwTGF5ZXJzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgb25NYXBUb2dnbGVMYXllcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICBvbk1hcFN0eWxlTG9hZGVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgIG9uTWFwUmVuZGVyOiBQcm9wVHlwZXMuZnVuY1xuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgTWFwQ29tcG9uZW50OiBNYXBib3hHTE1hcFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgbW91c2VQb3NpdGlvbjogWzAsIDBdXG4gICAgICB9O1xuICAgICAgdGhpcy5wcmV2aW91c0xheWVycyA9IHtcbiAgICAgICAgLy8gW2xheWVycy5pZF06IG1hcGJveExheWVyQ29uZmlnXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgLy8gdW5iaW5kIG1hcGJveGdsIGV2ZW50IGxpc3RlbmVyXG4gICAgICBpZiAodGhpcy5fbWFwKSB7XG4gICAgICAgIHRoaXMuX21hcC5vZmYoTUFQQk9YR0xfU1RZTEVfVVBEQVRFKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBjb21wb25lbnQgcHJpdmF0ZSBmdW5jdGlvbnMgKi9cbiAgICBfb25DbG9zZU1hcFBvcG92ZXIgPSAoKSA9PiB7XG4gICAgICB0aGlzLnByb3BzLnZpc1N0YXRlQWN0aW9ucy5vbkxheWVyQ2xpY2sobnVsbCk7XG4gICAgfTtcblxuICAgIF9vbkxheWVyU2V0RG9tYWluID0gKGlkeCwgY29sb3JEb21haW4pID0+IHtcbiAgICAgIHRoaXMucHJvcHMudmlzU3RhdGVBY3Rpb25zLmxheWVyQ29uZmlnQ2hhbmdlKHRoaXMucHJvcHMubGF5ZXJzW2lkeF0sIHtcbiAgICAgICAgY29sb3JEb21haW5cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25XZWJHTEluaXRpYWxpemVkID0gZ2wgPT4ge1xuICAgICAgcmVnaXN0ZXJTaGFkZXJNb2R1bGVzKFxuICAgICAgICBbcGlja2luZ01vZHVsZSwgYnJ1c2hpbmdNb2R1bGVdLCB7XG4gICAgICAgICAgaWdub3JlTXVsdGlwbGVSZWdpc3RyYXRpb25zOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgLy8gYWxsb3cgVWludDMyIGluZGljZXMgaW4gYnVpbGRpbmcgbGF5ZXJcbiAgICAgIC8vIGdsLmdldEV4dGVuc2lvbignT0VTX2VsZW1lbnRfaW5kZXhfdWludCcpO1xuICAgIH07XG5cbiAgICBfb25Nb3VzZU1vdmUgPSBldnQgPT4ge1xuICAgICAgY29uc3Qge2ludGVyYWN0aW9uQ29uZmlnOiB7YnJ1c2h9fSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIGlmIChldnQubmF0aXZlRXZlbnQgJiYgYnJ1c2guZW5hYmxlZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBtb3VzZVBvc2l0aW9uOiBbZXZ0Lm5hdGl2ZUV2ZW50Lm9mZnNldFgsIGV2dC5uYXRpdmVFdmVudC5vZmZzZXRZXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX2hhbmRsZU1hcFRvZ2dsZUxheWVyID0gbGF5ZXJJZCA9PiB7XG4gICAgICBjb25zdCB7aW5kZXg6IG1hcEluZGV4ID0gMCwgdmlzU3RhdGVBY3Rpb25zfSA9IHRoaXMucHJvcHM7XG4gICAgICB2aXNTdGF0ZUFjdGlvbnMudG9nZ2xlTGF5ZXJGb3JNYXAobWFwSW5kZXgsIGxheWVySWQpO1xuICAgIH07XG5cbiAgICBfc2V0TWFwYm94TWFwID0gKG1hcGJveCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9tYXAgJiYgbWFwYm94KSB7XG4gICAgICAgIHRoaXMuX21hcCA9IG1hcGJveC5nZXRNYXAoKTtcbiAgICAgICAgLy8gYmluZCBtYXBib3hnbCBldmVudCBsaXN0ZW5lclxuICAgICAgICB0aGlzLl9tYXAub24oTUFQQk9YR0xfU1RZTEVfVVBEQVRFLCAoKSA9PiB7XG4gICAgICAgICAgLy8gZm9yY2UgcmVmcmVzaCBtYXBib3hnbCBsYXllcnNcblxuICAgICAgICAgIHVwZGF0ZU1hcGJveExheWVycyhcbiAgICAgICAgICAgIHRoaXMuX21hcCxcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlck1hcGJveExheWVycygpLFxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0xheWVycyxcbiAgICAgICAgICAgIHRoaXMucHJvcHMubWFwTGF5ZXJzLFxuICAgICAgICAgICAge2ZvcmNlOiB0cnVlfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMub25NYXBTdHlsZUxvYWRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbk1hcFN0eWxlTG9hZGVkKHRoaXMuX21hcCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9tYXAub24oJ3JlbmRlcicsICgpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMub25NYXBSZW5kZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25NYXBSZW5kZXIodGhpcy5fbWFwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9vbkJlZm9yZVJlbmRlciA9ICh7Z2x9KSA9PiB7XG4gICAgICB0aGlzLl9zZXRsYXllckJsZW5kaW5nKGdsKTtcbiAgICB9O1xuXG4gICAgX3NldGxheWVyQmxlbmRpbmcgPSBnbCA9PiB7XG4gICAgICBjb25zdCBibGVuZGluZyA9IExBWUVSX0JMRU5ESU5HU1t0aGlzLnByb3BzLmxheWVyQmxlbmRpbmddO1xuICAgICAgY29uc3Qge2JsZW5kRnVuYywgYmxlbmRFcXVhdGlvbn0gPSBibGVuZGluZztcblxuICAgICAgc2V0UGFyYW1ldGVycyhnbCwge1xuICAgICAgICBbR0wuQkxFTkRdOiB0cnVlLFxuICAgICAgICAuLi4oYmxlbmRGdW5jID8ge1xuICAgICAgICAgIGJsZW5kRnVuYzogYmxlbmRGdW5jLm1hcChnZXRHbENvbnN0KSxcbiAgICAgICAgICBibGVuZEVxdWF0aW9uOiBBcnJheS5pc0FycmF5KGJsZW5kRXF1YXRpb24pID8gYmxlbmRFcXVhdGlvbi5tYXAoZ2V0R2xDb25zdCkgOiBnZXRHbENvbnN0KGJsZW5kRXF1YXRpb24pXG4gICAgICAgIH0gOiB7fSlcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKiBjb21wb25lbnQgcmVuZGVyIGZ1bmN0aW9ucyAqL1xuICAgIC8qIGVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkgKi9cbiAgICBfcmVuZGVyT2JqZWN0TGF5ZXJQb3BvdmVyKCkge1xuICAgICAgLy8gVE9ETzogbW92ZSB0aGlzIGludG8gcmVkdWNlciBzbyBpdCBjYW4gYmUgdGVzdGVkXG4gICAgICBjb25zdCB7XG4gICAgICAgIG1hcFN0YXRlLFxuICAgICAgICBob3ZlckluZm8sXG4gICAgICAgIGNsaWNrZWQsXG4gICAgICAgIGRhdGFzZXRzLFxuICAgICAgICBpbnRlcmFjdGlvbkNvbmZpZyxcbiAgICAgICAgbGF5ZXJzLFxuICAgICAgICBtYXBMYXllcnNcbiAgICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICAvLyBpZiBjbGlja2VkIHNvbWV0aGluZywgaWdub3JlIGhvdmVyIGJlaGF2aW9yXG4gICAgICBjb25zdCBvYmplY3RJbmZvID0gY2xpY2tlZCB8fCBob3ZlckluZm87XG4gICAgICBpZiAoXG4gICAgICAgICFpbnRlcmFjdGlvbkNvbmZpZy50b29sdGlwLmVuYWJsZWQgfHxcbiAgICAgICAgIW9iamVjdEluZm8gfHxcbiAgICAgICAgIW9iamVjdEluZm8ucGlja2VkXG4gICAgICApIHtcbiAgICAgICAgLy8gbm90aGluZyBob3ZlcmVkXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7bG5nTGF0LCBvYmplY3QsIGxheWVyOiBvdmVybGF5fSA9IG9iamVjdEluZm87XG5cbiAgICAgIC8vIGRlY2tnbCBsYXllciB0byBrZXBsZXItZ2wgbGF5ZXJcbiAgICAgIGNvbnN0IGxheWVyID0gbGF5ZXJzW292ZXJsYXkucHJvcHMuaWR4XTtcblxuICAgICAgaWYgKFxuICAgICAgICAhbGF5ZXIgfHxcbiAgICAgICAgIWxheWVyLmNvbmZpZy5pc1Zpc2libGUgfHxcbiAgICAgICAgIW9iamVjdCB8fFxuICAgICAgICAhbGF5ZXIuZ2V0SG92ZXJEYXRhIHx8XG4gICAgICAgIChtYXBMYXllcnMgJiYgIW1hcExheWVyc1tsYXllci5pZF0uaXNWaXNpYmxlKVxuICAgICAgKSB7XG4gICAgICAgIC8vIGxheWVyIGlzIG5vdCB2aXNpYmxlXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7Y29uZmlnOiB7ZGF0YUlkfX0gPSBsYXllcjtcbiAgICAgIGNvbnN0IHthbGxEYXRhLCBmaWVsZHN9ID0gZGF0YXNldHNbZGF0YUlkXTtcbiAgICAgIGNvbnN0IGRhdGEgPSBsYXllci5nZXRIb3ZlckRhdGEob2JqZWN0LCBhbGxEYXRhKTtcblxuICAgICAgLy8gcHJvamVjdCBsbmdsYXQgdG8gc2NyZWVuIHNvIHRoYXQgdG9vbHRpcCBmb2xsb3dzIHRoZSBvYmplY3Qgb24gem9vbVxuICAgICAgY29uc3Qge3ZpZXdwb3J0fSA9IG92ZXJsYXkuY29udGV4dDtcbiAgICAgIGNvbnN0IHt4LCB5fSA9IHRoaXMuX2dldEhvdmVyWFkodmlld3BvcnQsIGxuZ0xhdCkgfHwgb2JqZWN0SW5mbztcblxuICAgICAgY29uc3QgcG9wb3ZlclByb3BzID0ge1xuICAgICAgICBkYXRhLFxuICAgICAgICBmaWVsZHMsXG4gICAgICAgIGZpZWxkc1RvU2hvdzogaW50ZXJhY3Rpb25Db25maWcudG9vbHRpcC5jb25maWcuZmllbGRzVG9TaG93W2RhdGFJZF0sXG4gICAgICAgIGxheWVyLFxuICAgICAgICBpc1Zpc2libGU6IHRydWUsXG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIGZyZWV6ZWQ6IEJvb2xlYW4oY2xpY2tlZCksXG4gICAgICAgIG9uQ2xvc2U6IHRoaXMuX29uQ2xvc2VNYXBQb3BvdmVyLFxuICAgICAgICBtYXBTdGF0ZVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8TWFwUG9wb3ZlciB7Li4ucG9wb3ZlclByb3BzfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgLyogZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5ICovXG5cbiAgICBfZ2V0SG92ZXJYWSh2aWV3cG9ydCwgbG5nTGF0KSB7XG4gICAgICBjb25zdCBzY3JlZW5Db29yZCA9ICF2aWV3cG9ydCB8fCAhbG5nTGF0ID8gbnVsbCA6IHZpZXdwb3J0LnByb2plY3QobG5nTGF0KTtcblxuICAgICAgcmV0dXJuIHNjcmVlbkNvb3JkICYmIHt4OiBzY3JlZW5Db29yZFswXSwgeTogc2NyZWVuQ29vcmRbMV19O1xuICAgIH1cblxuICAgIF9zaG91bGRSZW5kZXJMYXllcihsYXllciwgZGF0YSwgbWFwTGF5ZXJzKSB7XG4gICAgICBjb25zdCBpc0F2YWlsYWJsZUFuZFZpc2libGUgPVxuICAgICAgICAhKG1hcExheWVycyAmJiBtYXBMYXllcnNbbGF5ZXIuaWRdKSB8fCBtYXBMYXllcnNbbGF5ZXIuaWRdLmlzVmlzaWJsZTtcbiAgICAgIHJldHVybiBsYXllci5zaG91bGRSZW5kZXJMYXllcihkYXRhKSAmJiBpc0F2YWlsYWJsZUFuZFZpc2libGU7XG4gICAgfVxuXG4gICAgX3JlbmRlckxheWVyID0gKG92ZXJsYXlzLCBpZHgpID0+IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgbGF5ZXJzLFxuICAgICAgICBsYXllckRhdGEsXG4gICAgICAgIGhvdmVySW5mbyxcbiAgICAgICAgY2xpY2tlZCxcbiAgICAgICAgbWFwTGF5ZXJzLFxuICAgICAgICBtYXBTdGF0ZSxcbiAgICAgICAgaW50ZXJhY3Rpb25Db25maWdcbiAgICAgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3Qge21vdXNlUG9zaXRpb259ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGNvbnN0IGxheWVyID0gbGF5ZXJzW2lkeF07XG4gICAgICBjb25zdCBkYXRhID0gbGF5ZXJEYXRhW2lkeF07XG5cbiAgICAgIGNvbnN0IGxheWVySW50ZXJhY3Rpb24gPSB7XG4gICAgICAgIG1vdXNlUG9zaXRpb25cbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG9iamVjdEhvdmVyZWQgPSBjbGlja2VkIHx8IGhvdmVySW5mbztcbiAgICAgIGNvbnN0IGxheWVyQ2FsbGJhY2tzID0ge1xuICAgICAgICBvblNldExheWVyRG9tYWluOiB2YWwgPT4gdGhpcy5fb25MYXllclNldERvbWFpbihpZHgsIHZhbClcbiAgICAgIH07XG5cbiAgICAgIGlmICghdGhpcy5fc2hvdWxkUmVuZGVyTGF5ZXIobGF5ZXIsIGRhdGEsIG1hcExheWVycykpIHtcbiAgICAgICAgcmV0dXJuIG92ZXJsYXlzO1xuICAgICAgfVxuXG4gICAgICBsZXQgbGF5ZXJPdmVybGF5ID0gW107XG5cbiAgICAgIC8vIExheWVyIGlzIExheWVyIGNsYXNzXG4gICAgICBpZiAodHlwZW9mIGxheWVyLnJlbmRlckxheWVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGxheWVyT3ZlcmxheSA9IGxheWVyLnJlbmRlckxheWVyKHtcbiAgICAgICAgICBkYXRhLFxuICAgICAgICAgIGlkeCxcbiAgICAgICAgICBsYXllckludGVyYWN0aW9uLFxuICAgICAgICAgIG9iamVjdEhvdmVyZWQsXG4gICAgICAgICAgbWFwU3RhdGUsXG4gICAgICAgICAgaW50ZXJhY3Rpb25Db25maWcsXG4gICAgICAgICAgbGF5ZXJDYWxsYmFja3NcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChsYXllck92ZXJsYXkubGVuZ3RoKSB7XG4gICAgICAgIG92ZXJsYXlzID0gb3ZlcmxheXMuY29uY2F0KGxheWVyT3ZlcmxheSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3ZlcmxheXM7XG4gICAgfTtcblxuICAgIF9yZW5kZXJPdmVybGF5KCkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBtYXBTdGF0ZSxcbiAgICAgICAgbGF5ZXJEYXRhLFxuICAgICAgICBsYXllck9yZGVyLFxuICAgICAgICB2aXNTdGF0ZUFjdGlvbnNcbiAgICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICBsZXQgZGVja0dsTGF5ZXJzID0gW107XG5cbiAgICAgIC8vIHdhaXQgdW50aWwgZGF0YSBpcyByZWFkeSBiZWZvcmUgcmVuZGVyIGRhdGEgbGF5ZXJzXG4gICAgICBpZiAobGF5ZXJEYXRhICYmIGxheWVyRGF0YS5sZW5ndGgpIHtcbiAgICAgICAgLy8gbGFzdCBsYXllciByZW5kZXIgZmlyc3RcbiAgICAgICAgZGVja0dsTGF5ZXJzID0gbGF5ZXJPcmRlclxuICAgICAgICAgIC5zbGljZSgpXG4gICAgICAgICAgLnJldmVyc2UoKVxuICAgICAgICAgIC5yZWR1Y2UodGhpcy5fcmVuZGVyTGF5ZXIsIFtdKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPERlY2tHTFxuICAgICAgICAgIHZpZXdTdGF0ZT17bWFwU3RhdGV9XG4gICAgICAgICAgaWQ9XCJkZWZhdWx0LWRlY2tnbC1vdmVybGF5XCJcbiAgICAgICAgICBsYXllcnM9e2RlY2tHbExheWVyc31cbiAgICAgICAgICBvbldlYkdMSW5pdGlhbGl6ZWQ9e3RoaXMuX29uV2ViR0xJbml0aWFsaXplZH1cbiAgICAgICAgICBvbkJlZm9yZVJlbmRlcj17dGhpcy5fb25CZWZvcmVSZW5kZXJ9XG4gICAgICAgICAgb25MYXllckhvdmVyPXt2aXNTdGF0ZUFjdGlvbnMub25MYXllckhvdmVyfVxuICAgICAgICAgIG9uTGF5ZXJDbGljaz17dmlzU3RhdGVBY3Rpb25zLm9uTGF5ZXJDbGlja31cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgX3JlbmRlck1hcGJveExheWVycygpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgbGF5ZXJzLFxuICAgICAgICBsYXllckRhdGEsXG4gICAgICAgIGxheWVyT3JkZXJcbiAgICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICByZXR1cm4gZ2VuZXJhdGVNYXBib3hMYXllcnMobGF5ZXJzLCBsYXllckRhdGEsIGxheWVyT3JkZXIpO1xuICAgIH1cblxuICAgIF9yZW5kZXJNYXBib3hPdmVybGF5cygpIHtcbiAgICAgIGlmICh0aGlzLl9tYXAgJiYgdGhpcy5fbWFwLmlzU3R5bGVMb2FkZWQoKSkge1xuXG4gICAgICAgIGNvbnN0IG1hcGJveExheWVycyA9IHRoaXMuX3JlbmRlck1hcGJveExheWVycygpO1xuXG4gICAgICAgIHVwZGF0ZU1hcGJveExheWVycyhcbiAgICAgICAgICB0aGlzLl9tYXAsXG4gICAgICAgICAgbWFwYm94TGF5ZXJzLFxuICAgICAgICAgIHRoaXMucHJldmlvdXNMYXllcnMsXG4gICAgICAgICAgdGhpcy5wcm9wcy5tYXBMYXllcnNcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnByZXZpb3VzTGF5ZXJzID0gbWFwYm94TGF5ZXJzLnJlZHVjZSgoZmluYWwsIGxheWVyKSA9PiAoe1xuICAgICAgICAgIC4uLmZpbmFsLFxuICAgICAgICAgIFtsYXllci5pZF06IGxheWVyLmNvbmZpZ1xuICAgICAgICB9KSwge30pXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge21hcFN0YXRlLCBtYXBTdHlsZSwgbWFwU3RhdGVBY3Rpb25zfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCB7dXBkYXRlTWFwLCBvbk1hcENsaWNrfSA9IG1hcFN0YXRlQWN0aW9ucztcblxuICAgICAgaWYgKCFtYXBTdHlsZS5ib3R0b21NYXBTdHlsZSkge1xuICAgICAgICAvLyBzdHlsZSBub3QgeWV0IGxvYWRlZFxuICAgICAgICByZXR1cm4gPGRpdi8+O1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7bWFwTGF5ZXJzLCBsYXllcnMsIGRhdGFzZXRzLCBtYXBib3hBcGlBY2Nlc3NUb2tlbixcbiAgICAgICAgbWFwQ29udHJvbHMsIHRvZ2dsZU1hcENvbnRyb2x9ID0gdGhpcy5wcm9wcztcblxuICAgICAgY29uc3QgbWFwUHJvcHMgPSB7XG4gICAgICAgIC4uLm1hcFN0YXRlLFxuICAgICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWUsXG4gICAgICAgIG1hcGJveEFwaUFjY2Vzc1Rva2VuLFxuICAgICAgICBvblZpZXdwb3J0Q2hhbmdlOiB1cGRhdGVNYXAsXG4gICAgICAgIHRyYW5zZm9ybVJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxTdHlsZWRNYXBDb250YWluZXIgc3R5bGU9e01BUF9TVFlMRS5jb250YWluZXJ9IG9uTW91c2VNb3ZlPXt0aGlzLl9vbk1vdXNlTW92ZX0+XG4gICAgICAgICAgPE1hcENvbnRyb2xcbiAgICAgICAgICAgIGRhdGFzZXRzPXtkYXRhc2V0c31cbiAgICAgICAgICAgIGRyYWdSb3RhdGU9e21hcFN0YXRlLmRyYWdSb3RhdGV9XG4gICAgICAgICAgICBpc1NwbGl0PXttYXBTdGF0ZS5pc1NwbGl0fVxuICAgICAgICAgICAgaXNFeHBvcnQ9e3RoaXMucHJvcHMuaXNFeHBvcnR9XG4gICAgICAgICAgICBsYXllcnM9e2xheWVyc31cbiAgICAgICAgICAgIG1hcEluZGV4PXt0aGlzLnByb3BzLmluZGV4fVxuICAgICAgICAgICAgbWFwTGF5ZXJzPXttYXBMYXllcnN9XG4gICAgICAgICAgICBtYXBDb250cm9scz17bWFwQ29udHJvbHN9XG4gICAgICAgICAgICBzY2FsZT17bWFwU3RhdGUuc2NhbGUgfHwgMX1cbiAgICAgICAgICAgIHRvcD17MH1cbiAgICAgICAgICAgIG9uVG9nZ2xlUGVyc3BlY3RpdmU9e21hcFN0YXRlQWN0aW9ucy50b2dnbGVQZXJzcGVjdGl2ZX1cbiAgICAgICAgICAgIG9uVG9nZ2xlU3BsaXRNYXA9e21hcFN0YXRlQWN0aW9ucy50b2dnbGVTcGxpdE1hcH1cbiAgICAgICAgICAgIG9uTWFwVG9nZ2xlTGF5ZXI9e3RoaXMuX2hhbmRsZU1hcFRvZ2dsZUxheWVyfVxuICAgICAgICAgICAgb25Ub2dnbGVGdWxsU2NyZWVuPXttYXBTdGF0ZUFjdGlvbnMudG9nZ2xlRnVsbFNjcmVlbn1cbiAgICAgICAgICAgIG9uVG9nZ2xlTWFwQ29udHJvbD17dG9nZ2xlTWFwQ29udHJvbH1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDx0aGlzLnByb3BzLk1hcENvbXBvbmVudFxuICAgICAgICAgICAgey4uLm1hcFByb3BzfVxuICAgICAgICAgICAga2V5PVwiYm90dG9tXCJcbiAgICAgICAgICAgIHJlZj17dGhpcy5fc2V0TWFwYm94TWFwfVxuICAgICAgICAgICAgbWFwU3R5bGU9e21hcFN0eWxlLmJvdHRvbU1hcFN0eWxlfVxuICAgICAgICAgICAgb25DbGljaz17b25NYXBDbGlja31cbiAgICAgICAgICAgIGdldEN1cnNvcj17dGhpcy5wcm9wcy5ob3ZlckluZm8gPyAoKSA9PiAncG9pbnRlcicgOiB1bmRlZmluZWR9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge3RoaXMuX3JlbmRlck92ZXJsYXkoKX1cbiAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJNYXBib3hPdmVybGF5cygpfVxuICAgICAgICAgIDwvdGhpcy5wcm9wcy5NYXBDb21wb25lbnQ+XG4gICAgICAgICAge21hcFN0eWxlLnRvcE1hcFN0eWxlICYmIChcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e01BUF9TVFlMRS50b3B9PlxuICAgICAgICAgICAgICA8dGhpcy5wcm9wcy5NYXBDb21wb25lbnRcbiAgICAgICAgICAgICAgICB7Li4ubWFwUHJvcHN9XG4gICAgICAgICAgICAgICAga2V5PVwidG9wXCJcbiAgICAgICAgICAgICAgICBtYXBTdHlsZT17bWFwU3R5bGUudG9wTWFwU3R5bGV9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApfVxuICAgICAgICAgIHt0aGlzLl9yZW5kZXJPYmplY3RMYXllclBvcG92ZXIoKX1cbiAgICAgICAgPC9TdHlsZWRNYXBDb250YWluZXI+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBNYXBDb250YWluZXI7XG59XG4iXX0=