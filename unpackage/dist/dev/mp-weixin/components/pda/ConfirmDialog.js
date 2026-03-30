"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "ConfirmDialog",
  props: {
    title: {
      type: String,
      default: ""
    },
    message: {
      type: String,
      default: ""
    },
    confirmText: {
      type: String,
      default: "确认"
    },
    danger: {
      type: Boolean,
      default: false
    }
  },
  emits: ["close", "confirm"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(__props.title),
        b: common_vendor.t(__props.message),
        c: common_vendor.o(($event) => emit("close")),
        d: common_vendor.t(__props.confirmText),
        e: common_vendor.n(__props.danger ? "danger" : ""),
        f: common_vendor.o(($event) => emit("confirm"))
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c594b69b"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/pda/ConfirmDialog.js.map
