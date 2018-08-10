'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadFilesErrUpdater = exports.loadFilesUpdater = exports.updateVisDataUpdater = exports.toggleLayerForMapUpdater = exports.setVisibleLayersForMapUpdater = exports.toggleSplitMapUpdater = exports.mapClickUpdater = exports.layerClickUpdater = exports.layerHoverUpdater = exports.receiveMapConfigUpdater = exports.resetMapConfigVisStateUpdater = exports.showDatasetTableUpdater = exports.updateLayerBlendingUpdater = exports.removeDatasetUpdater = exports.reorderLayerUpdater = exports.removeLayerUpdater = exports.addLayerUpdater = exports.removeFilterUpdater = exports.enlargeFilterUpdater = exports.updateAnimationSpeedUpdater = exports.toggleFilterAnimationUpdater = exports.addFilterUpdater = exports.setFilterPlotUpdater = exports.INITIAL_VIS_STATE = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _extends13 = require('babel-runtime/helpers/extends');

var _extends14 = _interopRequireDefault(_extends13);

exports.layerConfigChangeUpdater = layerConfigChangeUpdater;
exports.layerTypeChangeUpdater = layerTypeChangeUpdater;
exports.layerVisualChannelChangeUpdater = layerVisualChannelChangeUpdater;
exports.layerVisConfigChangeUpdater = layerVisConfigChangeUpdater;
exports.interactionConfigChangeUpdater = interactionConfigChangeUpdater;
exports.setFilterUpdater = setFilterUpdater;
exports.addDefaultLayers = addDefaultLayers;
exports.addDefaultTooltips = addDefaultTooltips;
exports.updateAllLayerDomainData = updateAllLayerDomainData;

var _window = require('global/window');

var _reactPalm = require('react-palm');

var _tasks = require('react-palm/tasks');

var _tasks2 = require('../tasks/tasks');

var _visStateActions = require('../actions/vis-state-actions');

var _actions = require('../actions');

var _interactionUtils = require('../utils/interaction-utils');

var _utils = require('../utils/utils');

var _filterUtils = require('../utils/filter-utils');

var _datasetUtils = require('../utils/dataset-utils');

var _layerUtils = require('../utils/layer-utils/layer-utils');

var _fileHandler = require('../processors/file-handler');

var _visStateMerger = require('./vis-state-merger');

var _layers = require('../layers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// react-palm
// disable capture exception for react-palm call to withTasks


// Tasks
(0, _tasks.disableStackCapturing)();

// Utils


// Actions
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

var INITIAL_VIS_STATE = exports.INITIAL_VIS_STATE = {
  // layers
  layers: [],
  layerData: [],
  layerToBeMerged: [],
  layerOrder: [],

  // filters
  filters: [],
  filterToBeMerged: [],

  // a collection of multiple dataset
  datasets: {},
  editingDataset: undefined,

  interactionConfig: (0, _interactionUtils.getDefaultInteraction)(),
  interactionToBeMerged: undefined,

  layerBlending: 'normal',
  hoverInfo: undefined,
  clicked: undefined,

  fileLoading: false,
  fileLoadingErr: null,

  // this is used when user split maps
  splitMaps: [
    // this will contain a list of objects to
    // describe the state of layer availability and visibility for each map
    // [
    //   {
    //     layers: {
    //       layer_id: {
    //         isAvailable: true|false # this is driven by the left hand panel
    //         isVisible: true|false
    //       }
    //     }
    //   }
    // ]
  ],

  // defaults layer classes
  layerClasses: _layers.LayerClasses
};

function updateStateWithLayerAndData(state, _ref) {
  var layerData = _ref.layerData,
      layer = _ref.layer,
      idx = _ref.idx;

  return (0, _extends14.default)({}, state, {
    layers: state.layers.map(function (lyr, i) {
      return i === idx ? layer : lyr;
    }),
    layerData: layerData ? state.layerData.map(function (d, i) {
      return i === idx ? layerData : d;
    }) : state.layerData
  });
}

/**
 * Called to update layer base config: dataId, label, column, isVisible
 *
 */
function layerConfigChangeUpdater(state, action) {
  var oldLayer = action.oldLayer;

  var idx = state.layers.findIndex(function (l) {
    return l.id === oldLayer.id;
  });
  var props = Object.keys(action.newConfig);

  var newLayer = oldLayer.updateLayerConfig(action.newConfig);
  if (newLayer.shouldCalculateLayerData(props)) {
    var oldLayerData = state.layerData[idx];

    var _calculateLayerData = (0, _layerUtils.calculateLayerData)(newLayer, state, oldLayerData, { sameData: true }),
        layerData = _calculateLayerData.layerData,
        layer = _calculateLayerData.layer;

    return updateStateWithLayerAndData(state, { layerData: layerData, layer: layer, idx: idx });
  }

  var newState = (0, _extends14.default)({}, state, {
    splitMaps: 'isVisible' in action.newConfig ? toggleLayerFromSplitMaps(state, newLayer) : state.splitMaps
  });

  return updateStateWithLayerAndData(newState, { layer: newLayer, idx: idx });
}

function layerTypeChangeUpdater(state, action) {
  var oldLayer = action.oldLayer,
      newType = action.newType;

  var oldId = oldLayer.id;
  var idx = state.layers.findIndex(function (l) {
    return l.id === oldId;
  });

  if (!state.layerClasses[newType]) {
    _window.console.error(newType + ' is not a valid layer type');
    return state;
  }

  // get a mint layer, with new id and type
  // because deck.gl uses id to match between new and old layer.
  // If type has changed but id is the same, it will break
  var newLayer = new state.layerClasses[newType]();

  newLayer.assignConfigToLayer(oldLayer.config, oldLayer.visConfigSettings);

  if (newLayer.config.dataId) {
    var dataset = state.datasets[newLayer.config.dataId];
    newLayer.updateLayerDomain(dataset);
  }

  var _calculateLayerData2 = (0, _layerUtils.calculateLayerData)(newLayer, state),
      layerData = _calculateLayerData2.layerData,
      layer = _calculateLayerData2.layer;

  var newState = state;

  // update splitMap layer id
  if (state.splitMaps) {
    newState = (0, _extends14.default)({}, state, {
      splitMaps: state.splitMaps.map(function (settings) {
        var _settings$layers = settings.layers,
            oldLayerMap = _settings$layers[oldId],
            otherLayers = (0, _objectWithoutProperties3.default)(_settings$layers, [oldId]);

        return (0, _extends14.default)({}, settings, {
          layers: (0, _extends14.default)({}, otherLayers, (0, _defineProperty3.default)({}, layer.id, oldLayerMap))
        });
      })
    });
  }

  return updateStateWithLayerAndData(newState, { layerData: layerData, layer: layer, idx: idx });
}

function layerVisualChannelChangeUpdater(state, action) {
  var oldLayer = action.oldLayer,
      newConfig = action.newConfig,
      channel = action.channel;

  var dataset = state.datasets[oldLayer.config.dataId];

  var idx = state.layers.findIndex(function (l) {
    return l.id === oldLayer.id;
  });
  var newLayer = oldLayer.updateLayerConfig(newConfig);

  newLayer.updateLayerVisualChannel(dataset, channel);

  var oldLayerData = state.layerData[idx];

  var _calculateLayerData3 = (0, _layerUtils.calculateLayerData)(newLayer, state, oldLayerData, {
    sameData: true
  }),
      layerData = _calculateLayerData3.layerData,
      layer = _calculateLayerData3.layer;

  return updateStateWithLayerAndData(state, { layerData: layerData, layer: layer, idx: idx });
}

function layerVisConfigChangeUpdater(state, action) {
  var oldLayer = action.oldLayer;

  var idx = state.layers.findIndex(function (l) {
    return l.id === oldLayer.id;
  });
  var props = Object.keys(action.newVisConfig);

  var newVisConfig = (0, _extends14.default)({}, oldLayer.config.visConfig, action.newVisConfig);

  var newLayer = oldLayer.updateLayerConfig({ visConfig: newVisConfig });

  if (newLayer.shouldCalculateLayerData(props)) {
    var oldLayerData = state.layerData[idx];

    var _calculateLayerData4 = (0, _layerUtils.calculateLayerData)(newLayer, state, oldLayerData, { sameData: true }),
        layerData = _calculateLayerData4.layerData,
        layer = _calculateLayerData4.layer;

    return updateStateWithLayerAndData(state, { layerData: layerData, layer: layer, idx: idx });
  }

  return updateStateWithLayerAndData(state, { layer: newLayer, idx: idx });
}

/* eslint-enable max-statements */

function interactionConfigChangeUpdater(state, action) {
  var config = action.config;


  var interactionConfig = (0, _extends14.default)({}, state.interactionConfig, (0, _defineProperty3.default)({}, config.id, config));

  if (config.enabled && !state.interactionConfig[config.id].enabled) {
    // only enable one interaction at a time
    Object.keys(interactionConfig).forEach(function (k) {
      if (k !== config.id) {
        interactionConfig[k] = (0, _extends14.default)({}, interactionConfig[k], { enabled: false });
      }
    });
  }

  return (0, _extends14.default)({}, state, {
    interactionConfig: interactionConfig
  });
}

function setFilterUpdater(state, action) {
  var idx = action.idx,
      prop = action.prop,
      value = action.value;

  var newState = state;
  var newFilter = (0, _extends14.default)({}, state.filters[idx], (0, _defineProperty3.default)({}, prop, value));

  var _newFilter = newFilter,
      dataId = _newFilter.dataId;

  if (!dataId) {
    return state;
  }
  var _state$datasets$dataI = state.datasets[dataId],
      fields = _state$datasets$dataI.fields,
      allData = _state$datasets$dataI.allData;


  switch (prop) {
    case 'dataId':
      // if trying to update filter dataId. create an empty new filter
      newFilter = (0, _filterUtils.getDefaultFilter)(dataId);
      break;

    case 'name':
      // find the field
      var fieldIdx = fields.findIndex(function (f) {
        return f.name === value;
      });
      var field = fields[fieldIdx];

      if (!field.filterProp) {
        // get filter domain from field
        // save filterProps: {domain, steps, value} to field, avoid recalculate
        field = (0, _extends14.default)({}, field, {
          filterProp: (0, _filterUtils.getFilterProps)(allData, field)
        });
      }

      newFilter = (0, _extends14.default)({}, newFilter, field.filterProp, {
        name: field.name,
        // can't edit dataId once name is selected
        freeze: true,
        fieldIdx: fieldIdx
      });
      var enlargedFilterIdx = state.filters.findIndex(function (f) {
        return f.enlarged;
      });
      if (enlargedFilterIdx > -1 && enlargedFilterIdx !== idx) {
        // there should be only one enlarged filter
        newFilter.enlarged = false;
      }

      newState = (0, _extends14.default)({}, state, {
        datasets: (0, _extends14.default)({}, state.datasets, (0, _defineProperty3.default)({}, dataId, (0, _extends14.default)({}, state.datasets[dataId], {
          fields: fields.map(function (d, i) {
            return i === fieldIdx ? field : d;
          })
        })))
      });
      break;
    case 'value':
    default:
      break;
  }

  // save new filters to newState
  newState = (0, _extends14.default)({}, newState, {
    filters: state.filters.map(function (f, i) {
      return i === idx ? newFilter : f;
    })
  });

  // filter data
  newState = (0, _extends14.default)({}, newState, {
    datasets: (0, _extends14.default)({}, newState.datasets, (0, _defineProperty3.default)({}, dataId, (0, _extends14.default)({}, newState.datasets[dataId], (0, _filterUtils.filterData)(allData, dataId, newState.filters))))
  });

  newState = updateAllLayerDomainData(newState, dataId, newFilter);

  return newState;
}

var setFilterPlotUpdater = exports.setFilterPlotUpdater = function setFilterPlotUpdater(state, _ref2) {
  var idx = _ref2.idx,
      newProp = _ref2.newProp;

  var newFilter = (0, _extends14.default)({}, state.filters[idx], newProp);
  var prop = Object.keys(newProp)[0];
  if (prop === 'yAxis') {
    var plotType = (0, _filterUtils.getDefaultFilterPlotType)(newFilter);

    if (plotType) {
      newFilter = (0, _extends14.default)({}, newFilter, (0, _filterUtils.getFilterPlot)((0, _extends14.default)({}, newFilter, { plotType: plotType }), state.datasets[newFilter.dataId].allData), {
        plotType: plotType
      });
    }
  }

  return (0, _extends14.default)({}, state, {
    filters: state.filters.map(function (f, i) {
      return i === idx ? newFilter : f;
    })
  });
};

var addFilterUpdater = exports.addFilterUpdater = function addFilterUpdater(state, action) {
  return !action.dataId ? state : (0, _extends14.default)({}, state, {
    filters: [].concat((0, _toConsumableArray3.default)(state.filters), [(0, _filterUtils.getDefaultFilter)(action.dataId)])
  });
};

var toggleFilterAnimationUpdater = exports.toggleFilterAnimationUpdater = function toggleFilterAnimationUpdater(state, action) {
  return (0, _extends14.default)({}, state, {
    filters: state.filters.map(function (f, i) {
      return i === action.idx ? (0, _extends14.default)({}, f, { isAnimating: !f.isAnimating }) : f;
    })
  });
};

var updateAnimationSpeedUpdater = exports.updateAnimationSpeedUpdater = function updateAnimationSpeedUpdater(state, action) {
  return (0, _extends14.default)({}, state, {
    filters: state.filters.map(function (f, i) {
      return i === action.idx ? (0, _extends14.default)({}, f, { speed: action.speed }) : f;
    })
  });
};

var enlargeFilterUpdater = exports.enlargeFilterUpdater = function enlargeFilterUpdater(state, action) {
  var isEnlarged = state.filters[action.idx].enlarged;

  return (0, _extends14.default)({}, state, {
    filters: state.filters.map(function (f, i) {
      f.enlarged = !isEnlarged && i === action.idx;
      return f;
    })
  });
};

var removeFilterUpdater = exports.removeFilterUpdater = function removeFilterUpdater(state, action) {
  var idx = action.idx;
  var dataId = state.filters[idx].dataId;


  var newFilters = [].concat((0, _toConsumableArray3.default)(state.filters.slice(0, idx)), (0, _toConsumableArray3.default)(state.filters.slice(idx + 1, state.filters.length)));

  var newState = (0, _extends14.default)({}, state, {
    datasets: (0, _extends14.default)({}, state.datasets, (0, _defineProperty3.default)({}, dataId, (0, _extends14.default)({}, state.datasets[dataId], (0, _filterUtils.filterData)(state.datasets[dataId].allData, dataId, newFilters)))),
    filters: newFilters
  });

  return updateAllLayerDomainData(newState, dataId);
};

var addLayerUpdater = exports.addLayerUpdater = function addLayerUpdater(state, action) {
  var defaultDataset = Object.keys(state.datasets)[0];
  var newLayer = new _layers.Layer((0, _extends14.default)({
    isVisible: true,
    isConfigActive: true,
    dataId: defaultDataset
  }, action.props));

  return (0, _extends14.default)({}, state, {
    layers: [].concat((0, _toConsumableArray3.default)(state.layers), [newLayer]),
    layerData: [].concat((0, _toConsumableArray3.default)(state.layerData), [{}]),
    layerOrder: [].concat((0, _toConsumableArray3.default)(state.layerOrder), [state.layerOrder.length]),
    splitMaps: addNewLayersToSplitMap(state.splitMaps, newLayer)
  });
};

var removeLayerUpdater = exports.removeLayerUpdater = function removeLayerUpdater(state, _ref3) {
  var idx = _ref3.idx;
  var layers = state.layers,
      layerData = state.layerData,
      clicked = state.clicked,
      hoverInfo = state.hoverInfo;

  var layerToRemove = state.layers[idx];
  var newMaps = removeLayerFromSplitMaps(state, layerToRemove);

  return (0, _extends14.default)({}, state, {
    layers: [].concat((0, _toConsumableArray3.default)(layers.slice(0, idx)), (0, _toConsumableArray3.default)(layers.slice(idx + 1, layers.length))),
    layerData: [].concat((0, _toConsumableArray3.default)(layerData.slice(0, idx)), (0, _toConsumableArray3.default)(layerData.slice(idx + 1, layerData.length))),
    layerOrder: state.layerOrder.filter(function (i) {
      return i !== idx;
    }).map(function (pid) {
      return pid > idx ? pid - 1 : pid;
    }),
    clicked: layerToRemove.isLayerHovered(clicked) ? undefined : clicked,
    hoverInfo: layerToRemove.isLayerHovered(hoverInfo) ? undefined : hoverInfo,
    splitMaps: newMaps
  });
};

var reorderLayerUpdater = exports.reorderLayerUpdater = function reorderLayerUpdater(state, _ref4) {
  var order = _ref4.order;
  return (0, _extends14.default)({}, state, {
    layerOrder: order
  });
};

var removeDatasetUpdater = function removeDatasetUpdater(state, action) {
  // extract dataset key
  var datasetKey = action.key;
  var datasets = state.datasets;

  // check if dataset is present

  if (!datasets[datasetKey]) {
    return state;
  }

  /* eslint-disable no-unused-vars */
  var layers = state.layers,
      _state$datasets = state.datasets,
      dataset = _state$datasets[datasetKey],
      newDatasets = (0, _objectWithoutProperties3.default)(_state$datasets, [datasetKey]);
  /* eslint-enable no-unused-vars */

  var indexes = layers.reduce(function (listOfIndexes, layer, index) {
    if (layer.config.dataId === datasetKey) {
      listOfIndexes.push(index);
    }
    return listOfIndexes;
  }, []);

  // remove layers and datasets

  var _indexes$reduce = indexes.reduce(function (_ref5, idx) {
    var currentState = _ref5.newState,
        indexCounter = _ref5.indexCounter;

    var currentIndex = idx - indexCounter;
    currentState = removeLayerUpdater(currentState, { idx: currentIndex });
    indexCounter++;
    return { newState: currentState, indexCounter: indexCounter };
  }, { newState: (0, _extends14.default)({}, state, { datasets: newDatasets }), indexCounter: 0 }),
      newState = _indexes$reduce.newState;

  // remove filters


  var filters = state.filters.filter(function (filter) {
    return filter.dataId !== datasetKey;
  });

  // update interactionConfig
  var interactionConfig = state.interactionConfig;
  var _interactionConfig = interactionConfig,
      tooltip = _interactionConfig.tooltip;

  if (tooltip) {
    var config = tooltip.config;
    /* eslint-disable no-unused-vars */

    var _config$fieldsToShow = config.fieldsToShow,
        fields = _config$fieldsToShow[datasetKey],
        fieldsToShow = (0, _objectWithoutProperties3.default)(_config$fieldsToShow, [datasetKey]);
    /* eslint-enable no-unused-vars */

    interactionConfig = (0, _extends14.default)({}, interactionConfig, {
      tooltip: (0, _extends14.default)({}, tooltip, { config: (0, _extends14.default)({}, config, { fieldsToShow: fieldsToShow }) })
    });
  }

  return (0, _extends14.default)({}, newState, { filters: filters, interactionConfig: interactionConfig });
};

exports.removeDatasetUpdater = removeDatasetUpdater;
var updateLayerBlendingUpdater = exports.updateLayerBlendingUpdater = function updateLayerBlendingUpdater(state, action) {
  return (0, _extends14.default)({}, state, {
    layerBlending: action.mode
  });
};

var showDatasetTableUpdater = exports.showDatasetTableUpdater = function showDatasetTableUpdater(state, action) {
  return (0, _extends14.default)({}, state, {
    editingDataset: action.dataId
  });
};

var resetMapConfigVisStateUpdater = exports.resetMapConfigVisStateUpdater = function resetMapConfigVisStateUpdater(state, action) {
  return (0, _extends14.default)({}, INITIAL_VIS_STATE, state.initialState, {
    initialState: state.initialState
  });
};

/**
 * Loads custom configuration into state
 * @param state
 * @param action
 * @returns {*}
 */
var receiveMapConfigUpdater = exports.receiveMapConfigUpdater = function receiveMapConfigUpdater(state, action) {
  if (!action.payload.visState) {
    return state;
  }

  var _action$payload$visSt = action.payload.visState,
      filters = _action$payload$visSt.filters,
      layers = _action$payload$visSt.layers,
      interactionConfig = _action$payload$visSt.interactionConfig,
      layerBlending = _action$payload$visSt.layerBlending,
      splitMaps = _action$payload$visSt.splitMaps;

  // always reset config when receive a new config

  var resetState = resetMapConfigVisStateUpdater(state);
  var mergedState = (0, _extends14.default)({}, resetState, {
    splitMaps: splitMaps || [] // maps doesn't require any logic
  });

  mergedState = (0, _visStateMerger.mergeFilters)(mergedState, filters);
  mergedState = (0, _visStateMerger.mergeLayers)(mergedState, layers);
  mergedState = (0, _visStateMerger.mergeInteractions)(mergedState, interactionConfig);
  mergedState = (0, _visStateMerger.mergeLayerBlending)(mergedState, layerBlending);

  return mergedState;
};

var layerHoverUpdater = exports.layerHoverUpdater = function layerHoverUpdater(state, action) {
  return (0, _extends14.default)({}, state, {
    hoverInfo: action.info
  });
};

var layerClickUpdater = exports.layerClickUpdater = function layerClickUpdater(state, action) {
  return (0, _extends14.default)({}, state, {
    clicked: action.info && action.info.picked ? action.info : null
  });
};

var mapClickUpdater = exports.mapClickUpdater = function mapClickUpdater(state, action) {
  return (0, _extends14.default)({}, state, {
    clicked: null
  });
};

var toggleSplitMapUpdater = exports.toggleSplitMapUpdater = function toggleSplitMapUpdater(state, action) {
  return state.splitMaps && state.splitMaps.length === 0 ? (0, _extends14.default)({}, state, {
    // maybe we should use an array to store state for a single map as well
    // if current maps length is equal to 0 it means that we are about to split the view
    splitMaps: computeSplitMapLayers(state.layers)
  }) : closeSpecificMapAtIndex(state, action);
};

/**
 * This is triggered when view is split into multiple maps.
 * It will only update layers that belong to the map layer dropdown
 * the user is interacting wit
 * @param state
 * @param action
 */
var setVisibleLayersForMapUpdater = exports.setVisibleLayersForMapUpdater = function setVisibleLayersForMapUpdater(state, action) {
  var mapIndex = action.mapIndex,
      layerIds = action.layerIds;

  if (!layerIds) {
    return state;
  }

  var _state$splitMaps = state.splitMaps,
      splitMaps = _state$splitMaps === undefined ? [] : _state$splitMaps;


  if (splitMaps.length === 0) {
    // we should never get into this state
    // because this action should only be triggered
    // when map view is split
    // but something may have happened
    return state;
  }

  // need to check if maps is populated otherwise will create
  var _splitMaps$mapIndex = splitMaps[mapIndex],
      map = _splitMaps$mapIndex === undefined ? {} : _splitMaps$mapIndex;


  var layers = map.layers || [];

  // we set visibility to true for all layers included in our input list
  var newLayers = (Object.keys(layers) || []).reduce(function (currentLayers, idx) {
    return (0, _extends14.default)({}, currentLayers, (0, _defineProperty3.default)({}, idx, (0, _extends14.default)({}, layers[idx], {
      isVisible: layerIds.includes(idx)
    })));
  }, {});

  var newMaps = [].concat((0, _toConsumableArray3.default)(splitMaps));

  newMaps[mapIndex] = (0, _extends14.default)({}, splitMaps[mapIndex], {
    layers: newLayers
  });

  return (0, _extends14.default)({}, state, {
    splitMaps: newMaps
  });
};

var toggleLayerForMapUpdater = exports.toggleLayerForMapUpdater = function toggleLayerForMapUpdater(state, action) {
  if (!state.splitMaps[action.mapIndex]) {
    return state;
  }

  var mapSettings = state.splitMaps[action.mapIndex];
  var layers = mapSettings.layers;

  if (!layers || !layers[action.layerId]) {
    return state;
  }

  var layer = layers[action.layerId];

  var newLayer = (0, _extends14.default)({}, layer, {
    isVisible: !layer.isVisible
  });

  var newLayers = (0, _extends14.default)({}, layers, (0, _defineProperty3.default)({}, action.layerId, newLayer));

  // const splitMaps = state.splitMaps;
  var newSplitMaps = [].concat((0, _toConsumableArray3.default)(state.splitMaps));
  newSplitMaps[action.mapIndex] = (0, _extends14.default)({}, mapSettings, {
    layers: newLayers
  });

  return (0, _extends14.default)({}, state, {
    splitMaps: newSplitMaps
  });
};

/* eslint-disable max-statements */
var updateVisDataUpdater = exports.updateVisDataUpdater = function updateVisDataUpdater(state, action) {
  // datasets can be a single data entries or an array of multiple data entries
  var datasets = Array.isArray(action.datasets) ? action.datasets : [action.datasets];

  if (action.config) {
    // apply config if passed from action
    state = receiveMapConfigUpdater(state, {
      payload: { visState: action.config }
    });
  }

  var newDateEntries = datasets.reduce(function (accu, _ref6) {
    var _ref6$info = _ref6.info,
        info = _ref6$info === undefined ? {} : _ref6$info,
        data = _ref6.data;
    return (0, _extends14.default)({}, accu, (0, _datasetUtils.createNewDataEntry)({ info: info, data: data }, state.datasets) || {});
  }, {});

  if (!Object.keys(newDateEntries).length) {
    return state;
  }

  var stateWithNewData = (0, _extends14.default)({}, state, {
    datasets: (0, _extends14.default)({}, state.datasets, newDateEntries)
  });

  // previously saved config before data loaded
  var _stateWithNewData$fil = stateWithNewData.filterToBeMerged,
      filterToBeMerged = _stateWithNewData$fil === undefined ? [] : _stateWithNewData$fil,
      _stateWithNewData$lay = stateWithNewData.layerToBeMerged,
      layerToBeMerged = _stateWithNewData$lay === undefined ? [] : _stateWithNewData$lay,
      _stateWithNewData$int = stateWithNewData.interactionToBeMerged,
      interactionToBeMerged = _stateWithNewData$int === undefined ? {} : _stateWithNewData$int;

  // merge state with saved filters

  var mergedState = (0, _visStateMerger.mergeFilters)(stateWithNewData, filterToBeMerged);
  // merge state with saved layers
  mergedState = (0, _visStateMerger.mergeLayers)(mergedState, layerToBeMerged);

  if (mergedState.layers.length === state.layers.length) {
    // no layer merged, find defaults
    mergedState = addDefaultLayers(mergedState, newDateEntries);
  }

  if (mergedState.splitMaps.length) {
    var newLayers = mergedState.layers.filter(function (l) {
      return l.config.dataId in newDateEntries;
    });
    // if map is splited, add new layers to splitMaps
    mergedState = (0, _extends14.default)({}, mergedState, {
      splitMaps: addNewLayersToSplitMap(mergedState.splitMaps, newLayers)
    });
  }

  // merge state with saved interactions
  mergedState = (0, _visStateMerger.mergeInteractions)(mergedState, interactionToBeMerged);

  // if no tooltips merged add default tooltips
  Object.keys(newDateEntries).forEach(function (dataId) {
    var tooltipFields = mergedState.interactionConfig.tooltip.config.fieldsToShow[dataId];
    if (!Array.isArray(tooltipFields) || !tooltipFields.length) {
      mergedState = addDefaultTooltips(mergedState, newDateEntries[dataId]);
    }
  });

  return updateAllLayerDomainData(mergedState, Object.keys(newDateEntries));
};
/* eslint-enable max-statements */

function generateLayerMetaForSplitViews(layer) {
  return {
    isAvailable: layer.config.isVisible,
    isVisible: layer.config.isVisible
  };
}

/**
 * This emthod will compute the default maps custom list
 * based on the current layers status
 * @param layers
 * @returns {[*,*]}
 */
function computeSplitMapLayers(layers) {
  var mapLayers = layers.reduce(function (newLayers, currentLayer) {
    return (0, _extends14.default)({}, newLayers, (0, _defineProperty3.default)({}, currentLayer.id, generateLayerMetaForSplitViews(currentLayer)));
  }, {});
  return [{
    layers: mapLayers
  }, {
    layers: mapLayers
  }];
}

/**
 * Remove an existing layers from custom map layer objects
 * @param state
 * @param layer
 * @returns {[*,*]} Maps of custom layer objects
 */
function removeLayerFromSplitMaps(state, layer) {
  return state.splitMaps.map(function (settings) {
    var layers = settings.layers;
    /* eslint-disable no-unused-vars */

    var _ = layers[layer.id],
        newLayers = (0, _objectWithoutProperties3.default)(layers, [layer.id]);
    /* eslint-enable no-unused-vars */

    return (0, _extends14.default)({}, settings, {
      layers: newLayers
    });
  });
}

/**
 * Add new layers to both existing maps
 * @param splitMaps
 * @param layers
 * @returns {[*,*]} new splitMaps
 */
function addNewLayersToSplitMap(splitMaps, layers) {
  var newLayers = Array.isArray(layers) ? layers : [layers];

  if (!splitMaps || !splitMaps.length || !newLayers.length) {
    return splitMaps;
  }

  // add new layer to both maps,
  //  don't override, if layer.id is already in splitMaps.settings.layers
  return splitMaps.map(function (settings) {
    return (0, _extends14.default)({}, settings, {
      layers: (0, _extends14.default)({}, settings.layers, newLayers.reduce(function (accu, newLayer) {
        return newLayer.config.isVisible ? (0, _extends14.default)({}, accu, (0, _defineProperty3.default)({}, newLayer.id, settings.layers[newLayer.id] ? settings.layers[newLayer.id] : generateLayerMetaForSplitViews(newLayer))) : accu;
      }, {}))
    });
  });
}

/**
 * Hide an existing layers from custom map layer objects
 * @param state
 * @param layer
 * @returns {[*,*]} Maps of custom layer objects
 */
function toggleLayerFromSplitMaps(state, layer) {
  return state.splitMaps.map(function (settings) {
    var layers = settings.layers;

    var newLayers = (0, _extends14.default)({}, layers, (0, _defineProperty3.default)({}, layer.id, generateLayerMetaForSplitViews(layer)));

    return (0, _extends14.default)({}, settings, {
      layers: newLayers
    });
  });
}

/**
 * When a user clicks on the specific map closing icon
 * the application will close the selected map
 * and will merge the remaining one with the global state
 * TODO: i think in the future this action should be called merge map layers with global settings
 * @param state
 * @param action
 * @returns {*}
 */
function closeSpecificMapAtIndex(state, action) {
  // retrieve layers meta data from the remaining map that we need to keep
  var indexToRetrieve = 1 - action.payload;

  var metaSettings = state.splitMaps[indexToRetrieve];
  if (!metaSettings || !metaSettings.layers) {
    // if we can't find the meta settings we simply clean up splitMaps and
    // keep global state as it is
    // but why does this ever happen?
    return (0, _extends14.default)({}, state, {
      splitMaps: []
    });
  }

  var layers = state.layers;

  // update layer visibility

  var newLayers = layers.map(function (layer) {
    return layer.updateLayerConfig({
      isVisible: metaSettings.layers[layer.id] ? metaSettings.layers[layer.id].isVisible : layer.config.isVisible
    });
  });

  // delete map
  return (0, _extends14.default)({}, state, {
    layers: newLayers,
    splitMaps: []
  });
}

// TODO: redo write handler to not use tasks
var loadFilesUpdater = exports.loadFilesUpdater = function loadFilesUpdater(state, action) {
  var files = action.files;


  var filesToLoad = files.map(function (fileBlob) {
    return {
      fileBlob: fileBlob,
      info: {
        id: (0, _utils.generateHashId)(4),
        label: fileBlob.name,
        size: fileBlob.size
      },
      handler: (0, _fileHandler.getFileHandler)(fileBlob)
    };
  });

  // reader -> parser -> augment -> receiveVisData
  var loadFileTasks = [_reactPalm.Task.all(filesToLoad.map(_tasks2.LOAD_FILE_TASK)).bimap(function (results) {
    var data = results.reduce(function (f, c) {
      return {
        // using concat here because the current datasets could be an array or a single item
        datasets: f.datasets.concat(c.datasets),
        // we need to deep merge this thing unless we find a better solution
        // this case will only happen if we allow to load multiple keplergl json files
        config: (0, _extends14.default)({}, f.config, c.config || {})
      };
    }, { datasets: [], config: {}, options: { centerMap: true } });
    return (0, _actions.addDataToMap)(data);
  }, function (error) {
    return (0, _visStateActions.loadFilesErr)(error);
  })];

  return (0, _reactPalm.withTask)((0, _extends14.default)({}, state, {
    fileLoading: true
  }), loadFileTasks);
};

var loadFilesErrUpdater = exports.loadFilesErrUpdater = function loadFilesErrUpdater(state, _ref7) {
  var error = _ref7.error;
  return (0, _extends14.default)({}, state, {
    fileLoading: false,
    fileLoadingErr: error
  });
};

/**
 * helper function to update All layer domain and layer data of state
 *
 * @param {object} state
 * @param {string} datasets
 * @returns {object} state
 */
function addDefaultLayers(state, datasets) {
  var defaultLayers = Object.values(datasets).reduce(function (accu, dataset) {
    return [].concat((0, _toConsumableArray3.default)(accu), (0, _toConsumableArray3.default)((0, _layerUtils.findDefaultLayer)(dataset, state.layerClasses) || []));
  }, []);
  return (0, _extends14.default)({}, state, {
    layers: [].concat((0, _toConsumableArray3.default)(state.layers), (0, _toConsumableArray3.default)(defaultLayers)),
    layerOrder: [].concat((0, _toConsumableArray3.default)(defaultLayers.map(function (_, i) {
      return state.layers.length + i;
    })), (0, _toConsumableArray3.default)(state.layerOrder))
  });
}

/**
 * helper function to find default tooltips
 *
 * @param {object} state
 * @param {object} dataset
 * @returns {object} state
 */
function addDefaultTooltips(state, dataset) {
  var tooltipFields = (0, _interactionUtils.findFieldsToShow)(dataset);

  return (0, _extends14.default)({}, state, {
    interactionConfig: (0, _extends14.default)({}, state.interactionConfig, {
      tooltip: (0, _extends14.default)({}, state.interactionConfig.tooltip, {
        config: {
          // find default fields to show in tooltip
          fieldsToShow: (0, _extends14.default)({}, state.interactionConfig.tooltip.config.fieldsToShow, tooltipFields)
        }
      })
    })
  });
}

/**
 * helper function to update layer domains for an array of datsets
 *
 * @param {object} state
 * @param {array | string} dataId
 * @param {object} newFilter - if is called by setFilter, the filter that has changed
 * @returns {object} state
 */
function updateAllLayerDomainData(state, dataId, newFilter) {
  var dataIds = typeof dataId === 'string' ? [dataId] : dataId;
  var newLayers = [];
  var newLayerDatas = [];

  state.layers.forEach(function (oldLayer, i) {
    if (oldLayer.config.dataId && dataIds.includes(oldLayer.config.dataId)) {
      // No need to recalculate layer domain if filter has fixed domain
      var newLayer = newFilter && newFilter.fixedDomain ? oldLayer : oldLayer.updateLayerDomain(state.datasets[oldLayer.config.dataId], newFilter);

      var _calculateLayerData5 = (0, _layerUtils.calculateLayerData)(newLayer, state, state.layerData[i]),
          layerData = _calculateLayerData5.layerData,
          layer = _calculateLayerData5.layer;

      newLayers.push(layer);
      newLayerDatas.push(layerData);
    } else {
      newLayers.push(oldLayer);
      newLayerDatas.push(state.layerData[i]);
    }
  });

  return (0, _extends14.default)({}, state, {
    layers: newLayers,
    layerData: newLayerDatas
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWR1Y2Vycy92aXMtc3RhdGUtdXBkYXRlcnMuanMiXSwibmFtZXMiOlsibGF5ZXJDb25maWdDaGFuZ2VVcGRhdGVyIiwibGF5ZXJUeXBlQ2hhbmdlVXBkYXRlciIsImxheWVyVmlzdWFsQ2hhbm5lbENoYW5nZVVwZGF0ZXIiLCJsYXllclZpc0NvbmZpZ0NoYW5nZVVwZGF0ZXIiLCJpbnRlcmFjdGlvbkNvbmZpZ0NoYW5nZVVwZGF0ZXIiLCJzZXRGaWx0ZXJVcGRhdGVyIiwiYWRkRGVmYXVsdExheWVycyIsImFkZERlZmF1bHRUb29sdGlwcyIsInVwZGF0ZUFsbExheWVyRG9tYWluRGF0YSIsIklOSVRJQUxfVklTX1NUQVRFIiwibGF5ZXJzIiwibGF5ZXJEYXRhIiwibGF5ZXJUb0JlTWVyZ2VkIiwibGF5ZXJPcmRlciIsImZpbHRlcnMiLCJmaWx0ZXJUb0JlTWVyZ2VkIiwiZGF0YXNldHMiLCJlZGl0aW5nRGF0YXNldCIsInVuZGVmaW5lZCIsImludGVyYWN0aW9uQ29uZmlnIiwiaW50ZXJhY3Rpb25Ub0JlTWVyZ2VkIiwibGF5ZXJCbGVuZGluZyIsImhvdmVySW5mbyIsImNsaWNrZWQiLCJmaWxlTG9hZGluZyIsImZpbGVMb2FkaW5nRXJyIiwic3BsaXRNYXBzIiwibGF5ZXJDbGFzc2VzIiwiTGF5ZXJDbGFzc2VzIiwidXBkYXRlU3RhdGVXaXRoTGF5ZXJBbmREYXRhIiwic3RhdGUiLCJsYXllciIsImlkeCIsIm1hcCIsImx5ciIsImkiLCJkIiwiYWN0aW9uIiwib2xkTGF5ZXIiLCJmaW5kSW5kZXgiLCJsIiwiaWQiLCJwcm9wcyIsIk9iamVjdCIsImtleXMiLCJuZXdDb25maWciLCJuZXdMYXllciIsInVwZGF0ZUxheWVyQ29uZmlnIiwic2hvdWxkQ2FsY3VsYXRlTGF5ZXJEYXRhIiwib2xkTGF5ZXJEYXRhIiwic2FtZURhdGEiLCJuZXdTdGF0ZSIsInRvZ2dsZUxheWVyRnJvbVNwbGl0TWFwcyIsIm5ld1R5cGUiLCJvbGRJZCIsIkNvbnNvbGUiLCJlcnJvciIsImFzc2lnbkNvbmZpZ1RvTGF5ZXIiLCJjb25maWciLCJ2aXNDb25maWdTZXR0aW5ncyIsImRhdGFJZCIsImRhdGFzZXQiLCJ1cGRhdGVMYXllckRvbWFpbiIsInNldHRpbmdzIiwib2xkTGF5ZXJNYXAiLCJvdGhlckxheWVycyIsImNoYW5uZWwiLCJ1cGRhdGVMYXllclZpc3VhbENoYW5uZWwiLCJuZXdWaXNDb25maWciLCJ2aXNDb25maWciLCJlbmFibGVkIiwiZm9yRWFjaCIsImsiLCJwcm9wIiwidmFsdWUiLCJuZXdGaWx0ZXIiLCJmaWVsZHMiLCJhbGxEYXRhIiwiZmllbGRJZHgiLCJmIiwibmFtZSIsImZpZWxkIiwiZmlsdGVyUHJvcCIsImZyZWV6ZSIsImVubGFyZ2VkRmlsdGVySWR4IiwiZW5sYXJnZWQiLCJzZXRGaWx0ZXJQbG90VXBkYXRlciIsIm5ld1Byb3AiLCJwbG90VHlwZSIsImFkZEZpbHRlclVwZGF0ZXIiLCJ0b2dnbGVGaWx0ZXJBbmltYXRpb25VcGRhdGVyIiwiaXNBbmltYXRpbmciLCJ1cGRhdGVBbmltYXRpb25TcGVlZFVwZGF0ZXIiLCJzcGVlZCIsImVubGFyZ2VGaWx0ZXJVcGRhdGVyIiwiaXNFbmxhcmdlZCIsInJlbW92ZUZpbHRlclVwZGF0ZXIiLCJuZXdGaWx0ZXJzIiwic2xpY2UiLCJsZW5ndGgiLCJhZGRMYXllclVwZGF0ZXIiLCJkZWZhdWx0RGF0YXNldCIsIkxheWVyIiwiaXNWaXNpYmxlIiwiaXNDb25maWdBY3RpdmUiLCJhZGROZXdMYXllcnNUb1NwbGl0TWFwIiwicmVtb3ZlTGF5ZXJVcGRhdGVyIiwibGF5ZXJUb1JlbW92ZSIsIm5ld01hcHMiLCJyZW1vdmVMYXllckZyb21TcGxpdE1hcHMiLCJmaWx0ZXIiLCJwaWQiLCJpc0xheWVySG92ZXJlZCIsInJlb3JkZXJMYXllclVwZGF0ZXIiLCJvcmRlciIsInJlbW92ZURhdGFzZXRVcGRhdGVyIiwiZGF0YXNldEtleSIsImtleSIsIm5ld0RhdGFzZXRzIiwiaW5kZXhlcyIsInJlZHVjZSIsImxpc3RPZkluZGV4ZXMiLCJpbmRleCIsInB1c2giLCJjdXJyZW50U3RhdGUiLCJpbmRleENvdW50ZXIiLCJjdXJyZW50SW5kZXgiLCJ0b29sdGlwIiwiZmllbGRzVG9TaG93IiwidXBkYXRlTGF5ZXJCbGVuZGluZ1VwZGF0ZXIiLCJtb2RlIiwic2hvd0RhdGFzZXRUYWJsZVVwZGF0ZXIiLCJyZXNldE1hcENvbmZpZ1Zpc1N0YXRlVXBkYXRlciIsImluaXRpYWxTdGF0ZSIsInJlY2VpdmVNYXBDb25maWdVcGRhdGVyIiwicGF5bG9hZCIsInZpc1N0YXRlIiwicmVzZXRTdGF0ZSIsIm1lcmdlZFN0YXRlIiwibGF5ZXJIb3ZlclVwZGF0ZXIiLCJpbmZvIiwibGF5ZXJDbGlja1VwZGF0ZXIiLCJwaWNrZWQiLCJtYXBDbGlja1VwZGF0ZXIiLCJ0b2dnbGVTcGxpdE1hcFVwZGF0ZXIiLCJjb21wdXRlU3BsaXRNYXBMYXllcnMiLCJjbG9zZVNwZWNpZmljTWFwQXRJbmRleCIsInNldFZpc2libGVMYXllcnNGb3JNYXBVcGRhdGVyIiwibWFwSW5kZXgiLCJsYXllcklkcyIsIm5ld0xheWVycyIsImN1cnJlbnRMYXllcnMiLCJpbmNsdWRlcyIsInRvZ2dsZUxheWVyRm9yTWFwVXBkYXRlciIsIm1hcFNldHRpbmdzIiwibGF5ZXJJZCIsIm5ld1NwbGl0TWFwcyIsInVwZGF0ZVZpc0RhdGFVcGRhdGVyIiwiQXJyYXkiLCJpc0FycmF5IiwibmV3RGF0ZUVudHJpZXMiLCJhY2N1IiwiZGF0YSIsInN0YXRlV2l0aE5ld0RhdGEiLCJ0b29sdGlwRmllbGRzIiwiZ2VuZXJhdGVMYXllck1ldGFGb3JTcGxpdFZpZXdzIiwiaXNBdmFpbGFibGUiLCJtYXBMYXllcnMiLCJjdXJyZW50TGF5ZXIiLCJfIiwiaW5kZXhUb1JldHJpZXZlIiwibWV0YVNldHRpbmdzIiwibG9hZEZpbGVzVXBkYXRlciIsImZpbGVzIiwiZmlsZXNUb0xvYWQiLCJmaWxlQmxvYiIsImxhYmVsIiwic2l6ZSIsImhhbmRsZXIiLCJsb2FkRmlsZVRhc2tzIiwiVGFzayIsImFsbCIsIkxPQURfRklMRV9UQVNLIiwiYmltYXAiLCJyZXN1bHRzIiwiYyIsImNvbmNhdCIsIm9wdGlvbnMiLCJjZW50ZXJNYXAiLCJsb2FkRmlsZXNFcnJVcGRhdGVyIiwiZGVmYXVsdExheWVycyIsInZhbHVlcyIsImRhdGFJZHMiLCJuZXdMYXllckRhdGFzIiwiZml4ZWREb21haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBMkhnQkEsd0IsR0FBQUEsd0I7UUE0QkFDLHNCLEdBQUFBLHNCO1FBOENBQywrQixHQUFBQSwrQjtRQWlCQUMsMkIsR0FBQUEsMkI7UUE0QkFDLDhCLEdBQUFBLDhCO1FBdUJBQyxnQixHQUFBQSxnQjtRQTRzQkFDLGdCLEdBQUFBLGdCO1FBMEJBQyxrQixHQUFBQSxrQjtRQTZCQUMsd0IsR0FBQUEsd0I7O0FBeC9CaEI7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBR0E7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBRUE7O0FBT0E7O0FBRUE7O0FBS0E7O0FBRUE7O0FBT0E7Ozs7QUFFQTtBQUNBOzs7QUFyQ0E7QUFzQ0E7O0FBL0JBOzs7QUFKQTtBQTNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE4Q08sSUFBTUMsZ0RBQW9CO0FBQy9CO0FBQ0FDLFVBQVEsRUFGdUI7QUFHL0JDLGFBQVcsRUFIb0I7QUFJL0JDLG1CQUFpQixFQUpjO0FBSy9CQyxjQUFZLEVBTG1COztBQU8vQjtBQUNBQyxXQUFTLEVBUnNCO0FBUy9CQyxvQkFBa0IsRUFUYTs7QUFXL0I7QUFDQUMsWUFBVSxFQVpxQjtBQWEvQkMsa0JBQWdCQyxTQWJlOztBQWUvQkMscUJBQW1CLDhDQWZZO0FBZ0IvQkMseUJBQXVCRixTQWhCUTs7QUFrQi9CRyxpQkFBZSxRQWxCZ0I7QUFtQi9CQyxhQUFXSixTQW5Cb0I7QUFvQi9CSyxXQUFTTCxTQXBCc0I7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RnlCLEVBR3pCQSxNQUFNbkIsU0FBTixDQUFnQndCLENBQWhCLENBSHlCLENBVjJDO0FBQUEsVUFVL0R4QixTQVYrRCx3QkFVL0RBLFNBVitEO0FBQUEsVUFVcERvQixLQVZvRCx3QkFVcERBLEtBVm9EOztBQWdCdEV1SCxnQkFBVTNCLElBQVYsQ0FBZTVGLEtBQWY7QUFDQWtLLG9CQUFjdEUsSUFBZCxDQUFtQmhILFNBQW5CO0FBQ0QsS0FsQkQsTUFrQk87QUFDTDJJLGdCQUFVM0IsSUFBVixDQUFlckYsUUFBZjtBQUNBMkosb0JBQWN0RSxJQUFkLENBQW1CN0YsTUFBTW5CLFNBQU4sQ0FBZ0J3QixDQUFoQixDQUFuQjtBQUNEO0FBQ0YsR0F2QkQ7O0FBeUJBLHFDQUNLTCxLQURMO0FBRUVwQixZQUFRNEksU0FGVjtBQUdFM0ksZUFBV3NMO0FBSGI7QUFLRCIsImZpbGUiOiJ2aXMtc3RhdGUtdXBkYXRlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTggVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge2NvbnNvbGUgYXMgQ29uc29sZX0gZnJvbSAnZ2xvYmFsL3dpbmRvdyc7XG5pbXBvcnQge1Rhc2ssIHdpdGhUYXNrfSBmcm9tICdyZWFjdC1wYWxtJztcbmltcG9ydCB7ZGlzYWJsZVN0YWNrQ2FwdHVyaW5nfSBmcm9tICdyZWFjdC1wYWxtL3Rhc2tzJztcblxuLy8gVGFza3NcbmltcG9ydCB7TE9BRF9GSUxFX1RBU0t9IGZyb20gJ3Rhc2tzL3Rhc2tzJztcblxuLy8gQWN0aW9uc1xuaW1wb3J0IHtsb2FkRmlsZXNFcnJ9IGZyb20gJ2FjdGlvbnMvdmlzLXN0YXRlLWFjdGlvbnMnO1xuaW1wb3J0IHthZGREYXRhVG9NYXB9IGZyb20gJ2FjdGlvbnMnO1xuXG4vLyBVdGlsc1xuaW1wb3J0IHtnZXREZWZhdWx0SW50ZXJhY3Rpb259IGZyb20gJ3V0aWxzL2ludGVyYWN0aW9uLXV0aWxzJztcbmltcG9ydCB7Z2VuZXJhdGVIYXNoSWR9IGZyb20gJ3V0aWxzL3V0aWxzJztcbmltcG9ydCB7ZmluZEZpZWxkc1RvU2hvd30gZnJvbSAndXRpbHMvaW50ZXJhY3Rpb24tdXRpbHMnO1xuaW1wb3J0IHtcbiAgZ2V0RGVmYXVsdEZpbHRlcixcbiAgZ2V0RmlsdGVyUHJvcHMsXG4gIGdldEZpbHRlclBsb3QsXG4gIGdldERlZmF1bHRGaWx0ZXJQbG90VHlwZSxcbiAgZmlsdGVyRGF0YVxufSBmcm9tICd1dGlscy9maWx0ZXItdXRpbHMnO1xuaW1wb3J0IHtjcmVhdGVOZXdEYXRhRW50cnl9IGZyb20gJ3V0aWxzL2RhdGFzZXQtdXRpbHMnO1xuXG5pbXBvcnQge1xuICBmaW5kRGVmYXVsdExheWVyLFxuICBjYWxjdWxhdGVMYXllckRhdGFcbn0gZnJvbSAndXRpbHMvbGF5ZXItdXRpbHMvbGF5ZXItdXRpbHMnO1xuXG5pbXBvcnQge2dldEZpbGVIYW5kbGVyfSBmcm9tICdwcm9jZXNzb3JzL2ZpbGUtaGFuZGxlcic7XG5cbmltcG9ydCB7XG4gIG1lcmdlRmlsdGVycyxcbiAgbWVyZ2VMYXllcnMsXG4gIG1lcmdlSW50ZXJhY3Rpb25zLFxuICBtZXJnZUxheWVyQmxlbmRpbmdcbn0gZnJvbSAnLi92aXMtc3RhdGUtbWVyZ2VyJztcblxuaW1wb3J0IHtMYXllckNsYXNzZXMsIExheWVyfSBmcm9tICdsYXllcnMnO1xuXG4vLyByZWFjdC1wYWxtXG4vLyBkaXNhYmxlIGNhcHR1cmUgZXhjZXB0aW9uIGZvciByZWFjdC1wYWxtIGNhbGwgdG8gd2l0aFRhc2tzXG5kaXNhYmxlU3RhY2tDYXB0dXJpbmcoKTtcblxuZXhwb3J0IGNvbnN0IElOSVRJQUxfVklTX1NUQVRFID0ge1xuICAvLyBsYXllcnNcbiAgbGF5ZXJzOiBbXSxcbiAgbGF5ZXJEYXRhOiBbXSxcbiAgbGF5ZXJUb0JlTWVyZ2VkOiBbXSxcbiAgbGF5ZXJPcmRlcjogW10sXG5cbiAgLy8gZmlsdGVyc1xuICBmaWx0ZXJzOiBbXSxcbiAgZmlsdGVyVG9CZU1lcmdlZDogW10sXG5cbiAgLy8gYSBjb2xsZWN0aW9uIG9mIG11bHRpcGxlIGRhdGFzZXRcbiAgZGF0YXNldHM6IHt9LFxuICBlZGl0aW5nRGF0YXNldDogdW5kZWZpbmVkLFxuXG4gIGludGVyYWN0aW9uQ29uZmlnOiBnZXREZWZhdWx0SW50ZXJhY3Rpb24oKSxcbiAgaW50ZXJhY3Rpb25Ub0JlTWVyZ2VkOiB1bmRlZmluZWQsXG5cbiAgbGF5ZXJCbGVuZGluZzogJ25vcm1hbCcsXG4gIGhvdmVySW5mbzogdW5kZWZpbmVkLFxuICBjbGlja2VkOiB1bmRlZmluZWQsXG5cbiAgZmlsZUxvYWRpbmc6IGZhbHNlLFxuICBmaWxlTG9hZGluZ0VycjogbnVsbCxcblxuICAvLyB0aGlzIGlzIHVzZWQgd2hlbiB1c2VyIHNwbGl0IG1hcHNcbiAgc3BsaXRNYXBzOiBbXG4gICAgLy8gdGhpcyB3aWxsIGNvbnRhaW4gYSBsaXN0IG9mIG9iamVjdHMgdG9cbiAgICAvLyBkZXNjcmliZSB0aGUgc3RhdGUgb2YgbGF5ZXIgYXZhaWxhYmlsaXR5IGFuZCB2aXNpYmlsaXR5IGZvciBlYWNoIG1hcFxuICAgIC8vIFtcbiAgICAvLyAgIHtcbiAgICAvLyAgICAgbGF5ZXJzOiB7XG4gICAgLy8gICAgICAgbGF5ZXJfaWQ6IHtcbiAgICAvLyAgICAgICAgIGlzQXZhaWxhYmxlOiB0cnVlfGZhbHNlICMgdGhpcyBpcyBkcml2ZW4gYnkgdGhlIGxlZnQgaGFuZCBwYW5lbFxuICAgIC8vICAgICAgICAgaXNWaXNpYmxlOiB0cnVlfGZhbHNlXG4gICAgLy8gICAgICAgfVxuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy8gXVxuICBdLFxuXG4gIC8vIGRlZmF1bHRzIGxheWVyIGNsYXNzZXNcbiAgbGF5ZXJDbGFzc2VzOiBMYXllckNsYXNzZXNcbn07XG5cbmZ1bmN0aW9uIHVwZGF0ZVN0YXRlV2l0aExheWVyQW5kRGF0YShzdGF0ZSwge2xheWVyRGF0YSwgbGF5ZXIsIGlkeH0pIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBsYXllcnM6IHN0YXRlLmxheWVycy5tYXAoKGx5ciwgaSkgPT4gKGkgPT09IGlkeCA/IGxheWVyIDogbHlyKSksXG4gICAgbGF5ZXJEYXRhOiBsYXllckRhdGFcbiAgICAgID8gc3RhdGUubGF5ZXJEYXRhLm1hcCgoZCwgaSkgPT4gKGkgPT09IGlkeCA/IGxheWVyRGF0YSA6IGQpKVxuICAgICAgOiBzdGF0ZS5sYXllckRhdGFcbiAgfTtcbn1cblxuLyoqXG4gKiBDYWxsZWQgdG8gdXBkYXRlIGxheWVyIGJhc2UgY29uZmlnOiBkYXRhSWQsIGxhYmVsLCBjb2x1bW4sIGlzVmlzaWJsZVxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxheWVyQ29uZmlnQ2hhbmdlVXBkYXRlcihzdGF0ZSwgYWN0aW9uKSB7XG4gIGNvbnN0IHtvbGRMYXllcn0gPSBhY3Rpb247XG4gIGNvbnN0IGlkeCA9IHN0YXRlLmxheWVycy5maW5kSW5kZXgobCA9PiBsLmlkID09PSBvbGRMYXllci5pZCk7XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmtleXMoYWN0aW9uLm5ld0NvbmZpZyk7XG5cbiAgY29uc3QgbmV3TGF5ZXIgPSBvbGRMYXllci51cGRhdGVMYXllckNvbmZpZyhhY3Rpb24ubmV3Q29uZmlnKTtcbiAgaWYgKG5ld0xheWVyLnNob3VsZENhbGN1bGF0ZUxheWVyRGF0YShwcm9wcykpIHtcbiAgICBjb25zdCBvbGRMYXllckRhdGEgPSBzdGF0ZS5sYXllckRhdGFbaWR4XTtcbiAgICBjb25zdCB7bGF5ZXJEYXRhLCBsYXllcn0gPSBjYWxjdWxhdGVMYXllckRhdGEoXG4gICAgICBuZXdMYXllcixcbiAgICAgIHN0YXRlLFxuICAgICAgb2xkTGF5ZXJEYXRhLFxuICAgICAge3NhbWVEYXRhOiB0cnVlfVxuICAgICk7XG4gICAgcmV0dXJuIHVwZGF0ZVN0YXRlV2l0aExheWVyQW5kRGF0YShzdGF0ZSwge2xheWVyRGF0YSwgbGF5ZXIsIGlkeH0pO1xuICB9XG5cbiAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgLi4uc3RhdGUsXG4gICAgc3BsaXRNYXBzOlxuICAgICAgJ2lzVmlzaWJsZScgaW4gYWN0aW9uLm5ld0NvbmZpZ1xuICAgICAgICA/IHRvZ2dsZUxheWVyRnJvbVNwbGl0TWFwcyhzdGF0ZSwgbmV3TGF5ZXIpXG4gICAgICAgIDogc3RhdGUuc3BsaXRNYXBzXG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZVN0YXRlV2l0aExheWVyQW5kRGF0YShuZXdTdGF0ZSwge2xheWVyOiBuZXdMYXllciwgaWR4fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsYXllclR5cGVDaGFuZ2VVcGRhdGVyKHN0YXRlLCBhY3Rpb24pIHtcbiAgY29uc3Qge29sZExheWVyLCBuZXdUeXBlfSA9IGFjdGlvbjtcbiAgY29uc3Qgb2xkSWQgPSBvbGRMYXllci5pZDtcbiAgY29uc3QgaWR4ID0gc3RhdGUubGF5ZXJzLmZpbmRJbmRleChsID0+IGwuaWQgPT09IG9sZElkKTtcblxuICBpZiAoIXN0YXRlLmxheWVyQ2xhc3Nlc1tuZXdUeXBlXSkge1xuICAgIENvbnNvbGUuZXJyb3IoYCR7bmV3VHlwZX0gaXMgbm90IGEgdmFsaWQgbGF5ZXIgdHlwZWApO1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIC8vIGdldCBhIG1pbnQgbGF5ZXIsIHdpdGggbmV3IGlkIGFuZCB0eXBlXG4gIC8vIGJlY2F1c2UgZGVjay5nbCB1c2VzIGlkIHRvIG1hdGNoIGJldHdlZW4gbmV3IGFuZCBvbGQgbGF5ZXIuXG4gIC8vIElmIHR5cGUgaGFzIGNoYW5nZWQgYnV0IGlkIGlzIHRoZSBzYW1lLCBpdCB3aWxsIGJyZWFrXG4gIGNvbnN0IG5ld0xheWVyID0gbmV3IHN0YXRlLmxheWVyQ2xhc3Nlc1tuZXdUeXBlXSgpO1xuXG4gIG5ld0xheWVyLmFzc2lnbkNvbmZpZ1RvTGF5ZXIob2xkTGF5ZXIuY29uZmlnLCBvbGRMYXllci52aXNDb25maWdTZXR0aW5ncyk7XG5cbiAgaWYgKG5ld0xheWVyLmNvbmZpZy5kYXRhSWQpIHtcbiAgICBjb25zdCBkYXRhc2V0ID0gc3RhdGUuZGF0YXNldHNbbmV3TGF5ZXIuY29uZmlnLmRhdGFJZF07XG4gICAgbmV3TGF5ZXIudXBkYXRlTGF5ZXJEb21haW4oZGF0YXNldCk7XG4gIH1cblxuICBjb25zdCB7bGF5ZXJEYXRhLCBsYXllcn0gPSBjYWxjdWxhdGVMYXllckRhdGEobmV3TGF5ZXIsIHN0YXRlKTtcblxuICBsZXQgbmV3U3RhdGUgPSBzdGF0ZTtcblxuICAvLyB1cGRhdGUgc3BsaXRNYXAgbGF5ZXIgaWRcbiAgaWYgKHN0YXRlLnNwbGl0TWFwcykge1xuICAgIG5ld1N0YXRlID0ge1xuICAgICAgLi4uc3RhdGUsXG4gICAgICBzcGxpdE1hcHM6IHN0YXRlLnNwbGl0TWFwcy5tYXAoc2V0dGluZ3MgPT4ge1xuICAgICAgICBjb25zdCB7W29sZElkXTogb2xkTGF5ZXJNYXAsIC4uLm90aGVyTGF5ZXJzfSA9IHNldHRpbmdzLmxheWVycztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5zZXR0aW5ncyxcbiAgICAgICAgICBsYXllcnM6IHtcbiAgICAgICAgICAgIC4uLm90aGVyTGF5ZXJzLFxuICAgICAgICAgICAgW2xheWVyLmlkXTogb2xkTGF5ZXJNYXBcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KVxuICAgIH07XG4gIH1cblxuICByZXR1cm4gdXBkYXRlU3RhdGVXaXRoTGF5ZXJBbmREYXRhKG5ld1N0YXRlLCB7bGF5ZXJEYXRhLCBsYXllciwgaWR4fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsYXllclZpc3VhbENoYW5uZWxDaGFuZ2VVcGRhdGVyKHN0YXRlLCBhY3Rpb24pIHtcbiAgY29uc3Qge29sZExheWVyLCBuZXdDb25maWcsIGNoYW5uZWx9ID0gYWN0aW9uO1xuICBjb25zdCBkYXRhc2V0ID0gc3RhdGUuZGF0YXNldHNbb2xkTGF5ZXIuY29uZmlnLmRhdGFJZF07XG5cbiAgY29uc3QgaWR4ID0gc3RhdGUubGF5ZXJzLmZpbmRJbmRleChsID0+IGwuaWQgPT09IG9sZExheWVyLmlkKTtcbiAgY29uc3QgbmV3TGF5ZXIgPSBvbGRMYXllci51cGRhdGVMYXllckNvbmZpZyhuZXdDb25maWcpO1xuXG4gIG5ld0xheWVyLnVwZGF0ZUxheWVyVmlzdWFsQ2hhbm5lbChkYXRhc2V0LCBjaGFubmVsKTtcblxuICBjb25zdCBvbGRMYXllckRhdGEgPSBzdGF0ZS5sYXllckRhdGFbaWR4XTtcbiAgY29uc3Qge2xheWVyRGF0YSwgbGF5ZXJ9ID0gY2FsY3VsYXRlTGF5ZXJEYXRhKG5ld0xheWVyLCBzdGF0ZSwgb2xkTGF5ZXJEYXRhLCB7XG4gICAgc2FtZURhdGE6IHRydWVcbiAgfSk7XG5cbiAgcmV0dXJuIHVwZGF0ZVN0YXRlV2l0aExheWVyQW5kRGF0YShzdGF0ZSwge2xheWVyRGF0YSwgbGF5ZXIsIGlkeH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGF5ZXJWaXNDb25maWdDaGFuZ2VVcGRhdGVyKHN0YXRlLCBhY3Rpb24pIHtcbiAgY29uc3Qge29sZExheWVyfSA9IGFjdGlvbjtcbiAgY29uc3QgaWR4ID0gc3RhdGUubGF5ZXJzLmZpbmRJbmRleChsID0+IGwuaWQgPT09IG9sZExheWVyLmlkKTtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3Qua2V5cyhhY3Rpb24ubmV3VmlzQ29uZmlnKTtcblxuICBjb25zdCBuZXdWaXNDb25maWcgPSB7XG4gICAgLi4ub2xkTGF5ZXIuY29uZmlnLnZpc0NvbmZpZyxcbiAgICAuLi5hY3Rpb24ubmV3VmlzQ29uZmlnXG4gIH07XG5cbiAgY29uc3QgbmV3TGF5ZXIgPSBvbGRMYXllci51cGRhdGVMYXllckNvbmZpZyh7dmlzQ29uZmlnOiBuZXdWaXNDb25maWd9KTtcblxuICBpZiAobmV3TGF5ZXIuc2hvdWxkQ2FsY3VsYXRlTGF5ZXJEYXRhKHByb3BzKSkge1xuICAgIGNvbnN0IG9sZExheWVyRGF0YSA9IHN0YXRlLmxheWVyRGF0YVtpZHhdO1xuICAgIGNvbnN0IHtsYXllckRhdGEsIGxheWVyfSA9IGNhbGN1bGF0ZUxheWVyRGF0YShcbiAgICAgIG5ld0xheWVyLFxuICAgICAgc3RhdGUsXG4gICAgICBvbGRMYXllckRhdGEsXG4gICAgICB7c2FtZURhdGE6IHRydWV9XG4gICAgKTtcbiAgICByZXR1cm4gdXBkYXRlU3RhdGVXaXRoTGF5ZXJBbmREYXRhKHN0YXRlLCB7bGF5ZXJEYXRhLCBsYXllciwgaWR4fSk7XG4gIH1cblxuICByZXR1cm4gdXBkYXRlU3RhdGVXaXRoTGF5ZXJBbmREYXRhKHN0YXRlLCB7bGF5ZXI6IG5ld0xheWVyLCBpZHh9KTtcbn1cblxuLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJhY3Rpb25Db25maWdDaGFuZ2VVcGRhdGVyKHN0YXRlLCBhY3Rpb24pIHtcbiAgY29uc3Qge2NvbmZpZ30gPSBhY3Rpb247XG5cbiAgY29uc3QgaW50ZXJhY3Rpb25Db25maWcgPSB7XG4gICAgLi4uc3RhdGUuaW50ZXJhY3Rpb25Db25maWcsXG4gICAgLi4ue1tjb25maWcuaWRdOiBjb25maWd9XG4gIH07XG5cbiAgaWYgKGNvbmZpZy5lbmFibGVkICYmICFzdGF0ZS5pbnRlcmFjdGlvbkNvbmZpZ1tjb25maWcuaWRdLmVuYWJsZWQpIHtcbiAgICAvLyBvbmx5IGVuYWJsZSBvbmUgaW50ZXJhY3Rpb24gYXQgYSB0aW1lXG4gICAgT2JqZWN0LmtleXMoaW50ZXJhY3Rpb25Db25maWcpLmZvckVhY2goayA9PiB7XG4gICAgICBpZiAoayAhPT0gY29uZmlnLmlkKSB7XG4gICAgICAgIGludGVyYWN0aW9uQ29uZmlnW2tdID0gey4uLmludGVyYWN0aW9uQ29uZmlnW2tdLCBlbmFibGVkOiBmYWxzZX07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGludGVyYWN0aW9uQ29uZmlnXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRGaWx0ZXJVcGRhdGVyKHN0YXRlLCBhY3Rpb24pIHtcbiAgY29uc3Qge2lkeCwgcHJvcCwgdmFsdWV9ID0gYWN0aW9uO1xuICBsZXQgbmV3U3RhdGUgPSBzdGF0ZTtcbiAgbGV0IG5ld0ZpbHRlciA9IHtcbiAgICAuLi5zdGF0ZS5maWx0ZXJzW2lkeF0sXG4gICAgW3Byb3BdOiB2YWx1ZVxuICB9O1xuXG4gIGNvbnN0IHtkYXRhSWR9ID0gbmV3RmlsdGVyO1xuICBpZiAoIWRhdGFJZCkge1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuICBjb25zdCB7ZmllbGRzLCBhbGxEYXRhfSA9IHN0YXRlLmRhdGFzZXRzW2RhdGFJZF07XG5cbiAgc3dpdGNoIChwcm9wKSB7XG4gICAgY2FzZSAnZGF0YUlkJzpcbiAgICAgIC8vIGlmIHRyeWluZyB0byB1cGRhdGUgZmlsdGVyIGRhdGFJZC4gY3JlYXRlIGFuIGVtcHR5IG5ldyBmaWx0ZXJcbiAgICAgIG5ld0ZpbHRlciA9IGdldERlZmF1bHRGaWx0ZXIoZGF0YUlkKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbmFtZSc6XG4gICAgICAvLyBmaW5kIHRoZSBmaWVsZFxuICAgICAgY29uc3QgZmllbGRJZHggPSBmaWVsZHMuZmluZEluZGV4KGYgPT4gZi5uYW1lID09PSB2YWx1ZSk7XG4gICAgICBsZXQgZmllbGQgPSBmaWVsZHNbZmllbGRJZHhdO1xuXG4gICAgICBpZiAoIWZpZWxkLmZpbHRlclByb3ApIHtcbiAgICAgICAgLy8gZ2V0IGZpbHRlciBkb21haW4gZnJvbSBmaWVsZFxuICAgICAgICAvLyBzYXZlIGZpbHRlclByb3BzOiB7ZG9tYWluLCBzdGVwcywgdmFsdWV9IHRvIGZpZWxkLCBhdm9pZCByZWNhbGN1bGF0ZVxuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICAuLi5maWVsZCxcbiAgICAgICAgICBmaWx0ZXJQcm9wOiBnZXRGaWx0ZXJQcm9wcyhhbGxEYXRhLCBmaWVsZClcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgbmV3RmlsdGVyID0ge1xuICAgICAgICAuLi5uZXdGaWx0ZXIsXG4gICAgICAgIC4uLmZpZWxkLmZpbHRlclByb3AsXG4gICAgICAgIG5hbWU6IGZpZWxkLm5hbWUsXG4gICAgICAgIC8vIGNhbid0IGVkaXQgZGF0YUlkIG9uY2UgbmFtZSBpcyBzZWxlY3RlZFxuICAgICAgICBmcmVlemU6IHRydWUsXG4gICAgICAgIGZpZWxkSWR4XG4gICAgICB9O1xuICAgICAgY29uc3QgZW5sYXJnZWRGaWx0ZXJJZHggPSBzdGF0ZS5maWx0ZXJzLmZpbmRJbmRleChmID0+IGYuZW5sYXJnZWQpO1xuICAgICAgaWYgKGVubGFyZ2VkRmlsdGVySWR4ID4gLTEgJiYgZW5sYXJnZWRGaWx0ZXJJZHggIT09IGlkeCkge1xuICAgICAgICAvLyB0aGVyZSBzaG91bGQgYmUgb25seSBvbmUgZW5sYXJnZWQgZmlsdGVyXG4gICAgICAgIG5ld0ZpbHRlci5lbmxhcmdlZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBuZXdTdGF0ZSA9IHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIGRhdGFzZXRzOiB7XG4gICAgICAgICAgLi4uc3RhdGUuZGF0YXNldHMsXG4gICAgICAgICAgW2RhdGFJZF06IHtcbiAgICAgICAgICAgIC4uLnN0YXRlLmRhdGFzZXRzW2RhdGFJZF0sXG4gICAgICAgICAgICBmaWVsZHM6IGZpZWxkcy5tYXAoKGQsIGkpID0+IChpID09PSBmaWVsZElkeCA/IGZpZWxkIDogZCkpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndmFsdWUnOlxuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuXG4gIC8vIHNhdmUgbmV3IGZpbHRlcnMgdG8gbmV3U3RhdGVcbiAgbmV3U3RhdGUgPSB7XG4gICAgLi4ubmV3U3RhdGUsXG4gICAgZmlsdGVyczogc3RhdGUuZmlsdGVycy5tYXAoKGYsIGkpID0+IChpID09PSBpZHggPyBuZXdGaWx0ZXIgOiBmKSlcbiAgfTtcblxuICAvLyBmaWx0ZXIgZGF0YVxuICBuZXdTdGF0ZSA9IHtcbiAgICAuLi5uZXdTdGF0ZSxcbiAgICBkYXRhc2V0czoge1xuICAgICAgLi4ubmV3U3RhdGUuZGF0YXNldHMsXG4gICAgICBbZGF0YUlkXToge1xuICAgICAgICAuLi5uZXdTdGF0ZS5kYXRhc2V0c1tkYXRhSWRdLFxuICAgICAgICAuLi5maWx0ZXJEYXRhKGFsbERhdGEsIGRhdGFJZCwgbmV3U3RhdGUuZmlsdGVycylcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgbmV3U3RhdGUgPSB1cGRhdGVBbGxMYXllckRvbWFpbkRhdGEobmV3U3RhdGUsIGRhdGFJZCwgbmV3RmlsdGVyKTtcblxuICByZXR1cm4gbmV3U3RhdGU7XG59XG5cbmV4cG9ydCBjb25zdCBzZXRGaWx0ZXJQbG90VXBkYXRlciA9IChzdGF0ZSwge2lkeCwgbmV3UHJvcH0pID0+IHtcbiAgbGV0IG5ld0ZpbHRlciA9IHsuLi5zdGF0ZS5maWx0ZXJzW2lkeF0sIC4uLm5ld1Byb3B9O1xuICBjb25zdCBwcm9wID0gT2JqZWN0LmtleXMobmV3UHJvcClbMF07XG4gIGlmIChwcm9wID09PSAneUF4aXMnKSB7XG4gICAgY29uc3QgcGxvdFR5cGUgPSBnZXREZWZhdWx0RmlsdGVyUGxvdFR5cGUobmV3RmlsdGVyKTtcblxuICAgIGlmIChwbG90VHlwZSkge1xuICAgICAgbmV3RmlsdGVyID0ge1xuICAgICAgICAuLi5uZXdGaWx0ZXIsXG4gICAgICAgIC4uLmdldEZpbHRlclBsb3QoXG4gICAgICAgICAgey4uLm5ld0ZpbHRlciwgcGxvdFR5cGV9LFxuICAgICAgICAgIHN0YXRlLmRhdGFzZXRzW25ld0ZpbHRlci5kYXRhSWRdLmFsbERhdGFcbiAgICAgICAgKSxcbiAgICAgICAgcGxvdFR5cGVcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBmaWx0ZXJzOiBzdGF0ZS5maWx0ZXJzLm1hcCgoZiwgaSkgPT4gKGkgPT09IGlkeCA/IG5ld0ZpbHRlciA6IGYpKVxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGFkZEZpbHRlclVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT5cbiAgIWFjdGlvbi5kYXRhSWRcbiAgICA/IHN0YXRlXG4gICAgOiB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBmaWx0ZXJzOiBbLi4uc3RhdGUuZmlsdGVycywgZ2V0RGVmYXVsdEZpbHRlcihhY3Rpb24uZGF0YUlkKV1cbiAgICAgIH07XG5cbmV4cG9ydCBjb25zdCB0b2dnbGVGaWx0ZXJBbmltYXRpb25VcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+ICh7XG4gIC4uLnN0YXRlLFxuICBmaWx0ZXJzOiBzdGF0ZS5maWx0ZXJzLm1hcChcbiAgICAoZiwgaSkgPT4gKGkgPT09IGFjdGlvbi5pZHggPyB7Li4uZiwgaXNBbmltYXRpbmc6ICFmLmlzQW5pbWF0aW5nfSA6IGYpXG4gIClcbn0pO1xuXG5leHBvcnQgY29uc3QgdXBkYXRlQW5pbWF0aW9uU3BlZWRVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+ICh7XG4gIC4uLnN0YXRlLFxuICBmaWx0ZXJzOiBzdGF0ZS5maWx0ZXJzLm1hcChcbiAgICAoZiwgaSkgPT4gKGkgPT09IGFjdGlvbi5pZHggPyB7Li4uZiwgc3BlZWQ6IGFjdGlvbi5zcGVlZH0gOiBmKVxuICApXG59KTtcblxuZXhwb3J0IGNvbnN0IGVubGFyZ2VGaWx0ZXJVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3QgaXNFbmxhcmdlZCA9IHN0YXRlLmZpbHRlcnNbYWN0aW9uLmlkeF0uZW5sYXJnZWQ7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBmaWx0ZXJzOiBzdGF0ZS5maWx0ZXJzLm1hcCgoZiwgaSkgPT4ge1xuICAgICAgZi5lbmxhcmdlZCA9ICFpc0VubGFyZ2VkICYmIGkgPT09IGFjdGlvbi5pZHg7XG4gICAgICByZXR1cm4gZjtcbiAgICB9KVxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHJlbW92ZUZpbHRlclVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4ge1xuICBjb25zdCB7aWR4fSA9IGFjdGlvbjtcbiAgY29uc3Qge2RhdGFJZH0gPSBzdGF0ZS5maWx0ZXJzW2lkeF07XG5cbiAgY29uc3QgbmV3RmlsdGVycyA9IFtcbiAgICAuLi5zdGF0ZS5maWx0ZXJzLnNsaWNlKDAsIGlkeCksXG4gICAgLi4uc3RhdGUuZmlsdGVycy5zbGljZShpZHggKyAxLCBzdGF0ZS5maWx0ZXJzLmxlbmd0aClcbiAgXTtcblxuICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAuLi5zdGF0ZSxcbiAgICBkYXRhc2V0czoge1xuICAgICAgLi4uc3RhdGUuZGF0YXNldHMsXG4gICAgICBbZGF0YUlkXToge1xuICAgICAgICAuLi5zdGF0ZS5kYXRhc2V0c1tkYXRhSWRdLFxuICAgICAgICAuLi5maWx0ZXJEYXRhKHN0YXRlLmRhdGFzZXRzW2RhdGFJZF0uYWxsRGF0YSwgZGF0YUlkLCBuZXdGaWx0ZXJzKVxuICAgICAgfVxuICAgIH0sXG4gICAgZmlsdGVyczogbmV3RmlsdGVyc1xuICB9O1xuXG4gIHJldHVybiB1cGRhdGVBbGxMYXllckRvbWFpbkRhdGEobmV3U3RhdGUsIGRhdGFJZCk7XG59O1xuXG5leHBvcnQgY29uc3QgYWRkTGF5ZXJVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3QgZGVmYXVsdERhdGFzZXQgPSBPYmplY3Qua2V5cyhzdGF0ZS5kYXRhc2V0cylbMF07XG4gIGNvbnN0IG5ld0xheWVyID0gbmV3IExheWVyKHtcbiAgICBpc1Zpc2libGU6IHRydWUsXG4gICAgaXNDb25maWdBY3RpdmU6IHRydWUsXG4gICAgZGF0YUlkOiBkZWZhdWx0RGF0YXNldCxcbiAgICAuLi5hY3Rpb24ucHJvcHNcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBsYXllcnM6IFsuLi5zdGF0ZS5sYXllcnMsIG5ld0xheWVyXSxcbiAgICBsYXllckRhdGE6IFsuLi5zdGF0ZS5sYXllckRhdGEsIHt9XSxcbiAgICBsYXllck9yZGVyOiBbLi4uc3RhdGUubGF5ZXJPcmRlciwgc3RhdGUubGF5ZXJPcmRlci5sZW5ndGhdLFxuICAgIHNwbGl0TWFwczogYWRkTmV3TGF5ZXJzVG9TcGxpdE1hcChzdGF0ZS5zcGxpdE1hcHMsIG5ld0xheWVyKVxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHJlbW92ZUxheWVyVXBkYXRlciA9IChzdGF0ZSwge2lkeH0pID0+IHtcbiAgY29uc3Qge2xheWVycywgbGF5ZXJEYXRhLCBjbGlja2VkLCBob3ZlckluZm99ID0gc3RhdGU7XG4gIGNvbnN0IGxheWVyVG9SZW1vdmUgPSBzdGF0ZS5sYXllcnNbaWR4XTtcbiAgY29uc3QgbmV3TWFwcyA9IHJlbW92ZUxheWVyRnJvbVNwbGl0TWFwcyhzdGF0ZSwgbGF5ZXJUb1JlbW92ZSk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBsYXllcnM6IFsuLi5sYXllcnMuc2xpY2UoMCwgaWR4KSwgLi4ubGF5ZXJzLnNsaWNlKGlkeCArIDEsIGxheWVycy5sZW5ndGgpXSxcbiAgICBsYXllckRhdGE6IFtcbiAgICAgIC4uLmxheWVyRGF0YS5zbGljZSgwLCBpZHgpLFxuICAgICAgLi4ubGF5ZXJEYXRhLnNsaWNlKGlkeCArIDEsIGxheWVyRGF0YS5sZW5ndGgpXG4gICAgXSxcbiAgICBsYXllck9yZGVyOiBzdGF0ZS5sYXllck9yZGVyXG4gICAgICAuZmlsdGVyKGkgPT4gaSAhPT0gaWR4KVxuICAgICAgLm1hcChwaWQgPT4gKHBpZCA+IGlkeCA/IHBpZCAtIDEgOiBwaWQpKSxcbiAgICBjbGlja2VkOiBsYXllclRvUmVtb3ZlLmlzTGF5ZXJIb3ZlcmVkKGNsaWNrZWQpID8gdW5kZWZpbmVkIDogY2xpY2tlZCxcbiAgICBob3ZlckluZm86IGxheWVyVG9SZW1vdmUuaXNMYXllckhvdmVyZWQoaG92ZXJJbmZvKSA/IHVuZGVmaW5lZCA6IGhvdmVySW5mbyxcbiAgICBzcGxpdE1hcHM6IG5ld01hcHNcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCByZW9yZGVyTGF5ZXJVcGRhdGVyID0gKHN0YXRlLCB7b3JkZXJ9KSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgbGF5ZXJPcmRlcjogb3JkZXJcbn0pO1xuXG5leHBvcnQgY29uc3QgcmVtb3ZlRGF0YXNldFVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4ge1xuICAvLyBleHRyYWN0IGRhdGFzZXQga2V5XG4gIGNvbnN0IHtrZXk6IGRhdGFzZXRLZXl9ID0gYWN0aW9uO1xuICBjb25zdCB7ZGF0YXNldHN9ID0gc3RhdGU7XG5cbiAgLy8gY2hlY2sgaWYgZGF0YXNldCBpcyBwcmVzZW50XG4gIGlmICghZGF0YXNldHNbZGF0YXNldEtleV0pIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICBjb25zdCB7XG4gICAgbGF5ZXJzLFxuICAgIGRhdGFzZXRzOiB7W2RhdGFzZXRLZXldOiBkYXRhc2V0LCAuLi5uZXdEYXRhc2V0c31cbiAgfSA9IHN0YXRlO1xuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgY29uc3QgaW5kZXhlcyA9IGxheWVycy5yZWR1Y2UoKGxpc3RPZkluZGV4ZXMsIGxheWVyLCBpbmRleCkgPT4ge1xuICAgIGlmIChsYXllci5jb25maWcuZGF0YUlkID09PSBkYXRhc2V0S2V5KSB7XG4gICAgICBsaXN0T2ZJbmRleGVzLnB1c2goaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gbGlzdE9mSW5kZXhlcztcbiAgfSwgW10pO1xuXG4gIC8vIHJlbW92ZSBsYXllcnMgYW5kIGRhdGFzZXRzXG4gIGNvbnN0IHtuZXdTdGF0ZX0gPSBpbmRleGVzLnJlZHVjZShcbiAgICAoe25ld1N0YXRlOiBjdXJyZW50U3RhdGUsIGluZGV4Q291bnRlcn0sIGlkeCkgPT4ge1xuICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gaWR4IC0gaW5kZXhDb3VudGVyO1xuICAgICAgY3VycmVudFN0YXRlID0gcmVtb3ZlTGF5ZXJVcGRhdGVyKGN1cnJlbnRTdGF0ZSwge2lkeDogY3VycmVudEluZGV4fSk7XG4gICAgICBpbmRleENvdW50ZXIrKztcbiAgICAgIHJldHVybiB7bmV3U3RhdGU6IGN1cnJlbnRTdGF0ZSwgaW5kZXhDb3VudGVyfTtcbiAgICB9LFxuICAgIHtuZXdTdGF0ZTogey4uLnN0YXRlLCBkYXRhc2V0czogbmV3RGF0YXNldHN9LCBpbmRleENvdW50ZXI6IDB9XG4gICk7XG5cbiAgLy8gcmVtb3ZlIGZpbHRlcnNcbiAgY29uc3QgZmlsdGVycyA9IHN0YXRlLmZpbHRlcnMuZmlsdGVyKGZpbHRlciA9PiBmaWx0ZXIuZGF0YUlkICE9PSBkYXRhc2V0S2V5KTtcblxuICAvLyB1cGRhdGUgaW50ZXJhY3Rpb25Db25maWdcbiAgbGV0IHtpbnRlcmFjdGlvbkNvbmZpZ30gPSBzdGF0ZTtcbiAgY29uc3Qge3Rvb2x0aXB9ID0gaW50ZXJhY3Rpb25Db25maWc7XG4gIGlmICh0b29sdGlwKSB7XG4gICAgY29uc3Qge2NvbmZpZ30gPSB0b29sdGlwO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgY29uc3Qge1tkYXRhc2V0S2V5XTogZmllbGRzLCAuLi5maWVsZHNUb1Nob3d9ID0gY29uZmlnLmZpZWxkc1RvU2hvdztcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgaW50ZXJhY3Rpb25Db25maWcgPSB7XG4gICAgICAuLi5pbnRlcmFjdGlvbkNvbmZpZyxcbiAgICAgIHRvb2x0aXA6IHsuLi50b29sdGlwLCBjb25maWc6IHsuLi5jb25maWcsIGZpZWxkc1RvU2hvd319XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7Li4ubmV3U3RhdGUsIGZpbHRlcnMsIGludGVyYWN0aW9uQ29uZmlnfTtcbn07XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVMYXllckJsZW5kaW5nVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgbGF5ZXJCbGVuZGluZzogYWN0aW9uLm1vZGVcbn0pO1xuXG5leHBvcnQgY29uc3Qgc2hvd0RhdGFzZXRUYWJsZVVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4ge1xuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGVkaXRpbmdEYXRhc2V0OiBhY3Rpb24uZGF0YUlkXG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgcmVzZXRNYXBDb25maWdWaXNTdGF0ZVVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT4gKHtcbiAgLi4uSU5JVElBTF9WSVNfU1RBVEUsXG4gIC4uLnN0YXRlLmluaXRpYWxTdGF0ZSxcbiAgaW5pdGlhbFN0YXRlOiBzdGF0ZS5pbml0aWFsU3RhdGVcbn0pO1xuXG4vKipcbiAqIExvYWRzIGN1c3RvbSBjb25maWd1cmF0aW9uIGludG8gc3RhdGVcbiAqIEBwYXJhbSBzdGF0ZVxuICogQHBhcmFtIGFjdGlvblxuICogQHJldHVybnMgeyp9XG4gKi9cbmV4cG9ydCBjb25zdCByZWNlaXZlTWFwQ29uZmlnVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiB7XG4gIGlmICghYWN0aW9uLnBheWxvYWQudmlzU3RhdGUpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBjb25zdCB7XG4gICAgZmlsdGVycyxcbiAgICBsYXllcnMsXG4gICAgaW50ZXJhY3Rpb25Db25maWcsXG4gICAgbGF5ZXJCbGVuZGluZyxcbiAgICBzcGxpdE1hcHNcbiAgfSA9IGFjdGlvbi5wYXlsb2FkLnZpc1N0YXRlO1xuXG4gIC8vIGFsd2F5cyByZXNldCBjb25maWcgd2hlbiByZWNlaXZlIGEgbmV3IGNvbmZpZ1xuICBjb25zdCByZXNldFN0YXRlID0gcmVzZXRNYXBDb25maWdWaXNTdGF0ZVVwZGF0ZXIoc3RhdGUpO1xuICBsZXQgbWVyZ2VkU3RhdGUgPSB7XG4gICAgLi4ucmVzZXRTdGF0ZSxcbiAgICBzcGxpdE1hcHM6IHNwbGl0TWFwcyB8fCBbXSAvLyBtYXBzIGRvZXNuJ3QgcmVxdWlyZSBhbnkgbG9naWNcbiAgfTtcblxuICBtZXJnZWRTdGF0ZSA9IG1lcmdlRmlsdGVycyhtZXJnZWRTdGF0ZSwgZmlsdGVycyk7XG4gIG1lcmdlZFN0YXRlID0gbWVyZ2VMYXllcnMobWVyZ2VkU3RhdGUsIGxheWVycyk7XG4gIG1lcmdlZFN0YXRlID0gbWVyZ2VJbnRlcmFjdGlvbnMobWVyZ2VkU3RhdGUsIGludGVyYWN0aW9uQ29uZmlnKTtcbiAgbWVyZ2VkU3RhdGUgPSBtZXJnZUxheWVyQmxlbmRpbmcobWVyZ2VkU3RhdGUsIGxheWVyQmxlbmRpbmcpO1xuXG4gIHJldHVybiBtZXJnZWRTdGF0ZTtcbn07XG5cbmV4cG9ydCBjb25zdCBsYXllckhvdmVyVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgaG92ZXJJbmZvOiBhY3Rpb24uaW5mb1xufSk7XG5cbmV4cG9ydCBjb25zdCBsYXllckNsaWNrVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgY2xpY2tlZDogYWN0aW9uLmluZm8gJiYgYWN0aW9uLmluZm8ucGlja2VkID8gYWN0aW9uLmluZm8gOiBudWxsXG59KTtcblxuZXhwb3J0IGNvbnN0IG1hcENsaWNrVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiAoe1xuICAuLi5zdGF0ZSxcbiAgY2xpY2tlZDogbnVsbFxufSk7XG5cbmV4cG9ydCBjb25zdCB0b2dnbGVTcGxpdE1hcFVwZGF0ZXIgPSAoc3RhdGUsIGFjdGlvbikgPT5cbiAgc3RhdGUuc3BsaXRNYXBzICYmIHN0YXRlLnNwbGl0TWFwcy5sZW5ndGggPT09IDBcbiAgICA/IHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIC8vIG1heWJlIHdlIHNob3VsZCB1c2UgYW4gYXJyYXkgdG8gc3RvcmUgc3RhdGUgZm9yIGEgc2luZ2xlIG1hcCBhcyB3ZWxsXG4gICAgICAgIC8vIGlmIGN1cnJlbnQgbWFwcyBsZW5ndGggaXMgZXF1YWwgdG8gMCBpdCBtZWFucyB0aGF0IHdlIGFyZSBhYm91dCB0byBzcGxpdCB0aGUgdmlld1xuICAgICAgICBzcGxpdE1hcHM6IGNvbXB1dGVTcGxpdE1hcExheWVycyhzdGF0ZS5sYXllcnMpXG4gICAgICB9XG4gICAgOiBjbG9zZVNwZWNpZmljTWFwQXRJbmRleChzdGF0ZSwgYWN0aW9uKTtcblxuLyoqXG4gKiBUaGlzIGlzIHRyaWdnZXJlZCB3aGVuIHZpZXcgaXMgc3BsaXQgaW50byBtdWx0aXBsZSBtYXBzLlxuICogSXQgd2lsbCBvbmx5IHVwZGF0ZSBsYXllcnMgdGhhdCBiZWxvbmcgdG8gdGhlIG1hcCBsYXllciBkcm9wZG93blxuICogdGhlIHVzZXIgaXMgaW50ZXJhY3Rpbmcgd2l0XG4gKiBAcGFyYW0gc3RhdGVcbiAqIEBwYXJhbSBhY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNldFZpc2libGVMYXllcnNGb3JNYXBVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgY29uc3Qge21hcEluZGV4LCBsYXllcklkc30gPSBhY3Rpb247XG4gIGlmICghbGF5ZXJJZHMpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBjb25zdCB7c3BsaXRNYXBzID0gW119ID0gc3RhdGU7XG5cbiAgaWYgKHNwbGl0TWFwcy5sZW5ndGggPT09IDApIHtcbiAgICAvLyB3ZSBzaG91bGQgbmV2ZXIgZ2V0IGludG8gdGhpcyBzdGF0ZVxuICAgIC8vIGJlY2F1c2UgdGhpcyBhY3Rpb24gc2hvdWxkIG9ubHkgYmUgdHJpZ2dlcmVkXG4gICAgLy8gd2hlbiBtYXAgdmlldyBpcyBzcGxpdFxuICAgIC8vIGJ1dCBzb21ldGhpbmcgbWF5IGhhdmUgaGFwcGVuZWRcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICAvLyBuZWVkIHRvIGNoZWNrIGlmIG1hcHMgaXMgcG9wdWxhdGVkIG90aGVyd2lzZSB3aWxsIGNyZWF0ZVxuICBjb25zdCB7W21hcEluZGV4XTogbWFwID0ge319ID0gc3BsaXRNYXBzO1xuXG4gIGNvbnN0IGxheWVycyA9IG1hcC5sYXllcnMgfHwgW107XG5cbiAgLy8gd2Ugc2V0IHZpc2liaWxpdHkgdG8gdHJ1ZSBmb3IgYWxsIGxheWVycyBpbmNsdWRlZCBpbiBvdXIgaW5wdXQgbGlzdFxuICBjb25zdCBuZXdMYXllcnMgPSAoT2JqZWN0LmtleXMobGF5ZXJzKSB8fCBbXSkucmVkdWNlKChjdXJyZW50TGF5ZXJzLCBpZHgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uY3VycmVudExheWVycyxcbiAgICAgIFtpZHhdOiB7XG4gICAgICAgIC4uLmxheWVyc1tpZHhdLFxuICAgICAgICBpc1Zpc2libGU6IGxheWVySWRzLmluY2x1ZGVzKGlkeClcbiAgICAgIH1cbiAgICB9O1xuICB9LCB7fSk7XG5cbiAgY29uc3QgbmV3TWFwcyA9IFsuLi5zcGxpdE1hcHNdO1xuXG4gIG5ld01hcHNbbWFwSW5kZXhdID0ge1xuICAgIC4uLnNwbGl0TWFwc1ttYXBJbmRleF0sXG4gICAgbGF5ZXJzOiBuZXdMYXllcnNcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIHNwbGl0TWFwczogbmV3TWFwc1xuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHRvZ2dsZUxheWVyRm9yTWFwVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiB7XG4gIGlmICghc3RhdGUuc3BsaXRNYXBzW2FjdGlvbi5tYXBJbmRleF0pIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBjb25zdCBtYXBTZXR0aW5ncyA9IHN0YXRlLnNwbGl0TWFwc1thY3Rpb24ubWFwSW5kZXhdO1xuICBjb25zdCB7bGF5ZXJzfSA9IG1hcFNldHRpbmdzO1xuICBpZiAoIWxheWVycyB8fCAhbGF5ZXJzW2FjdGlvbi5sYXllcklkXSkge1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIGNvbnN0IGxheWVyID0gbGF5ZXJzW2FjdGlvbi5sYXllcklkXTtcblxuICBjb25zdCBuZXdMYXllciA9IHtcbiAgICAuLi5sYXllcixcbiAgICBpc1Zpc2libGU6ICFsYXllci5pc1Zpc2libGVcbiAgfTtcblxuICBjb25zdCBuZXdMYXllcnMgPSB7XG4gICAgLi4ubGF5ZXJzLFxuICAgIFthY3Rpb24ubGF5ZXJJZF06IG5ld0xheWVyXG4gIH07XG5cbiAgLy8gY29uc3Qgc3BsaXRNYXBzID0gc3RhdGUuc3BsaXRNYXBzO1xuICBjb25zdCBuZXdTcGxpdE1hcHMgPSBbLi4uc3RhdGUuc3BsaXRNYXBzXTtcbiAgbmV3U3BsaXRNYXBzW2FjdGlvbi5tYXBJbmRleF0gPSB7XG4gICAgLi4ubWFwU2V0dGluZ3MsXG4gICAgbGF5ZXJzOiBuZXdMYXllcnNcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIHNwbGl0TWFwczogbmV3U3BsaXRNYXBzXG4gIH07XG59O1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZVZpc0RhdGFVcGRhdGVyID0gKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgLy8gZGF0YXNldHMgY2FuIGJlIGEgc2luZ2xlIGRhdGEgZW50cmllcyBvciBhbiBhcnJheSBvZiBtdWx0aXBsZSBkYXRhIGVudHJpZXNcbiAgY29uc3QgZGF0YXNldHMgPSBBcnJheS5pc0FycmF5KGFjdGlvbi5kYXRhc2V0cylcbiAgICA/IGFjdGlvbi5kYXRhc2V0c1xuICAgIDogW2FjdGlvbi5kYXRhc2V0c107XG5cbiAgaWYgKGFjdGlvbi5jb25maWcpIHtcbiAgICAvLyBhcHBseSBjb25maWcgaWYgcGFzc2VkIGZyb20gYWN0aW9uXG4gICAgc3RhdGUgPSByZWNlaXZlTWFwQ29uZmlnVXBkYXRlcihzdGF0ZSwge1xuICAgICAgcGF5bG9hZDoge3Zpc1N0YXRlOiBhY3Rpb24uY29uZmlnfVxuICAgIH0pO1xuICB9XG5cbiAgY29uc3QgbmV3RGF0ZUVudHJpZXMgPSBkYXRhc2V0cy5yZWR1Y2UoXG4gICAgKGFjY3UsIHtpbmZvID0ge30sIGRhdGF9KSA9PiAoe1xuICAgICAgLi4uYWNjdSxcbiAgICAgIC4uLihjcmVhdGVOZXdEYXRhRW50cnkoe2luZm8sIGRhdGF9LCBzdGF0ZS5kYXRhc2V0cykgfHwge30pXG4gICAgfSksXG4gICAge31cbiAgKTtcblxuICBpZiAoIU9iamVjdC5rZXlzKG5ld0RhdGVFbnRyaWVzKS5sZW5ndGgpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBjb25zdCBzdGF0ZVdpdGhOZXdEYXRhID0ge1xuICAgIC4uLnN0YXRlLFxuICAgIGRhdGFzZXRzOiB7XG4gICAgICAuLi5zdGF0ZS5kYXRhc2V0cyxcbiAgICAgIC4uLm5ld0RhdGVFbnRyaWVzXG4gICAgfVxuICB9O1xuXG4gIC8vIHByZXZpb3VzbHkgc2F2ZWQgY29uZmlnIGJlZm9yZSBkYXRhIGxvYWRlZFxuICBjb25zdCB7XG4gICAgZmlsdGVyVG9CZU1lcmdlZCA9IFtdLFxuICAgIGxheWVyVG9CZU1lcmdlZCA9IFtdLFxuICAgIGludGVyYWN0aW9uVG9CZU1lcmdlZCA9IHt9XG4gIH0gPSBzdGF0ZVdpdGhOZXdEYXRhO1xuXG4gIC8vIG1lcmdlIHN0YXRlIHdpdGggc2F2ZWQgZmlsdGVyc1xuICBsZXQgbWVyZ2VkU3RhdGUgPSBtZXJnZUZpbHRlcnMoc3RhdGVXaXRoTmV3RGF0YSwgZmlsdGVyVG9CZU1lcmdlZCk7XG4gIC8vIG1lcmdlIHN0YXRlIHdpdGggc2F2ZWQgbGF5ZXJzXG4gIG1lcmdlZFN0YXRlID0gbWVyZ2VMYXllcnMobWVyZ2VkU3RhdGUsIGxheWVyVG9CZU1lcmdlZCk7XG5cbiAgaWYgKG1lcmdlZFN0YXRlLmxheWVycy5sZW5ndGggPT09IHN0YXRlLmxheWVycy5sZW5ndGgpIHtcbiAgICAvLyBubyBsYXllciBtZXJnZWQsIGZpbmQgZGVmYXVsdHNcbiAgICBtZXJnZWRTdGF0ZSA9IGFkZERlZmF1bHRMYXllcnMobWVyZ2VkU3RhdGUsIG5ld0RhdGVFbnRyaWVzKTtcbiAgfVxuXG4gIGlmIChtZXJnZWRTdGF0ZS5zcGxpdE1hcHMubGVuZ3RoKSB7XG4gICAgY29uc3QgbmV3TGF5ZXJzID0gbWVyZ2VkU3RhdGUubGF5ZXJzLmZpbHRlcihcbiAgICAgIGwgPT4gbC5jb25maWcuZGF0YUlkIGluIG5ld0RhdGVFbnRyaWVzXG4gICAgKTtcbiAgICAvLyBpZiBtYXAgaXMgc3BsaXRlZCwgYWRkIG5ldyBsYXllcnMgdG8gc3BsaXRNYXBzXG4gICAgbWVyZ2VkU3RhdGUgPSB7XG4gICAgICAuLi5tZXJnZWRTdGF0ZSxcbiAgICAgIHNwbGl0TWFwczogYWRkTmV3TGF5ZXJzVG9TcGxpdE1hcChtZXJnZWRTdGF0ZS5zcGxpdE1hcHMsIG5ld0xheWVycylcbiAgICB9O1xuICB9XG5cbiAgLy8gbWVyZ2Ugc3RhdGUgd2l0aCBzYXZlZCBpbnRlcmFjdGlvbnNcbiAgbWVyZ2VkU3RhdGUgPSBtZXJnZUludGVyYWN0aW9ucyhtZXJnZWRTdGF0ZSwgaW50ZXJhY3Rpb25Ub0JlTWVyZ2VkKTtcblxuICAvLyBpZiBubyB0b29sdGlwcyBtZXJnZWQgYWRkIGRlZmF1bHQgdG9vbHRpcHNcbiAgT2JqZWN0LmtleXMobmV3RGF0ZUVudHJpZXMpLmZvckVhY2goZGF0YUlkID0+IHtcbiAgICBjb25zdCB0b29sdGlwRmllbGRzID1cbiAgICAgIG1lcmdlZFN0YXRlLmludGVyYWN0aW9uQ29uZmlnLnRvb2x0aXAuY29uZmlnLmZpZWxkc1RvU2hvd1tkYXRhSWRdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh0b29sdGlwRmllbGRzKSB8fCAhdG9vbHRpcEZpZWxkcy5sZW5ndGgpIHtcbiAgICAgIG1lcmdlZFN0YXRlID0gYWRkRGVmYXVsdFRvb2x0aXBzKG1lcmdlZFN0YXRlLCBuZXdEYXRlRW50cmllc1tkYXRhSWRdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB1cGRhdGVBbGxMYXllckRvbWFpbkRhdGEobWVyZ2VkU3RhdGUsIE9iamVjdC5rZXlzKG5ld0RhdGVFbnRyaWVzKSk7XG59O1xuLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuXG5mdW5jdGlvbiBnZW5lcmF0ZUxheWVyTWV0YUZvclNwbGl0Vmlld3MobGF5ZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBpc0F2YWlsYWJsZTogbGF5ZXIuY29uZmlnLmlzVmlzaWJsZSxcbiAgICBpc1Zpc2libGU6IGxheWVyLmNvbmZpZy5pc1Zpc2libGVcbiAgfTtcbn1cblxuLyoqXG4gKiBUaGlzIGVtdGhvZCB3aWxsIGNvbXB1dGUgdGhlIGRlZmF1bHQgbWFwcyBjdXN0b20gbGlzdFxuICogYmFzZWQgb24gdGhlIGN1cnJlbnQgbGF5ZXJzIHN0YXR1c1xuICogQHBhcmFtIGxheWVyc1xuICogQHJldHVybnMge1sqLCpdfVxuICovXG5mdW5jdGlvbiBjb21wdXRlU3BsaXRNYXBMYXllcnMobGF5ZXJzKSB7XG4gIGNvbnN0IG1hcExheWVycyA9IGxheWVycy5yZWR1Y2UoXG4gICAgKG5ld0xheWVycywgY3VycmVudExheWVyKSA9PiAoe1xuICAgICAgLi4ubmV3TGF5ZXJzLFxuICAgICAgW2N1cnJlbnRMYXllci5pZF06IGdlbmVyYXRlTGF5ZXJNZXRhRm9yU3BsaXRWaWV3cyhjdXJyZW50TGF5ZXIpXG4gICAgfSksXG4gICAge31cbiAgKTtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBsYXllcnM6IG1hcExheWVyc1xuICAgIH0sXG4gICAge1xuICAgICAgbGF5ZXJzOiBtYXBMYXllcnNcbiAgICB9XG4gIF07XG59XG5cbi8qKlxuICogUmVtb3ZlIGFuIGV4aXN0aW5nIGxheWVycyBmcm9tIGN1c3RvbSBtYXAgbGF5ZXIgb2JqZWN0c1xuICogQHBhcmFtIHN0YXRlXG4gKiBAcGFyYW0gbGF5ZXJcbiAqIEByZXR1cm5zIHtbKiwqXX0gTWFwcyBvZiBjdXN0b20gbGF5ZXIgb2JqZWN0c1xuICovXG5mdW5jdGlvbiByZW1vdmVMYXllckZyb21TcGxpdE1hcHMoc3RhdGUsIGxheWVyKSB7XG4gIHJldHVybiBzdGF0ZS5zcGxpdE1hcHMubWFwKHNldHRpbmdzID0+IHtcbiAgICBjb25zdCB7bGF5ZXJzfSA9IHNldHRpbmdzO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgY29uc3Qge1tsYXllci5pZF06IF8sIC4uLm5ld0xheWVyc30gPSBsYXllcnM7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zZXR0aW5ncyxcbiAgICAgIGxheWVyczogbmV3TGF5ZXJzXG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogQWRkIG5ldyBsYXllcnMgdG8gYm90aCBleGlzdGluZyBtYXBzXG4gKiBAcGFyYW0gc3BsaXRNYXBzXG4gKiBAcGFyYW0gbGF5ZXJzXG4gKiBAcmV0dXJucyB7WyosKl19IG5ldyBzcGxpdE1hcHNcbiAqL1xuZnVuY3Rpb24gYWRkTmV3TGF5ZXJzVG9TcGxpdE1hcChzcGxpdE1hcHMsIGxheWVycykge1xuICBjb25zdCBuZXdMYXllcnMgPSBBcnJheS5pc0FycmF5KGxheWVycykgPyBsYXllcnMgOiBbbGF5ZXJzXTtcblxuICBpZiAoIXNwbGl0TWFwcyB8fCAhc3BsaXRNYXBzLmxlbmd0aCB8fCAhbmV3TGF5ZXJzLmxlbmd0aCkge1xuICAgIHJldHVybiBzcGxpdE1hcHM7XG4gIH1cblxuICAvLyBhZGQgbmV3IGxheWVyIHRvIGJvdGggbWFwcyxcbiAgLy8gIGRvbid0IG92ZXJyaWRlLCBpZiBsYXllci5pZCBpcyBhbHJlYWR5IGluIHNwbGl0TWFwcy5zZXR0aW5ncy5sYXllcnNcbiAgcmV0dXJuIHNwbGl0TWFwcy5tYXAoc2V0dGluZ3MgPT4gKHtcbiAgICAuLi5zZXR0aW5ncyxcbiAgICBsYXllcnM6IHtcbiAgICAgIC4uLnNldHRpbmdzLmxheWVycyxcbiAgICAgIC4uLm5ld0xheWVycy5yZWR1Y2UoXG4gICAgICAgIChhY2N1LCBuZXdMYXllcikgPT5cbiAgICAgICAgICBuZXdMYXllci5jb25maWcuaXNWaXNpYmxlXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAuLi5hY2N1LFxuICAgICAgICAgICAgICAgIFtuZXdMYXllci5pZF06IHNldHRpbmdzLmxheWVyc1tuZXdMYXllci5pZF1cbiAgICAgICAgICAgICAgICAgID8gc2V0dGluZ3MubGF5ZXJzW25ld0xheWVyLmlkXVxuICAgICAgICAgICAgICAgICAgOiBnZW5lcmF0ZUxheWVyTWV0YUZvclNwbGl0Vmlld3MobmV3TGF5ZXIpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogYWNjdSxcbiAgICAgICAge31cbiAgICAgIClcbiAgICB9XG4gIH0pKTtcbn1cblxuLyoqXG4gKiBIaWRlIGFuIGV4aXN0aW5nIGxheWVycyBmcm9tIGN1c3RvbSBtYXAgbGF5ZXIgb2JqZWN0c1xuICogQHBhcmFtIHN0YXRlXG4gKiBAcGFyYW0gbGF5ZXJcbiAqIEByZXR1cm5zIHtbKiwqXX0gTWFwcyBvZiBjdXN0b20gbGF5ZXIgb2JqZWN0c1xuICovXG5mdW5jdGlvbiB0b2dnbGVMYXllckZyb21TcGxpdE1hcHMoc3RhdGUsIGxheWVyKSB7XG4gIHJldHVybiBzdGF0ZS5zcGxpdE1hcHMubWFwKHNldHRpbmdzID0+IHtcbiAgICBjb25zdCB7bGF5ZXJzfSA9IHNldHRpbmdzO1xuICAgIGNvbnN0IG5ld0xheWVycyA9IHtcbiAgICAgIC4uLmxheWVycyxcbiAgICAgIFtsYXllci5pZF06IGdlbmVyYXRlTGF5ZXJNZXRhRm9yU3BsaXRWaWV3cyhsYXllcilcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnNldHRpbmdzLFxuICAgICAgbGF5ZXJzOiBuZXdMYXllcnNcbiAgICB9O1xuICB9KTtcbn1cblxuLyoqXG4gKiBXaGVuIGEgdXNlciBjbGlja3Mgb24gdGhlIHNwZWNpZmljIG1hcCBjbG9zaW5nIGljb25cbiAqIHRoZSBhcHBsaWNhdGlvbiB3aWxsIGNsb3NlIHRoZSBzZWxlY3RlZCBtYXBcbiAqIGFuZCB3aWxsIG1lcmdlIHRoZSByZW1haW5pbmcgb25lIHdpdGggdGhlIGdsb2JhbCBzdGF0ZVxuICogVE9ETzogaSB0aGluayBpbiB0aGUgZnV0dXJlIHRoaXMgYWN0aW9uIHNob3VsZCBiZSBjYWxsZWQgbWVyZ2UgbWFwIGxheWVycyB3aXRoIGdsb2JhbCBzZXR0aW5nc1xuICogQHBhcmFtIHN0YXRlXG4gKiBAcGFyYW0gYWN0aW9uXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZnVuY3Rpb24gY2xvc2VTcGVjaWZpY01hcEF0SW5kZXgoc3RhdGUsIGFjdGlvbikge1xuICAvLyByZXRyaWV2ZSBsYXllcnMgbWV0YSBkYXRhIGZyb20gdGhlIHJlbWFpbmluZyBtYXAgdGhhdCB3ZSBuZWVkIHRvIGtlZXBcbiAgY29uc3QgaW5kZXhUb1JldHJpZXZlID0gMSAtIGFjdGlvbi5wYXlsb2FkO1xuXG4gIGNvbnN0IG1ldGFTZXR0aW5ncyA9IHN0YXRlLnNwbGl0TWFwc1tpbmRleFRvUmV0cmlldmVdO1xuICBpZiAoIW1ldGFTZXR0aW5ncyB8fCAhbWV0YVNldHRpbmdzLmxheWVycykge1xuICAgIC8vIGlmIHdlIGNhbid0IGZpbmQgdGhlIG1ldGEgc2V0dGluZ3Mgd2Ugc2ltcGx5IGNsZWFuIHVwIHNwbGl0TWFwcyBhbmRcbiAgICAvLyBrZWVwIGdsb2JhbCBzdGF0ZSBhcyBpdCBpc1xuICAgIC8vIGJ1dCB3aHkgZG9lcyB0aGlzIGV2ZXIgaGFwcGVuP1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zdGF0ZSxcbiAgICAgIHNwbGl0TWFwczogW11cbiAgICB9O1xuICB9XG5cbiAgY29uc3Qge2xheWVyc30gPSBzdGF0ZTtcblxuICAvLyB1cGRhdGUgbGF5ZXIgdmlzaWJpbGl0eVxuICBjb25zdCBuZXdMYXllcnMgPSBsYXllcnMubWFwKGxheWVyID0+XG4gICAgbGF5ZXIudXBkYXRlTGF5ZXJDb25maWcoe1xuICAgICAgaXNWaXNpYmxlOiBtZXRhU2V0dGluZ3MubGF5ZXJzW2xheWVyLmlkXVxuICAgICAgICA/IG1ldGFTZXR0aW5ncy5sYXllcnNbbGF5ZXIuaWRdLmlzVmlzaWJsZVxuICAgICAgICA6IGxheWVyLmNvbmZpZy5pc1Zpc2libGVcbiAgICB9KVxuICApO1xuXG4gIC8vIGRlbGV0ZSBtYXBcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBsYXllcnM6IG5ld0xheWVycyxcbiAgICBzcGxpdE1hcHM6IFtdXG4gIH07XG59XG5cbi8vIFRPRE86IHJlZG8gd3JpdGUgaGFuZGxlciB0byBub3QgdXNlIHRhc2tzXG5leHBvcnQgY29uc3QgbG9hZEZpbGVzVXBkYXRlciA9IChzdGF0ZSwgYWN0aW9uKSA9PiB7XG4gIGNvbnN0IHtmaWxlc30gPSBhY3Rpb247XG5cbiAgY29uc3QgZmlsZXNUb0xvYWQgPSBmaWxlcy5tYXAoZmlsZUJsb2IgPT4gKHtcbiAgICBmaWxlQmxvYixcbiAgICBpbmZvOiB7XG4gICAgICBpZDogZ2VuZXJhdGVIYXNoSWQoNCksXG4gICAgICBsYWJlbDogZmlsZUJsb2IubmFtZSxcbiAgICAgIHNpemU6IGZpbGVCbG9iLnNpemVcbiAgICB9LFxuICAgIGhhbmRsZXI6IGdldEZpbGVIYW5kbGVyKGZpbGVCbG9iKVxuICB9KSk7XG5cbiAgLy8gcmVhZGVyIC0+IHBhcnNlciAtPiBhdWdtZW50IC0+IHJlY2VpdmVWaXNEYXRhXG4gIGNvbnN0IGxvYWRGaWxlVGFza3MgPSBbXG4gICAgVGFzay5hbGwoZmlsZXNUb0xvYWQubWFwKExPQURfRklMRV9UQVNLKSkuYmltYXAoXG4gICAgICByZXN1bHRzID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlc3VsdHMucmVkdWNlKChmLCBjKSA9PiAoe1xuICAgICAgICAgIC8vIHVzaW5nIGNvbmNhdCBoZXJlIGJlY2F1c2UgdGhlIGN1cnJlbnQgZGF0YXNldHMgY291bGQgYmUgYW4gYXJyYXkgb3IgYSBzaW5nbGUgaXRlbVxuICAgICAgICAgIGRhdGFzZXRzOiBmLmRhdGFzZXRzLmNvbmNhdChjLmRhdGFzZXRzKSxcbiAgICAgICAgICAvLyB3ZSBuZWVkIHRvIGRlZXAgbWVyZ2UgdGhpcyB0aGluZyB1bmxlc3Mgd2UgZmluZCBhIGJldHRlciBzb2x1dGlvblxuICAgICAgICAgIC8vIHRoaXMgY2FzZSB3aWxsIG9ubHkgaGFwcGVuIGlmIHdlIGFsbG93IHRvIGxvYWQgbXVsdGlwbGUga2VwbGVyZ2wganNvbiBmaWxlc1xuICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgLi4uZi5jb25maWcsXG4gICAgICAgICAgICAuLi4oYy5jb25maWcgfHwge30pXG4gICAgICAgICAgfVxuICAgICAgICB9KSwge2RhdGFzZXRzOiBbXSwgY29uZmlnOiB7fSwgb3B0aW9uczoge2NlbnRlck1hcDogdHJ1ZX19KTtcbiAgICAgICAgcmV0dXJuIGFkZERhdGFUb01hcChkYXRhKTtcbiAgICAgIH0sXG4gICAgICBlcnJvciA9PiBsb2FkRmlsZXNFcnIoZXJyb3IpXG4gICAgKVxuICBdO1xuXG4gIHJldHVybiB3aXRoVGFzayhcbiAgICB7XG4gICAgICAuLi5zdGF0ZSxcbiAgICAgIGZpbGVMb2FkaW5nOiB0cnVlXG4gICAgfSxcbiAgICBsb2FkRmlsZVRhc2tzXG4gICk7XG59O1xuXG5leHBvcnQgY29uc3QgbG9hZEZpbGVzRXJyVXBkYXRlciA9IChzdGF0ZSwge2Vycm9yfSkgPT4gKHtcbiAgLi4uc3RhdGUsXG4gIGZpbGVMb2FkaW5nOiBmYWxzZSxcbiAgZmlsZUxvYWRpbmdFcnI6IGVycm9yXG59KTtcblxuLyoqXG4gKiBoZWxwZXIgZnVuY3Rpb24gdG8gdXBkYXRlIEFsbCBsYXllciBkb21haW4gYW5kIGxheWVyIGRhdGEgb2Ygc3RhdGVcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gc3RhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhc2V0c1xuICogQHJldHVybnMge29iamVjdH0gc3RhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZERlZmF1bHRMYXllcnMoc3RhdGUsIGRhdGFzZXRzKSB7XG4gIGNvbnN0IGRlZmF1bHRMYXllcnMgPSBPYmplY3QudmFsdWVzKGRhdGFzZXRzKS5yZWR1Y2UoXG4gICAgKGFjY3UsIGRhdGFzZXQpID0+IFtcbiAgICAgIC4uLmFjY3UsXG4gICAgICAuLi4oZmluZERlZmF1bHRMYXllcihkYXRhc2V0LCBzdGF0ZS5sYXllckNsYXNzZXMpIHx8IFtdKVxuICAgIF0sXG4gICAgW11cbiAgKTtcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBsYXllcnM6IFsuLi5zdGF0ZS5sYXllcnMsIC4uLmRlZmF1bHRMYXllcnNdLFxuICAgIGxheWVyT3JkZXI6IFtcbiAgICAgIC8vIHB1dCBuZXcgbGF5ZXJzIG9uIHRvcCBvZiBvbGQgb25lc1xuICAgICAgLi4uZGVmYXVsdExheWVycy5tYXAoKF8sIGkpID0+IHN0YXRlLmxheWVycy5sZW5ndGggKyBpKSxcbiAgICAgIC4uLnN0YXRlLmxheWVyT3JkZXJcbiAgICBdXG4gIH07XG59XG5cbi8qKlxuICogaGVscGVyIGZ1bmN0aW9uIHRvIGZpbmQgZGVmYXVsdCB0b29sdGlwc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBzdGF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFzZXRcbiAqIEByZXR1cm5zIHtvYmplY3R9IHN0YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREZWZhdWx0VG9vbHRpcHMoc3RhdGUsIGRhdGFzZXQpIHtcbiAgY29uc3QgdG9vbHRpcEZpZWxkcyA9IGZpbmRGaWVsZHNUb1Nob3coZGF0YXNldCk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBpbnRlcmFjdGlvbkNvbmZpZzoge1xuICAgICAgLi4uc3RhdGUuaW50ZXJhY3Rpb25Db25maWcsXG4gICAgICB0b29sdGlwOiB7XG4gICAgICAgIC4uLnN0YXRlLmludGVyYWN0aW9uQ29uZmlnLnRvb2x0aXAsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIC8vIGZpbmQgZGVmYXVsdCBmaWVsZHMgdG8gc2hvdyBpbiB0b29sdGlwXG4gICAgICAgICAgZmllbGRzVG9TaG93OiB7XG4gICAgICAgICAgICAuLi5zdGF0ZS5pbnRlcmFjdGlvbkNvbmZpZy50b29sdGlwLmNvbmZpZy5maWVsZHNUb1Nob3csXG4gICAgICAgICAgICAuLi50b29sdGlwRmllbGRzXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIGhlbHBlciBmdW5jdGlvbiB0byB1cGRhdGUgbGF5ZXIgZG9tYWlucyBmb3IgYW4gYXJyYXkgb2YgZGF0c2V0c1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBzdGF0ZVxuICogQHBhcmFtIHthcnJheSB8IHN0cmluZ30gZGF0YUlkXG4gKiBAcGFyYW0ge29iamVjdH0gbmV3RmlsdGVyIC0gaWYgaXMgY2FsbGVkIGJ5IHNldEZpbHRlciwgdGhlIGZpbHRlciB0aGF0IGhhcyBjaGFuZ2VkXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBzdGF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQWxsTGF5ZXJEb21haW5EYXRhKHN0YXRlLCBkYXRhSWQsIG5ld0ZpbHRlcikge1xuICBjb25zdCBkYXRhSWRzID0gdHlwZW9mIGRhdGFJZCA9PT0gJ3N0cmluZycgPyBbZGF0YUlkXSA6IGRhdGFJZDtcbiAgY29uc3QgbmV3TGF5ZXJzID0gW107XG4gIGNvbnN0IG5ld0xheWVyRGF0YXMgPSBbXTtcblxuICBzdGF0ZS5sYXllcnMuZm9yRWFjaCgob2xkTGF5ZXIsIGkpID0+IHtcbiAgICBpZiAob2xkTGF5ZXIuY29uZmlnLmRhdGFJZCAmJiBkYXRhSWRzLmluY2x1ZGVzKG9sZExheWVyLmNvbmZpZy5kYXRhSWQpKSB7XG4gICAgICAvLyBObyBuZWVkIHRvIHJlY2FsY3VsYXRlIGxheWVyIGRvbWFpbiBpZiBmaWx0ZXIgaGFzIGZpeGVkIGRvbWFpblxuICAgICAgY29uc3QgbmV3TGF5ZXIgPVxuICAgICAgICBuZXdGaWx0ZXIgJiYgbmV3RmlsdGVyLmZpeGVkRG9tYWluXG4gICAgICAgICAgPyBvbGRMYXllclxuICAgICAgICAgIDogb2xkTGF5ZXIudXBkYXRlTGF5ZXJEb21haW4oXG4gICAgICAgICAgICAgIHN0YXRlLmRhdGFzZXRzW29sZExheWVyLmNvbmZpZy5kYXRhSWRdLFxuICAgICAgICAgICAgICBuZXdGaWx0ZXJcbiAgICAgICAgICAgICk7XG5cbiAgICAgIGNvbnN0IHtsYXllckRhdGEsIGxheWVyfSA9IGNhbGN1bGF0ZUxheWVyRGF0YShcbiAgICAgICAgbmV3TGF5ZXIsXG4gICAgICAgIHN0YXRlLFxuICAgICAgICBzdGF0ZS5sYXllckRhdGFbaV1cbiAgICAgICk7XG5cbiAgICAgIG5ld0xheWVycy5wdXNoKGxheWVyKTtcbiAgICAgIG5ld0xheWVyRGF0YXMucHVzaChsYXllckRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdMYXllcnMucHVzaChvbGRMYXllcik7XG4gICAgICBuZXdMYXllckRhdGFzLnB1c2goc3RhdGUubGF5ZXJEYXRhW2ldKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgbGF5ZXJzOiBuZXdMYXllcnMsXG4gICAgbGF5ZXJEYXRhOiBuZXdMYXllckRhdGFzXG4gIH07XG59XG4iXX0=