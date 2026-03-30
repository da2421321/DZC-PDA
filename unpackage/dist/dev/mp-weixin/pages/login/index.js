"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_pda = require("../../utils/pda.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const REMEMBER_PASSWORD_KEY = "rememberPassword";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const form = common_vendor.reactive({
      account: "",
      password: ""
    });
    const isLoading = common_vendor.ref(false);
    const showPassword = common_vendor.ref(false);
    const rememberPassword = common_vendor.ref(common_vendor.index.getStorageSync(REMEMBER_PASSWORD_KEY) !== false);
    const showAccountList = common_vendor.ref(false);
    const savedAccounts = common_vendor.ref([]);
    let hideTimer = null;
    common_vendor.onLoad(() => {
      syncSavedAccounts();
    });
    common_vendor.onShow(() => {
      const currentAccount = utils_pda.getAuthAccount();
      if (currentAccount) {
        common_vendor.index.reLaunch({
          url: "/pages/index/index"
        });
        return;
      }
      syncSavedAccounts();
    });
    common_vendor.onUnload(() => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    });
    function syncSavedAccounts() {
      savedAccounts.value = utils_pda.getSavedAccounts();
      if (rememberPassword.value && savedAccounts.value.length > 0) {
        const [lastAccount] = savedAccounts.value;
        form.account = lastAccount.account || "";
        form.password = lastAccount.password || "";
        return;
      }
      if (!rememberPassword.value) {
        form.password = "";
      }
    }
    function handleAccountInput(event) {
      form.account = event.detail.value;
    }
    function handlePasswordInput(event) {
      form.password = event.detail.value;
    }
    function handleBlur() {
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
      hideTimer = setTimeout(() => {
        showAccountList.value = false;
      }, 200);
    }
    function selectAccount(account) {
      form.account = account.account;
      form.password = account.password;
      showAccountList.value = false;
    }
    function togglePassword() {
      showPassword.value = !showPassword.value;
    }
    function onRememberChange(event) {
      rememberPassword.value = event.detail.value.includes("remember");
      common_vendor.index.setStorageSync(REMEMBER_PASSWORD_KEY, rememberPassword.value);
      if (!rememberPassword.value) {
        form.password = "";
        savedAccounts.value = [];
        utils_pda.saveSavedAccounts([]);
      }
    }
    function saveAccount() {
      if (!rememberPassword.value || !form.account || !form.password) {
        return;
      }
      const nextAccounts = savedAccounts.value.filter((item) => item.account !== form.account);
      nextAccounts.unshift({
        account: form.account,
        password: form.password
      });
      savedAccounts.value = nextAccounts.slice(0, 5);
      utils_pda.saveSavedAccounts(savedAccounts.value);
    }
    function showToast(title) {
      common_vendor.index.showToast({
        title,
        icon: "none"
      });
    }
    function handleLogin() {
      if (isLoading.value) {
        return;
      }
      if (!form.account.trim() || !form.password.trim()) {
        showToast("请输入账号和密码");
        return;
      }
      isLoading.value = true;
      setTimeout(() => {
        common_vendor.index.setStorageSync("token", `mock-token-${Date.now()}`);
        saveAccount();
        utils_pda.setAuthAccount(form.account.trim());
        showAccountList.value = false;
        isLoading.value = false;
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
        }, 600);
      }, 300);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(utils_pda.loginHero),
        b: form.account,
        c: common_vendor.o(handleAccountInput),
        d: common_vendor.o(($event) => showAccountList.value = true),
        e: common_vendor.o(handleBlur),
        f: showAccountList.value && savedAccounts.value.length > 0
      }, showAccountList.value && savedAccounts.value.length > 0 ? {
        g: common_vendor.f(savedAccounts.value, (account, index, i0) => {
          return {
            a: common_vendor.t(account.account),
            b: `${account.account}-${index}`,
            c: common_vendor.o(($event) => selectAccount(account), `${account.account}-${index}`)
          };
        })
      } : {}, {
        h: form.password,
        i: !showPassword.value,
        j: common_vendor.o(handlePasswordInput),
        k: common_vendor.p({
          type: showPassword.value ? "eye-slash" : "eye",
          size: "18",
          color: "#999999"
        }),
        l: common_vendor.o(togglePassword),
        m: rememberPassword.value,
        n: common_vendor.o(onRememberChange),
        o: common_vendor.t(isLoading.value ? "登录中..." : "登录"),
        p: isLoading.value,
        q: common_vendor.o(handleLogin)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map
