"use strict";
const common_vendor = require("../common/vendor.js");
const factories = [
  { id: "factory-a", name: "一号厂区" },
  { id: "factory-b", name: "二号厂区" }
];
const lineMap = {
  "factory-a": [
    { id: "line-1", name: "产线 A-1" },
    { id: "line-2", name: "产线 A-2" }
  ],
  "factory-b": [
    { id: "line-1", name: "产线 B-1" },
    { id: "line-2", name: "产线 B-2" }
  ]
};
const nameMap = {
  "admin@gracer.com": "张三",
  "user@gracer.com": "李四"
};
const AUTH_ACCOUNT_KEY = "gracer_auth_account";
const BINDING_RECORDS_KEY = "gracer_scale_binding_records";
const defaultBindingRecords = [
  {
    id: "1",
    factoryId: "factory-a",
    lineId: "line-1",
    positionId: "A01-01",
    variety: "废棉A级",
    macAddress: "00:1B:44:11:3A:B7",
    status: "bound",
    bindTime: "2026-03-11 08:30:00"
  },
  {
    id: "2",
    factoryId: "factory-a",
    lineId: "line-1",
    positionId: "A01-02",
    variety: "废棉B级",
    macAddress: "00:1B:44:11:3A:C8",
    status: "bound",
    bindTime: "2026-03-11 09:15:00"
  },
  {
    id: "3",
    factoryId: "factory-a",
    lineId: "line-2",
    positionId: "A02-01",
    variety: "涤纶切片",
    macAddress: "00:1B:44:11:3A:D9",
    status: "bound",
    bindTime: "2026-03-10 14:20:00"
  },
  {
    id: "4",
    factoryId: "factory-b",
    lineId: "line-1",
    positionId: "B01-01",
    variety: "混合废料",
    macAddress: "00:1B:44:11:3A:E1",
    status: "bound",
    bindTime: "2026-03-11 10:00:00"
  }
];
function cloneList(list) {
  return list.map((item) => ({ ...item }));
}
function getAuthAccount() {
  const account = common_vendor.index.getStorageSync(AUTH_ACCOUNT_KEY);
  if (account) {
    return account;
  }
  const userInfo = common_vendor.index.getStorageSync("userInfo");
  if (userInfo && typeof userInfo === "object") {
    return userInfo.account || userInfo.username || "";
  }
  return "";
}
function setAuthAccount(account) {
  common_vendor.index.setStorageSync(AUTH_ACCOUNT_KEY, account);
}
function clearAuthAccount() {
  common_vendor.index.removeStorageSync(AUTH_ACCOUNT_KEY);
  common_vendor.index.removeStorageSync("token");
  common_vendor.index.removeStorageSync("userInfo");
}
function getCurrentUserName(account) {
  const userInfo = common_vendor.index.getStorageSync("userInfo");
  if (userInfo && typeof userInfo === "object" && userInfo.name) {
    return userInfo.name;
  }
  return nameMap[account] || (account ? account.split("@")[0] : "张三");
}
function getBindingRecords() {
  const records = common_vendor.index.getStorageSync(BINDING_RECORDS_KEY);
  if (Array.isArray(records)) {
    return cloneList(records);
  }
  return cloneList(defaultBindingRecords);
}
function normalizeMac(value) {
  const source = String(value).trim().toUpperCase();
  const pure = source.replace(/[^0-9A-F]/g, "");
  if (pure.length !== 12) {
    return source;
  }
  const groups = [];
  for (let index = 0; index < pure.length; index += 2) {
    groups.push(pure.slice(index, index + 2));
  }
  return groups.join(":");
}
exports.clearAuthAccount = clearAuthAccount;
exports.factories = factories;
exports.getAuthAccount = getAuthAccount;
exports.getBindingRecords = getBindingRecords;
exports.getCurrentUserName = getCurrentUserName;
exports.lineMap = lineMap;
exports.normalizeMac = normalizeMac;
exports.setAuthAccount = setAuthAccount;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/pda.js.map
