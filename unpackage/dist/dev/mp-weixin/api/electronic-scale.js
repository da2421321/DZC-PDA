"use strict";
const request_index = require("../request/index.js");
function getFactoryOptions() {
  return request_index.request({
    url: "/electronic-scale/slot-config/factory-options",
    method: "get"
  });
}
function getLineOptions(params = {}) {
  return request_index.request({
    url: "/electronic-scale/slot-config/line-options",
    method: "get",
    data: params
  });
}
function bindScaleByPosition(data) {
  return request_index.request({
    url: "/electronic-scale/scale-binding/bind-by-position",
    method: "post",
    data
  });
}
function unbindScale(data) {
  return request_index.request({
    url: "/electronic-scale/scale-binding/bind",
    method: "post",
    data
  });
}
function getSlotsWithBoundDevices(params = {}) {
  return request_index.request({
    url: "/electronic-scale/slot-config/slots-with-bound-devices",
    method: "get",
    data: params
  });
}
exports.bindScaleByPosition = bindScaleByPosition;
exports.getFactoryOptions = getFactoryOptions;
exports.getLineOptions = getLineOptions;
exports.getSlotsWithBoundDevices = getSlotsWithBoundDevices;
exports.unbindScale = unbindScale;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/electronic-scale.js.map
