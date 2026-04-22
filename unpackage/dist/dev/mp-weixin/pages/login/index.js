"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_user = require("../../api/user.js");
const utils_pda = require("../../utils/pda.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const form = common_vendor.reactive({
      username: "",
      password: ""
    });
    const isLoading = common_vendor.ref(false);
    const showPassword = common_vendor.ref(false);
    const rememberPassword = common_vendor.ref(common_vendor.index.getStorageSync("rememberPassword") !== false);
    const showAccountList = common_vendor.ref(false);
    const savedAccounts = common_vendor.ref([]);
    common_vendor.onMounted(() => {
      const token = common_vendor.index.getStorageSync("token");
      if (token) {
        common_vendor.index.reLaunch({
          url: "/pages/index/index"
        });
        return;
      }
      const saved = common_vendor.index.getStorageSync("savedAccounts");
      if (saved) {
        try {
          savedAccounts.value = JSON.parse(saved);
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/login/index.vue:114", "解析保存的账号失败", error);
        }
      }
      if (rememberPassword.value && savedAccounts.value.length > 0) {
        const lastAccount = savedAccounts.value[0];
        form.username = lastAccount.username;
        form.password = lastAccount.password;
      }
    });
    const handleBlur = () => {
      setTimeout(() => {
        showAccountList.value = false;
      }, 200);
    };
    const selectAccount = (account) => {
      form.username = account.username;
      form.password = account.password;
      showAccountList.value = false;
    };
    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };
    const onRememberChange = (event) => {
      rememberPassword.value = event.detail.value.includes("remember");
      common_vendor.index.setStorageSync("rememberPassword", rememberPassword.value);
      if (!rememberPassword.value) {
        savedAccounts.value = [];
        common_vendor.index.removeStorageSync("savedAccounts");
      }
    };
    const saveAccount = () => {
      if (rememberPassword.value && form.username && form.password) {
        const existingIndex = savedAccounts.value.findIndex((account) => account.username === form.username);
        if (existingIndex >= 0) {
          savedAccounts.value[existingIndex] = {
            username: form.username,
            password: form.password
          };
        } else {
          savedAccounts.value.unshift({
            username: form.username,
            password: form.password
          });
        }
        if (savedAccounts.value.length > 5) {
          savedAccounts.value = savedAccounts.value.slice(0, 5);
        }
        common_vendor.index.setStorageSync("savedAccounts", JSON.stringify(savedAccounts.value));
      }
    };
    const handleLogin = async () => {
      var _a;
      if (!form.username || !form.password) {
        common_vendor.index.showToast({
          title: "请输入账号和密码",
          icon: "none"
        });
        return;
      }
      isLoading.value = true;
      try {
        const res = await api_user.login({
          username: form.username,
          password: form.password
        });
        if (!res || !res.token) {
          common_vendor.index.showToast({
            title: "登录失败，请重试",
            icon: "none"
          });
          return;
        }
        const savedAccountsBackup = common_vendor.index.getStorageSync("savedAccounts");
        const rememberPasswordBackup = common_vendor.index.getStorageSync("rememberPassword");
        common_vendor.index.clearStorageSync();
        if (savedAccountsBackup) {
          common_vendor.index.setStorageSync("savedAccounts", savedAccountsBackup);
        }
        if (rememberPasswordBackup !== "") {
          common_vendor.index.setStorageSync("rememberPassword", rememberPasswordBackup);
        }
        common_vendor.index.setStorageSync("token", res.token);
        if (res.userInfo) {
          common_vendor.index.setStorageSync("userInfo", res.userInfo);
        }
        utils_pda.setAuthAccount(((_a = res.userInfo) == null ? void 0 : _a.account) || form.username);
        saveAccount();
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
        }, 1e3);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:230", error);
      } finally {
        isLoading.value = false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0,
        b: common_vendor.o(($event) => showAccountList.value = true, "93"),
        c: common_vendor.o(handleBlur, "c1"),
        d: form.username,
        e: common_vendor.o(($event) => form.username = $event.detail.value, "09"),
        f: showAccountList.value && savedAccounts.value.length > 0
      }, showAccountList.value && savedAccounts.value.length > 0 ? {
        g: common_vendor.f(savedAccounts.value, (account, index, i0) => {
          return {
            a: common_vendor.t(account.username),
            b: index,
            c: common_vendor.o(($event) => selectAccount(account), index)
          };
        })
      } : {}, {
        h: !showPassword.value,
        i: form.password,
        j: common_vendor.o(($event) => form.password = $event.detail.value, "8d"),
        k: common_vendor.p({
          type: showPassword.value ? "eye-slash" : "eye",
          size: "18",
          color: "#999"
        }),
        l: common_vendor.o(togglePassword, "8b"),
        m: rememberPassword.value,
        n: common_vendor.o(onRememberChange, "31"),
        o: common_vendor.t(isLoading.value ? "登录中..." : "登录"),
        p: isLoading.value,
        q: common_vendor.o(handleLogin, "91")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map
