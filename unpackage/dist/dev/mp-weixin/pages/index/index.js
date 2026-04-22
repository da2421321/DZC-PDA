"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_pda = require("../../utils/pda.js");
if (!Math) {
  (HomePanel + ConfirmDialog)();
}
const ConfirmDialog = () => "../../components/pda/ConfirmDialog.js";
const HomePanel = () => "../../components/pda/HomePanel.js";
const logoutTitle = "退出登录";
const logoutMessage = "确定要退出当前账号吗？";
const logoutConfirmText = "确认退出";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const account = common_vendor.ref("");
    const currentUserName = common_vendor.ref("");
    const homeModules = [
      {
        id: "scale-binding",
        title: "电子称绑定",
        description: "绑定电子称与位置",
        iconPath: "/static/images/icon-scale.svg",
        theme: "blue"
      }
    ];
    const confirmDialog = common_vendor.reactive({
      visible: false,
      title: "",
      message: ""
    });
    common_vendor.onShow(() => {
      syncAuth();
    });
    function syncAuth() {
      const currentAccount = utils_pda.getAuthAccount();
      if (!currentAccount) {
        common_vendor.index.redirectTo({
          url: "/pages/login/index"
        });
        return;
      }
      account.value = currentAccount;
      currentUserName.value = utils_pda.getCurrentUserName(currentAccount);
    }
    function promptLogout() {
      confirmDialog.visible = true;
      confirmDialog.title = logoutTitle;
      confirmDialog.message = logoutMessage;
    }
    function closeConfirmDialog() {
      confirmDialog.visible = false;
      confirmDialog.title = "";
      confirmDialog.message = "";
    }
    function handleConfirmLogout() {
      utils_pda.clearAuthAccount();
      closeConfirmDialog();
      common_vendor.index.reLaunch({
        url: "/pages/login/index"
      });
    }
    function handleModuleSelect(moduleId) {
      if (moduleId === "scale-binding") {
        common_vendor.index.navigateTo({
          url: "/pages/scale-binding/index"
        });
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(promptLogout),
        b: common_vendor.o(handleModuleSelect),
        c: common_vendor.p({
          ["current-user-name"]: currentUserName.value,
          modules: homeModules
        }),
        d: confirmDialog.visible
      }, confirmDialog.visible ? {
        e: common_vendor.o(closeConfirmDialog),
        f: common_vendor.o(handleConfirmLogout),
        g: common_vendor.p({
          title: confirmDialog.title,
          message: confirmDialog.message,
          ["confirm-text"]: logoutConfirmText,
          danger: true
        })
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
