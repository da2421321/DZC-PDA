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
const _sfc_main = {
  __name: "ScaleBindingFlow",
  props: {
    topOffset: {
      type: Number,
      default: 64
    },
    bindingStep: {
      type: String,
      default: "factory"
    },
    bindingPageTitle: {
      type: String,
      default: ""
    },
    factories: {
      type: Array,
      default: () => []
    },
    currentFactoryName: {
      type: String,
      default: ""
    },
    lineOptions: {
      type: Array,
      default: () => []
    },
    currentLineName: {
      type: String,
      default: ""
    },
    positionCode: {
      type: String,
      default: ""
    },
    macCode: {
      type: String,
      default: ""
    },
    scanTarget: {
      type: String,
      default: "position"
    },
    scannedPositionData: {
      type: Object,
      default: null
    },
    canBind: {
      type: Boolean,
      default: false
    },
    workspaceRecords: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    "back",
    "select-factory",
    "select-line",
    "switch-line",
    "update-position",
    "update-mac",
    "activate-scan-target",
    "open-scanner",
    "confirm-bind",
    "prompt-unbind"
  ],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    function formatRecordTime(value) {
      const parts = String(value).split(" ");
      return parts[1] || value;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "left",
          color: "#475569",
          size: "30"
        }),
        b: common_vendor.o(($event) => emit("back"), "25"),
        c: common_vendor.t(__props.bindingPageTitle),
        d: __props.bindingStep === "factory"
      }, __props.bindingStep === "factory" ? {
        e: common_vendor.f(__props.factories, (factory, k0, i0) => {
          return {
            a: "47288cb4-1-" + i0,
            b: common_vendor.t(factory.name),
            c: "47288cb4-2-" + i0,
            d: factory.id,
            e: common_vendor.o(($event) => emit("select-factory", factory.id), factory.id)
          };
        }),
        f: common_vendor.p({
          type: "shop-filled",
          color: "#2563eb",
          size: "30"
        }),
        g: common_vendor.p({
          type: "right",
          color: "#9ca3af",
          size: "24"
        })
      } : __props.bindingStep === "line" ? {
        i: common_vendor.t(__props.currentFactoryName),
        j: common_vendor.f(__props.lineOptions, (line, k0, i0) => {
          return {
            a: "47288cb4-3-" + i0,
            b: common_vendor.t(line.name),
            c: "47288cb4-4-" + i0,
            d: line.id,
            e: common_vendor.o(($event) => emit("select-line", line.id), line.id)
          };
        }),
        k: common_vendor.p({
          type: "list",
          color: "#2563eb",
          size: "30"
        }),
        l: common_vendor.p({
          type: "right",
          color: "#9ca3af",
          size: "24"
        })
      } : common_vendor.e({
        m: common_vendor.t(__props.currentFactoryName),
        n: common_vendor.t(__props.currentLineName),
        o: common_vendor.o(($event) => emit("switch-line"), "6c"),
        p: __props.positionCode,
        q: common_vendor.o(($event) => emit("update-position", $event), "0e"),
        r: common_vendor.o(($event) => emit("activate-scan-target", "position"), "e3"),
        s: common_vendor.o(($event) => emit("open-scanner", "position"), "ac"),
        t: common_vendor.n(__props.scanTarget === "position" ? "active" : ""),
        v: __props.scannedPositionData
      }, __props.scannedPositionData ? {
        w: common_vendor.t(__props.scannedPositionData.variety)
      } : {}, {
        x: __props.macCode,
        y: common_vendor.o(($event) => emit("update-mac", $event), "36"),
        z: common_vendor.o(($event) => emit("activate-scan-target", "mac"), "3a"),
        A: common_vendor.o(($event) => emit("open-scanner", "mac"), "dc"),
        B: common_vendor.n(__props.scanTarget === "mac" ? "active" : ""),
        C: common_vendor.t(__props.scanTarget === "mac" ? "MAC 输入框" : "位置输入框"),
        D: common_vendor.n(__props.canBind ? "" : "disabled"),
        E: common_vendor.o(($event) => emit("confirm-bind"), "bf"),
        F: common_vendor.t(__props.workspaceRecords.length),
        G: __props.workspaceRecords.length
      }, __props.workspaceRecords.length ? {
        H: common_vendor.f(__props.workspaceRecords, (record, k0, i0) => {
          return {
            a: common_vendor.t(record.positionId),
            b: common_vendor.t(record.variety),
            c: common_vendor.t(record.macAddress),
            d: common_vendor.t(formatRecordTime(record.bindTime)),
            e: common_vendor.o(($event) => emit("prompt-unbind", record.id), record.id),
            f: record.id
          };
        })
      } : {}), {
        h: __props.bindingStep === "line",
        I: `${__props.topOffset}px`
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-47288cb4"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/pda/ScaleBindingFlow.js.map
