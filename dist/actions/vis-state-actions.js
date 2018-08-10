'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.layerConfigChange = layerConfigChange;
exports.layerTypeChange = layerTypeChange;
exports.layerVisualChannelConfigChange = layerVisualChannelConfigChange;
exports.layerVisConfigChange = layerVisConfigChange;
exports.updateLayerBlending = updateLayerBlending;
exports.interactionConfigChange = interactionConfigChange;
exports.setFilter = setFilter;
exports.addFilter = addFilter;
exports.addLayer = addLayer;
exports.reorderLayer = reorderLayer;
exports.removeFilter = removeFilter;
exports.removeLayer = removeLayer;
exports.removeDataset = removeDataset;
exports.showDatasetTable = showDatasetTable;
exports.updateVisData = updateVisData;
exports.toggleAnimation = toggleAnimation;
exports.updateAnimationSpeed = updateAnimationSpeed;
exports.enlargeFilter = enlargeFilter;
exports.onLayerHover = onLayerHover;
exports.onLayerClick = onLayerClick;
exports.onMapClick = onMapClick;
exports.toggleLayerForMap = toggleLayerForMap;
exports.setVisibleLayersForMap = setVisibleLayersForMap;
exports.setFilterPlot = setFilterPlot;
exports.loadFiles = loadFiles;
exports.loadFilesErr = loadFilesErr;

var _actionTypes = require('../constants/action-types');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function layerConfigChange(oldLayer, newConfig) {
  return {
    type: _actionTypes2.default.LAYER_CONFIG_CHANGE,
    oldLayer: oldLayer,
    newConfig: newConfig
  };
} // Copyright (c) 2018 Uber Technologies, Inc.
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

// vis-state-reducer
function layerTypeChange(oldLayer, newType) {
  return {
    type: _actionTypes2.default.LAYER_TYPE_CHANGE,
    oldLayer: oldLayer,
    newType: newType
  };
}

function layerVisualChannelConfigChange(oldLayer, newConfig, channel) {
  return {
    type: _actionTypes2.default.LAYER_VISUAL_CHANNEL_CHANGE,
    oldLayer: oldLayer,
    newConfig: newConfig,
    channel: channel
  };
}

function layerVisConfigChange(oldLayer, newVisConfig) {
  return {
    type: _actionTypes2.default.LAYER_VIS_CONFIG_CHANGE,
    oldLayer: oldLayer,
    newVisConfig: newVisConfig
  };
}

function updateLayerBlending(mode) {
  return {
    type: _actionTypes2.default.UPDATE_LAYER_BLENDING,
    mode: mode
  };
}

function interactionConfigChange(config) {
  return {
    type: _actionTypes2.default.INTERACTION_CONFIG_CHANGE,
    config: config
  };
}

function setFilter(idx, prop, value) {
  return {
    type: _actionTypes2.default.SET_FILTER,
    idx: idx,
    prop: prop,
    value: value
  };
}

function addFilter(dataId) {
  return {
    type: _actionTypes2.default.ADD_FILTER,
    dataId: dataId
  };
}

function addLayer(props) {
  return {
    type: _actionTypes2.default.ADD_LAYER,
    props: props
  };
}

function reorderLayer(order) {
  return {
    type: _actionTypes2.default.REORDER_LAYER,
    order: order
  };
}

function removeFilter(idx) {
  return {
    type: _actionTypes2.default.REMOVE_FILTER,
    idx: idx
  };
}

function removeLayer(idx) {
  return {
    type: _actionTypes2.default.REMOVE_LAYER,
    idx: idx
  };
}

function removeDataset(key) {
  return {
    type: _actionTypes2.default.REMOVE_DATASET,
    key: key
  };
}

function showDatasetTable(dataId) {
  return {
    type: _actionTypes2.default.SHOW_DATASET_TABLE,
    dataId: dataId
  };
}

/**
 *
 * @param datasets - Array of datasets :
 * {info: {id: '', color: hex, label: '']}, data: {fields: [], rows: []}}
 * @param options {centerMap, readOnly}
 * @param config {visState, mapState, mapStyle}
 * @returns {{type: null, datasets: *, options: *}}
 */
function updateVisData(datasets, options, config) {
  return {
    type: _actionTypes2.default.UPDATE_VIS_DATA,
    datasets: datasets,
    options: options,
    config: config
  };
}

function toggleAnimation(idx) {
  return {
    type: _actionTypes2.default.TOGGLE_FILTER_ANIMATION,
    idx: idx
  };
}

function updateAnimationSpeed(idx, speed) {
  return {
    type: _actionTypes2.default.UPDATE_FILTER_ANIMATION_SPEED,
    idx: idx,
    speed: speed
  };
}

function enlargeFilter(idx) {
  return {
    type: _actionTypes2.default.ENLARGE_FILTER,
    idx: idx
  };
}

function onLayerHover(info) {
  return {
    type: _actionTypes2.default.LAYER_HOVER,
    info: info
  };
}

function onLayerClick(info) {
  return {
    type: _actionTypes2.default.LAYER_CLICK,
    info: info
  };
}

function onMapClick() {
  return {
    type: _actionTypes2.default.MAP_CLICK
  };
}

/**
 * Toggle a single layer for a give map
 * @param mapIndex
 * @param layerId
 * @returns {{type: *, mapIndex: *, layerId: *}}
 */
function toggleLayerForMap(mapIndex, layerId) {
  return {
    type: _actionTypes2.default.TOGGLE_LAYER_FOR_MAP,
    mapIndex: mapIndex,
    layerId: layerId
  };
}

/**
 * Toggle layer visibility on split views
 * @param layerIndex the layer we want to toggle visibility on
 * @param mapIndex the map index
 * @returns {{type: null, layerIndex: *, mapIndex: *}}
 */
function setVisibleLayersForMap(mapIndex, layerIds) {
  return {
    type: _actionTypes2.default.SET_VISIBLE_LAYERS_FOR_MAP,
    mapIndex: mapIndex,
    layerIds: layerIds
  };
}

function setFilterPlot(idx, newProp) {
  return {
    type: _actionTypes2.default.SET_FILTER_PLOT,
    idx: idx,
    newProp: newProp
  };
}

function loadFiles(files) {
  return {
    type: _actionTypes2.default.LOAD_FILES,
    files: files
  };
}

function loadFilesErr(error) {
  return {
    type: _actionTypes2.default.LOAD_FILES_ERR,
    error: error
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hY3Rpb25zL3Zpcy1zdGF0ZS1hY3Rpb25zLmpzIl0sIm5hbWVzIjpbImxheWVyQ29uZmlnQ2hhbmdlIiwibGF5ZXJUeXBlQ2hhbmdlIiwibGF5ZXJWaXN1YWxDaGFubmVsQ29uZmlnQ2hhbmdlIiwibGF5ZXJWaXNDb25maWdDaGFuZ2UiLCJ1cGRhdGVMYXllckJsZW5kaW5nIiwiaW50ZXJhY3Rpb25Db25maWdDaGFuZ2UiLCJzZXRGaWx0ZXIiLCJhZGRGaWx0ZXIiLCJhZGRMYXllciIsInJlb3JkZXJMYXllciIsInJlbW92ZUZpbHRlciIsInJlbW92ZUxheWVyIiwicmVtb3ZlRGF0YXNldCIsInNob3dEYXRhc2V0VGFibGUiLCJ1cGRhdGVWaXNEYXRhIiwidG9nZ2xlQW5pbWF0aW9uIiwidXBkYXRlQW5pbWF0aW9uU3BlZWQiLCJlbmxhcmdlRmlsdGVyIiwib25MYXllckhvdmVyIiwib25MYXllckNsaWNrIiwib25NYXBDbGljayIsInRvZ2dsZUxheWVyRm9yTWFwIiwic2V0VmlzaWJsZUxheWVyc0Zvck1hcCIsInNldEZpbHRlclBsb3QiLCJsb2FkRmlsZXMiLCJsb2FkRmlsZXNFcnIiLCJvbGRMYXllciIsIm5ld0NvbmZpZyIsInR5cGUiLCJBY3Rpb25UeXBlcyIsIkxBWUVSX0NPTkZJR19DSEFOR0UiLCJuZXdUeXBlIiwiTEFZRVJfVFlQRV9DSEFOR0UiLCJjaGFubmVsIiwiTEFZRVJfVklTVUFMX0NIQU5ORUxfQ0hBTkdFIiwibmV3VmlzQ29uZmlnIiwiTEFZRVJfVklTX0NPTkZJR19DSEFOR0UiLCJtb2RlIiwiVVBEQVRFX0xBWUVSX0JMRU5ESU5HIiwiY29uZmlnIiwiSU5URVJBQ1RJT05fQ09ORklHX0NIQU5HRSIsImlkeCIsInByb3AiLCJ2YWx1ZSIsIlNFVF9GSUxURVIiLCJkYXRhSWQiLCJBRERfRklMVEVSIiwicHJvcHMiLCJBRERfTEFZRVIiLCJvcmRlciIsIlJFT1JERVJfTEFZRVIiLCJSRU1PVkVfRklMVEVSIiwiUkVNT1ZFX0xBWUVSIiwia2V5IiwiUkVNT1ZFX0RBVEFTRVQiLCJTSE9XX0RBVEFTRVRfVEFCTEUiLCJkYXRhc2V0cyIsIm9wdGlvbnMiLCJVUERBVEVfVklTX0RBVEEiLCJUT0dHTEVfRklMVEVSX0FOSU1BVElPTiIsInNwZWVkIiwiVVBEQVRFX0ZJTFRFUl9BTklNQVRJT05fU1BFRUQiLCJFTkxBUkdFX0ZJTFRFUiIsImluZm8iLCJMQVlFUl9IT1ZFUiIsIkxBWUVSX0NMSUNLIiwiTUFQX0NMSUNLIiwibWFwSW5kZXgiLCJsYXllcklkIiwiVE9HR0xFX0xBWUVSX0ZPUl9NQVAiLCJsYXllcklkcyIsIlNFVF9WSVNJQkxFX0xBWUVSU19GT1JfTUFQIiwibmV3UHJvcCIsIlNFVF9GSUxURVJfUExPVCIsImZpbGVzIiwiTE9BRF9GSUxFUyIsImVycm9yIiwiTE9BRF9GSUxFU19FUlIiXSwibWFwcGluZ3MiOiI7Ozs7O1FBdUJnQkEsaUIsR0FBQUEsaUI7UUFRQUMsZSxHQUFBQSxlO1FBUUFDLDhCLEdBQUFBLDhCO1FBU0FDLG9CLEdBQUFBLG9CO1FBUUFDLG1CLEdBQUFBLG1CO1FBT0FDLHVCLEdBQUFBLHVCO1FBT0FDLFMsR0FBQUEsUztRQVNBQyxTLEdBQUFBLFM7UUFPQUMsUSxHQUFBQSxRO1FBT0FDLFksR0FBQUEsWTtRQU9BQyxZLEdBQUFBLFk7UUFPQUMsVyxHQUFBQSxXO1FBT0FDLGEsR0FBQUEsYTtRQU9BQyxnQixHQUFBQSxnQjtRQWVBQyxhLEdBQUFBLGE7UUFTQUMsZSxHQUFBQSxlO1FBT0FDLG9CLEdBQUFBLG9CO1FBUUFDLGEsR0FBQUEsYTtRQU9BQyxZLEdBQUFBLFk7UUFPQUMsWSxHQUFBQSxZO1FBT0FDLFUsR0FBQUEsVTtRQVlBQyxpQixHQUFBQSxpQjtRQWNBQyxzQixHQUFBQSxzQjtRQVFBQyxhLEdBQUFBLGE7UUFRQUMsUyxHQUFBQSxTO1FBT0FDLFksR0FBQUEsWTs7QUFqTmhCOzs7Ozs7QUFFTyxTQUFTekIsaUJBQVQsQ0FBMkIwQixRQUEzQixFQUFxQ0MsU0FBckMsRUFBZ0Q7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QUFTaEQsU0FBVCxDQUFtQmtELEtBQW5CLEVBQTBCO0FBQy9CLFNBQU87QUFDTDlDLFVBQU1DLHNCQUFZOEMsVUFEYjtBQUVMRDtBQUZLLEdBQVA7QUFJRDs7QUFFTSxTQUFTakQsWUFBVCxDQUFzQm1ELEtBQXRCLEVBQTZCO0FBQ2xDLFNBQU87QUFDTGhELFVBQU1DLHNCQUFZZ0QsY0FEYjtBQUVMRDtBQUZLLEdBQVA7QUFJRCIsImZpbGUiOiJ2aXMtc3RhdGUtYWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxOCBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIHZpcy1zdGF0ZS1yZWR1Y2VyXG5pbXBvcnQgQWN0aW9uVHlwZXMgZnJvbSAnY29uc3RhbnRzL2FjdGlvbi10eXBlcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsYXllckNvbmZpZ0NoYW5nZShvbGRMYXllciwgbmV3Q29uZmlnKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTEFZRVJfQ09ORklHX0NIQU5HRSxcbiAgICBvbGRMYXllcixcbiAgICBuZXdDb25maWdcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxheWVyVHlwZUNoYW5nZShvbGRMYXllciwgbmV3VHlwZSkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkxBWUVSX1RZUEVfQ0hBTkdFLFxuICAgIG9sZExheWVyLFxuICAgIG5ld1R5cGVcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxheWVyVmlzdWFsQ2hhbm5lbENvbmZpZ0NoYW5nZShvbGRMYXllciwgbmV3Q29uZmlnLCBjaGFubmVsKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTEFZRVJfVklTVUFMX0NIQU5ORUxfQ0hBTkdFLFxuICAgIG9sZExheWVyLFxuICAgIG5ld0NvbmZpZyxcbiAgICBjaGFubmVsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsYXllclZpc0NvbmZpZ0NoYW5nZShvbGRMYXllciwgbmV3VmlzQ29uZmlnKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTEFZRVJfVklTX0NPTkZJR19DSEFOR0UsXG4gICAgb2xkTGF5ZXIsXG4gICAgbmV3VmlzQ29uZmlnXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVMYXllckJsZW5kaW5nKG1vZGUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5VUERBVEVfTEFZRVJfQkxFTkRJTkcsXG4gICAgbW9kZVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJhY3Rpb25Db25maWdDaGFuZ2UoY29uZmlnKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuSU5URVJBQ1RJT05fQ09ORklHX0NIQU5HRSxcbiAgICBjb25maWdcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEZpbHRlcihpZHgsIHByb3AsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0VUX0ZJTFRFUixcbiAgICBpZHgsXG4gICAgcHJvcCxcbiAgICB2YWx1ZVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkRmlsdGVyKGRhdGFJZCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkFERF9GSUxURVIsXG4gICAgZGF0YUlkXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRMYXllcihwcm9wcykge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkFERF9MQVlFUixcbiAgICBwcm9wc1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVvcmRlckxheWVyKG9yZGVyKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuUkVPUkRFUl9MQVlFUixcbiAgICBvcmRlclxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRmlsdGVyKGlkeCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlJFTU9WRV9GSUxURVIsXG4gICAgaWR4XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVMYXllcihpZHgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5SRU1PVkVfTEFZRVIsXG4gICAgaWR4XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVEYXRhc2V0KGtleSkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlJFTU9WRV9EQVRBU0VULFxuICAgIGtleVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0RhdGFzZXRUYWJsZShkYXRhSWQpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TSE9XX0RBVEFTRVRfVEFCTEUsXG4gICAgZGF0YUlkXG4gIH07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBkYXRhc2V0cyAtIEFycmF5IG9mIGRhdGFzZXRzIDpcbiAqIHtpbmZvOiB7aWQ6ICcnLCBjb2xvcjogaGV4LCBsYWJlbDogJyddfSwgZGF0YToge2ZpZWxkczogW10sIHJvd3M6IFtdfX1cbiAqIEBwYXJhbSBvcHRpb25zIHtjZW50ZXJNYXAsIHJlYWRPbmx5fVxuICogQHBhcmFtIGNvbmZpZyB7dmlzU3RhdGUsIG1hcFN0YXRlLCBtYXBTdHlsZX1cbiAqIEByZXR1cm5zIHt7dHlwZTogbnVsbCwgZGF0YXNldHM6ICosIG9wdGlvbnM6ICp9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlVmlzRGF0YShkYXRhc2V0cywgb3B0aW9ucywgY29uZmlnKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuVVBEQVRFX1ZJU19EQVRBLFxuICAgIGRhdGFzZXRzLFxuICAgIG9wdGlvbnMsXG4gICAgY29uZmlnXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVBbmltYXRpb24oaWR4KSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuVE9HR0xFX0ZJTFRFUl9BTklNQVRJT04sXG4gICAgaWR4XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVBbmltYXRpb25TcGVlZChpZHgsIHNwZWVkKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuVVBEQVRFX0ZJTFRFUl9BTklNQVRJT05fU1BFRUQsXG4gICAgaWR4LFxuICAgIHNwZWVkXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmxhcmdlRmlsdGVyKGlkeCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkVOTEFSR0VfRklMVEVSLFxuICAgIGlkeFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb25MYXllckhvdmVyKGluZm8pIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MQVlFUl9IT1ZFUixcbiAgICBpbmZvXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvbkxheWVyQ2xpY2soaW5mbykge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkxBWUVSX0NMSUNLLFxuICAgIGluZm9cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9uTWFwQ2xpY2soKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTUFQX0NMSUNLXG4gIH07XG59XG5cbi8qKlxuICogVG9nZ2xlIGEgc2luZ2xlIGxheWVyIGZvciBhIGdpdmUgbWFwXG4gKiBAcGFyYW0gbWFwSW5kZXhcbiAqIEBwYXJhbSBsYXllcklkXG4gKiBAcmV0dXJucyB7e3R5cGU6ICosIG1hcEluZGV4OiAqLCBsYXllcklkOiAqfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZUxheWVyRm9yTWFwKG1hcEluZGV4LCBsYXllcklkKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuVE9HR0xFX0xBWUVSX0ZPUl9NQVAsXG4gICAgbWFwSW5kZXgsXG4gICAgbGF5ZXJJZFxuICB9O1xufVxuXG4vKipcbiAqIFRvZ2dsZSBsYXllciB2aXNpYmlsaXR5IG9uIHNwbGl0IHZpZXdzXG4gKiBAcGFyYW0gbGF5ZXJJbmRleCB0aGUgbGF5ZXIgd2Ugd2FudCB0byB0b2dnbGUgdmlzaWJpbGl0eSBvblxuICogQHBhcmFtIG1hcEluZGV4IHRoZSBtYXAgaW5kZXhcbiAqIEByZXR1cm5zIHt7dHlwZTogbnVsbCwgbGF5ZXJJbmRleDogKiwgbWFwSW5kZXg6ICp9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VmlzaWJsZUxheWVyc0Zvck1hcChtYXBJbmRleCwgbGF5ZXJJZHMpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TRVRfVklTSUJMRV9MQVlFUlNfRk9SX01BUCxcbiAgICBtYXBJbmRleCxcbiAgICBsYXllcklkc1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RmlsdGVyUGxvdChpZHgsIG5ld1Byb3ApIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TRVRfRklMVEVSX1BMT1QsXG4gICAgaWR4LFxuICAgIG5ld1Byb3BcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRGaWxlcyhmaWxlcykge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkxPQURfRklMRVMsXG4gICAgZmlsZXNcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRGaWxlc0VycihlcnJvcikge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkxPQURfRklMRVNfRVJSLFxuICAgIGVycm9yXG4gIH07XG59XG4iXX0=