"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_pda = require("../../utils/pda.js");
if (!Math) {
  (ScaleBindingFlow + ConfirmDialog)();
}
const ConfirmDialog = () => "../../components/pda/ConfirmDialog.js";
const ScaleBindingFlow = () => "../../components/pda/ScaleBindingFlow.js";
const topOffset = 0;
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const bindingStep = common_vendor.ref("factory");
    const selectedFactory = common_vendor.ref("");
    const selectedLine = common_vendor.ref("");
    const positionCode = common_vendor.ref("");
    const macCode = common_vendor.ref("");
    const scanTarget = common_vendor.ref("position");
    const scanInputValue = common_vendor.ref("");
    const scanInputFocus = common_vendor.ref(false);
    const scannedPositionData = common_vendor.ref(null);
    const records = common_vendor.ref([]);
    let focusTimer = null;
    let inputTimer = null;
    const confirmDialog = common_vendor.reactive({
      visible: false,
      title: "",
      message: "",
      action: "",
      payload: ""
    });
    const lineOptions = common_vendor.computed(() => utils_pda.lineMap[selectedFactory.value] || []);
    const currentFactoryName = common_vendor.computed(() => (utils_pda.factories.find((item) => item.id === selectedFactory.value) || {}).name || "");
    const currentLineName = common_vendor.computed(() => (lineOptions.value.find((item) => item.id === selectedLine.value) || {}).name || "");
    const bindingPageTitle = common_vendor.computed(() => {
      if (bindingStep.value === "factory")
        return "选择厂区";
      if (bindingStep.value === "line")
        return "选择产线";
      return "电子秤绑定";
    });
    const canBind = common_vendor.computed(() => !!positionCode.value && !!macCode.value);
    const workspaceRecords = common_vendor.computed(() => {
      return records.value.filter((item) => item.factoryId === selectedFactory.value && item.lineId === selectedLine.value && item.status === "bound");
    });
    const confirmButtonText = common_vendor.computed(() => confirmDialog.action === "unbind" ? "确认解绑" : "确认");
    common_vendor.onLoad(() => {
      resetBindingFlow();
    });
    common_vendor.onShow(() => {
      if (!ensureAuth()) {
        return;
      }
      records.value = utils_pda.getBindingRecords();
      if (bindingStep.value === "workspace") {
        restoreScanFocus();
      }
    });
    function ensureAuth() {
      if (!utils_pda.getAuthAccount()) {
        common_vendor.index.reLaunch({
          url: "/pages/login/index"
        });
        return false;
      }
      return true;
    }
    function showToast(title) {
      common_vendor.index.showToast({
        title,
        icon: "none",
        duration: 1500
      });
    }
    function restoreScanFocus(delay = 120) {
      if (bindingStep.value !== "workspace")
        return;
      if (focusTimer) {
        clearTimeout(focusTimer);
        focusTimer = null;
      }
      focusTimer = setTimeout(() => {
        scanInputFocus.value = true;
      }, delay);
    }
    function releaseScanFocus() {
      scanInputFocus.value = false;
      if (focusTimer) {
        clearTimeout(focusTimer);
        focusTimer = null;
      }
    }
    function activateScanTarget(target) {
      if (target !== "position" && target !== "mac")
        return;
      scanTarget.value = target;
      restoreScanFocus(60);
    }
    function handleScanBlur() {
      scanInputFocus.value = false;
      restoreScanFocus(200);
    }
    function handleScanInput() {
      if (bindingStep.value !== "workspace")
        return;
      if (inputTimer) {
        clearTimeout(inputTimer);
        inputTimer = null;
      }
      inputTimer = setTimeout(() => {
        if (scanInputValue.value.trim()) {
          handleScanConfirm();
        }
      }, 120);
    }
    function parseScanData(rawData) {
      const mmmMatch = rawData.match(/MMM=\{(.+)\}/);
      if (!mmmMatch)
        return rawData;
      try {
        const jsonStr = "{" + mmmMatch[1].replace(/'/g, '"') + "}";
        const data = JSON.parse(jsonStr);
        return String(data.k5 || data.k2 || rawData);
      } catch (error) {
        return rawData;
      }
    }
    function applyScanValue(rawValue) {
      const parsedValue = parseScanData(rawValue).trim().toUpperCase();
      if (!parsedValue)
        return;
      if (scanTarget.value === "mac") {
        macCode.value = parsedValue;
        showToast("设备扫码成功");
        return;
      }
      positionCode.value = parsedValue;
      scannedPositionData.value = null;
      showToast("位置扫码成功");
    }
    function handleScanConfirm() {
      if (inputTimer) {
        clearTimeout(inputTimer);
        inputTimer = null;
      }
      const rawValue = scanInputValue.value.trim();
      scanInputValue.value = "";
      if (!rawValue || bindingStep.value !== "workspace")
        return;
      applyScanValue(rawValue);
      restoreScanFocus(80);
    }
    function openConfirmDialog(title, message, action, payload = "") {
      confirmDialog.visible = true;
      confirmDialog.title = title;
      confirmDialog.message = message;
      confirmDialog.action = action;
      confirmDialog.payload = payload;
    }
    function closeConfirmDialog() {
      confirmDialog.visible = false;
      confirmDialog.title = "";
      confirmDialog.message = "";
      confirmDialog.action = "";
      confirmDialog.payload = "";
    }
    function resetBindingForm() {
      releaseScanFocus();
      if (inputTimer) {
        clearTimeout(inputTimer);
        inputTimer = null;
      }
      positionCode.value = "";
      macCode.value = "";
      scannedPositionData.value = null;
      scanInputValue.value = "";
      scanTarget.value = "position";
    }
    function resetBindingFlow() {
      bindingStep.value = "factory";
      selectedFactory.value = "";
      selectedLine.value = "";
      resetBindingForm();
    }
    function handleBindingBack() {
      if (bindingStep.value === "workspace") {
        bindingStep.value = "line";
        selectedLine.value = "";
        resetBindingForm();
        return;
      }
      if (bindingStep.value === "line") {
        bindingStep.value = "factory";
        selectedFactory.value = "";
        selectedLine.value = "";
        return;
      }
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack();
        return;
      }
      common_vendor.index.reLaunch({
        url: "/pages/index/index"
      });
    }
    function handleConfirmDialog() {
      if (confirmDialog.action === "unbind") {
        records.value = records.value.filter((item) => item.id !== confirmDialog.payload);
        utils_pda.saveBindingRecords(records.value);
        closeConfirmDialog();
        showToast("解绑成功");
      }
    }
    function selectFactory(factoryId) {
      selectedFactory.value = factoryId;
      selectedLine.value = "";
      bindingStep.value = "line";
    }
    function selectLine(lineId) {
      selectedLine.value = lineId;
      bindingStep.value = "workspace";
      resetBindingForm();
      restoreScanFocus(120);
    }
    function switchLine() {
      bindingStep.value = "line";
      selectedLine.value = "";
      resetBindingForm();
    }
    function handlePositionInput(event) {
      activateScanTarget("position");
      positionCode.value = event.detail.value.toUpperCase();
      scannedPositionData.value = null;
    }
    function handleMacInput(event) {
      activateScanTarget("mac");
      macCode.value = event.detail.value.toUpperCase();
    }
    function openScanner(target) {
      activateScanTarget(target);
    }
    function confirmBind() {
      if (!canBind.value) {
        showToast("请完善绑定信息");
        return;
      }
      const nextRecord = {
        id: `${Date.now()}`,
        factoryId: selectedFactory.value,
        lineId: selectedLine.value,
        positionId: positionCode.value.trim().toUpperCase(),
        variety: scannedPositionData.value ? scannedPositionData.value.variety : "混合废料",
        macAddress: utils_pda.normalizeMac(macCode.value),
        status: "bound",
        bindTime: utils_pda.formatDateTime(/* @__PURE__ */ new Date())
      };
      records.value = [nextRecord].concat(
        records.value.filter((item) => {
          return !(item.factoryId === selectedFactory.value && item.lineId === selectedLine.value && item.positionId === nextRecord.positionId);
        })
      );
      utils_pda.saveBindingRecords(records.value);
      resetBindingForm();
      showToast("绑定成功");
    }
    function promptUnbind(recordId) {
      openConfirmDialog("解绑设备", "确定要解绑该设备吗？", "unbind", recordId);
    }
    common_vendor.onHide(() => {
      releaseScanFocus();
      if (inputTimer) {
        clearTimeout(inputTimer);
        inputTimer = null;
      }
    });
    common_vendor.onUnload(() => {
      releaseScanFocus();
      if (inputTimer) {
        clearTimeout(inputTimer);
        inputTimer = null;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleBindingBack),
        b: common_vendor.o(selectFactory),
        c: common_vendor.o(selectLine),
        d: common_vendor.o(switchLine),
        e: common_vendor.o(handlePositionInput),
        f: common_vendor.o(handleMacInput),
        g: common_vendor.o(activateScanTarget),
        h: common_vendor.o(openScanner),
        i: common_vendor.o(confirmBind),
        j: common_vendor.o(promptUnbind),
        k: common_vendor.p({
          ["top-offset"]: topOffset,
          ["binding-step"]: bindingStep.value,
          ["binding-page-title"]: bindingPageTitle.value,
          factories: common_vendor.unref(utils_pda.factories),
          ["current-factory-name"]: currentFactoryName.value,
          ["line-options"]: lineOptions.value,
          ["current-line-name"]: currentLineName.value,
          ["position-code"]: positionCode.value,
          ["mac-code"]: macCode.value,
          ["scan-target"]: scanTarget.value,
          ["scanned-position-data"]: scannedPositionData.value,
          ["can-bind"]: canBind.value,
          ["workspace-records"]: workspaceRecords.value
        }),
        l: scanInputFocus.value,
        m: common_vendor.o(handleScanBlur),
        n: common_vendor.o([($event) => scanInputValue.value = $event.detail.value, handleScanInput]),
        o: common_vendor.o(handleScanConfirm),
        p: scanInputValue.value,
        q: confirmDialog.visible
      }, confirmDialog.visible ? {
        r: common_vendor.o(closeConfirmDialog),
        s: common_vendor.o(handleConfirmDialog),
        t: common_vendor.p({
          title: confirmDialog.title,
          message: confirmDialog.message,
          ["confirm-text"]: confirmButtonText.value,
          danger: true
        })
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/scale-binding/index.js.map
