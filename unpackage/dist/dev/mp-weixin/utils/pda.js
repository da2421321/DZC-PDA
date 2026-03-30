"use strict";
const common_vendor = require("../common/vendor.js");
const loginHero = "/static/images/product-placeholder.jpg";
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
const SAVED_ACCOUNTS_KEY = "gracer_saved_accounts";
const BINDING_RECORDS_KEY = "gracer_scale_binding_records";
const defaultSavedAccounts = [
  { account: "admin@gracer.com", password: "gracer123" },
  { account: "user@gracer.com", password: "user123" }
];
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
function getSavedAccounts() {
  const accounts = common_vendor.index.getStorageSync(SAVED_ACCOUNTS_KEY);
  if (Array.isArray(accounts)) {
    return cloneList(accounts);
  }
  return cloneList(defaultSavedAccounts);
}
function saveSavedAccounts(accounts) {
  common_vendor.index.setStorageSync(SAVED_ACCOUNTS_KEY, accounts);
}
function getAuthAccount() {
  return common_vendor.index.getStorageSync(AUTH_ACCOUNT_KEY) || "";
}
function setAuthAccount(account) {
  common_vendor.index.setStorageSync(AUTH_ACCOUNT_KEY, account);
}
function clearAuthAccount() {
  common_vendor.index.removeStorageSync(AUTH_ACCOUNT_KEY);
}
function getCurrentUserName(account) {
  return nameMap[account] || (account ? account.split("@")[0] : "张三");
}
function getBindingRecords() {
  const records = common_vendor.index.getStorageSync(BINDING_RECORDS_KEY);
  if (Array.isArray(records)) {
    return cloneList(records);
  }
  return cloneList(defaultBindingRecords);
}
function saveBindingRecords(records) {
  common_vendor.index.setStorageSync(BINDING_RECORDS_KEY, records);
}
function pad(value) {
  return value < 10 ? `0${value}` : `${value}`;
}
function formatDateTime(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
exports.formatDateTime = formatDateTime;
exports.getAuthAccount = getAuthAccount;
exports.getBindingRecords = getBindingRecords;
exports.getCurrentUserName = getCurrentUserName;
exports.getSavedAccounts = getSavedAccounts;
exports.lineMap = lineMap;
exports.loginHero = loginHero;
exports.normalizeMac = normalizeMac;
exports.saveBindingRecords = saveBindingRecords;
exports.saveSavedAccounts = saveSavedAccounts;
exports.setAuthAccount = setAuthAccount;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/pda.js.map
