"use strict";
const request_index = require("../request/index.js");
const login = (data) => {
  return request_index.request({
    url: "/rfid/login",
    method: "POST",
    data,
    noToken: true
  });
};
exports.login = login;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
