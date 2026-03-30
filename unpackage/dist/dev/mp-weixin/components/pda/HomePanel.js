"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const welcomeLabel = "欢迎，";
const defaultUserName = "操作员";
const brandSubtitle = "格瑞哲·织循环";
const _sfc_main = {
  __name: "HomePanel",
  props: {
    currentUserName: {
      type: String,
      default: ""
    },
    modules: {
      type: Array,
      default: () => []
    }
  },
  emits: ["logout", "select-module"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(brandSubtitle),
        b: common_vendor.t(welcomeLabel),
        c: common_vendor.t(__props.currentUserName || defaultUserName),
        d: common_vendor.p({
          type: "redo",
          color: "#64748b",
          size: "22"
        }),
        e: common_vendor.o(($event) => emit("logout")),
        f: common_vendor.f(__props.modules, (item, k0, i0) => {
          return common_vendor.e({
            a: item.iconType
          }, item.iconType ? {
            b: "5a6d3209-1-" + i0,
            c: common_vendor.p({
              type: item.iconType,
              color: "#ffffff",
              size: "30"
            })
          } : item.iconPath ? {
            e: item.iconPath
          } : {
            f: common_vendor.t(item.icon)
          }, {
            d: item.iconPath,
            g: common_vendor.t(item.title),
            h: common_vendor.t(item.description),
            i: item.id,
            j: common_vendor.n(`card-${item.theme || "blue"}`),
            k: common_vendor.o(($event) => emit("select-module", item.id), item.id)
          });
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5a6d3209"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/pda/HomePanel.js.map
