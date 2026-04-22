"use strict";
const common_vendor = require("../common/vendor.js");
const env = 1;
const urlList = ["https://www.hhcarbonr.com/api", "https://gracer.hainiu.biz/api"];
const base_url = urlList[env];
const timeout = 5e4;
let loadingCount = 0;
let showModal = false;
function request(params) {
  if (showModal)
    return Promise.reject(new Error("登录处理中"));
  let url = params.url;
  let method = params.method || "get";
  let data = params.data || {};
  const token = common_vendor.index.getStorageSync("token");
  const {
    id: uid
  } = common_vendor.index.getStorageSync("userInfo");
  let header = {
    "Content-Type": "application/json;charset=UTF-8",
    ...params.header
  };
  if (!params.noToken && token) {
    header.Authorization = "Bearer " + token;
    if (uid) {
      data.uid = uid;
    }
  }
  if (!params.silent) {
    loadingCount++;
    if (loadingCount === 1) {
      common_vendor.index.showLoading({
        mask: true
      });
    }
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: base_url + url,
      method,
      header,
      data,
      timeout,
      success(response) {
        const res = response;
        const whiteList = ["00000", "200", "20002", "20004", "20005", "B0001"];
        if (res.statusCode == 200) {
          if (whiteList.includes(String(res.data.code))) {
            if (!params.silent) {
              loadingCount--;
              if (loadingCount <= 0) {
                loadingCount = 0;
                common_vendor.index.hideLoading();
              }
            }
            resolve(res.data);
          } else {
            if (!params.silent) {
              loadingCount--;
              if (loadingCount <= 0) {
                loadingCount = 0;
                common_vendor.index.hideLoading();
              }
            }
            const errMsg = res.data.message || res.data.msg || "";
            if (errMsg.includes("loginUser") || errMsg.includes("token")) {
              common_vendor.index.clearStorageSync();
              if (!showModal) {
                showModal = true;
                common_vendor.index.showModal({
                  title: "提示",
                  content: "登录已过期，请重新登录",
                  showCancel: false,
                  success() {
                    showModal = false;
                    common_vendor.index.reLaunch({
                      url: "/pages/login/index"
                    });
                  }
                });
              }
            } else {
              if (!params.silent) {
                setTimeout(() => {
                  common_vendor.index.showToast({
                    title: errMsg || "服务异常，请联系管理员。",
                    icon: "none",
                    duration: 2e3
                  });
                });
              }
            }
            reject(new Error(errMsg || "操作失败"));
          }
        } else {
          if (!params.silent) {
            loadingCount--;
            if (loadingCount <= 0) {
              loadingCount = 0;
              common_vendor.index.hideLoading();
            }
          }
          setTimeout(() => {
            switch (res.statusCode) {
              case 401:
                common_vendor.index.clearStorageSync();
                if (!showModal) {
                  showModal = true;
                  common_vendor.index.showModal({
                    title: "提示",
                    content: res.data.message || "当前登录会话过期，请重新登录。",
                    showCancel: false,
                    success() {
                      showModal = false;
                      setTimeout(() => {
                        common_vendor.index.navigateTo({
                          url: "/pages/login/index"
                        });
                      }, 1e3);
                    }
                  });
                }
                break;
              case 404:
                if (!params.silent) {
                  common_vendor.index.showToast({
                    title: res.data.message || "请求地址不存在。",
                    icon: "none",
                    duration: 2e3
                  });
                }
                break;
              case 500:
                const errMsg = res.data.message || res.msg || "";
                const isAuthError = res.data.code === "B0301" || res.data.code === "A0307" || res.code === 500 || errMsg.includes("loginUser") || errMsg.includes("token") || errMsg.includes("登录");
                if (isAuthError) {
                  common_vendor.index.clearStorageSync();
                  if (!showModal) {
                    showModal = true;
                    common_vendor.index.showModal({
                      title: "提示",
                      content: "登录已过期，请重新登录",
                      showCancel: false,
                      success() {
                        showModal = false;
                        common_vendor.index.reLaunch({
                          url: "/pages/login/index"
                        });
                      }
                    });
                  }
                } else {
                  if (!params.silent) {
                    common_vendor.index.showToast({
                      title: errMsg || "服务异常，请联系管理员。",
                      icon: "none",
                      duration: 2e3
                    });
                  }
                }
                break;
              default:
                if (!params.silent) {
                  common_vendor.index.showToast({
                    title: res.data.message || "服务异常，请联系管理员。",
                    icon: "none",
                    duration: 2e3
                  });
                }
                break;
            }
          });
          reject(new Error(res.data && (res.data.message || res.data.msg) || res.errMsg || `请求失败(${res.statusCode})`));
        }
      },
      fail(err) {
        reject(err);
        if (!params.silent) {
          loadingCount--;
          if (loadingCount <= 0) {
            loadingCount = 0;
            common_vendor.index.hideLoading();
          }
          setTimeout(() => {
            common_vendor.index.showToast({
              title: "服务异常，请联系管理员。",
              icon: "none",
              duration: 2e3
            });
          });
        }
      },
      complete() {
        if (!params.silent)
          ;
      }
    });
  });
}
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/request/index.js.map
