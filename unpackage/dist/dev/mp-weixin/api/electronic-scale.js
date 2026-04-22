"use strict";
const request_index = require("../request/index.js");
function getFactoryOptions() {
  return request_index.request({
    url: "/electronic-scale/slot-config/factory-options",
    method: "get"
  });
}
exports.getFactoryOptions = getFactoryOptions;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/electronic-scale.js.map
