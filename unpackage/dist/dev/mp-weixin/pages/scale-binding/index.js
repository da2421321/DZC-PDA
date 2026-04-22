"use strict";
const common_vendor = require("../../common/vendor.js");
const api_electronicScale = require("../../api/electronic-scale.js");
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
    const factoryOptions = common_vendor.ref(utils_pda.factories);
    const lineOptions = common_vendor.ref([]);
    const selectedFactory = common_vendor.ref("");
    const selectedLine = common_vendor.ref("");
    const positionCode = common_vendor.ref("");
    const macCode = common_vendor.ref("");
    const scanTarget = common_vendor.ref("position");
    const scanInputValue = common_vendor.ref("");
    const scanInputFocus = common_vendor.ref(false);
    const scannedPositionData = common_vendor.ref(null);
    const bindingSubmitting = common_vendor.ref(false);
    const unbindingSubmitting = common_vendor.ref(false);
    const records = common_vendor.ref([]);
    let focusTimer = null;
    let inputTimer = null;
    let lineOptionsRequestId = 0;
    let boundSlotsRequestId = 0;
    const confirmDialog = common_vendor.reactive({
      visible: false,
      title: "",
      message: "",
      action: "",
      payload: ""
    });
    const currentFactoryName = common_vendor.computed(() => (factoryOptions.value.find((item) => item.id === selectedFactory.value) || {}).name || "");
    const currentLineName = common_vendor.computed(() => (lineOptions.value.find((item) => item.id === selectedLine.value) || {}).name || "");
    const bindingPageTitle = common_vendor.computed(() => {
      if (bindingStep.value === "factory")
        return "选择厂区";
      if (bindingStep.value === "line")
        return "选择产线";
      return "电子秤绑定";
    });
    const canBind = common_vendor.computed(() => !!positionCode.value && !!macCode.value && !bindingSubmitting.value);
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
      loadFactoryOptions();
      if (selectedFactory.value) {
        loadLineOptions(selectedFactory.value);
      }
      if (bindingStep.value === "workspace") {
        loadBoundDeviceSlots();
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
    function extractOptionList(source, depth = 0) {
      if (!source || depth > 4)
        return null;
      if (Array.isArray(source))
        return source;
      if (typeof source !== "object")
        return null;
      const keys = ["data", "records", "rows", "list", "options"];
      for (const key of keys) {
        const nested = extractOptionList(source[key], depth + 1);
        if (nested)
          return nested;
      }
      return null;
    }
    function normalizeOptions(response) {
      const list = extractOptionList(response);
      if (!list)
        return null;
      return list.map((item) => {
        if (typeof item !== "object" || item === null) {
          return {
            id: String(item),
            name: String(item)
          };
        }
        const id = item.id ?? item.value ?? item.factoryId ?? item.factoryCode ?? item.lineId ?? item.lineCode ?? item.productionLineId ?? item.productionLineCode ?? item.prodLineId ?? item.prodLineCode ?? item.code ?? item.key;
        const name = item.name ?? item.label ?? item.factoryName ?? item.lineName ?? item.productionLineName ?? item.prodLineName ?? item.text ?? item.title ?? id;
        if (id === void 0 || id === null)
          return null;
        return {
          ...item,
          id: String(id),
          name: String(name)
        };
      }).filter(Boolean);
    }
    async function loadFactoryOptions() {
      try {
        const response = await api_electronicScale.getFactoryOptions();
        const options = normalizeOptions(response);
        if (options !== null) {
          factoryOptions.value = options;
        }
      } catch (error) {
        factoryOptions.value = utils_pda.factories;
      }
    }
    function getFallbackLineOptions(factoryId) {
      return (utils_pda.lineMap[factoryId] || []).map((item) => ({ ...item }));
    }
    async function loadLineOptions(factoryId) {
      const nextFactoryId = String(factoryId || "");
      const requestId = ++lineOptionsRequestId;
      if (!nextFactoryId) {
        lineOptions.value = [];
        return;
      }
      try {
        const response = await api_electronicScale.getLineOptions({ factoryId: nextFactoryId });
        const options = normalizeOptions(response);
        if (requestId !== lineOptionsRequestId || selectedFactory.value !== nextFactoryId)
          return;
        lineOptions.value = options !== null ? options : getFallbackLineOptions(nextFactoryId);
      } catch (error) {
        if (requestId !== lineOptionsRequestId || selectedFactory.value !== nextFactoryId)
          return;
        lineOptions.value = getFallbackLineOptions(nextFactoryId);
      }
    }
    function extractBoundDeviceRows(source, depth = 0) {
      if (!source || depth > 4)
        return null;
      if (Array.isArray(source))
        return source;
      if (typeof source !== "object")
        return null;
      if (Array.isArray(source.rows))
        return source.rows;
      const keys = ["data", "records", "list"];
      for (const key of keys) {
        const nested = extractBoundDeviceRows(source[key], depth + 1);
        if (nested)
          return nested;
      }
      return null;
    }
    function normalizeBoundDeviceSlots(response, factoryId, lineId) {
      const rows = extractBoundDeviceRows(response);
      if (!rows)
        return null;
      return rows.map((item) => {
        if (typeof item !== "object" || item === null)
          return null;
        const slotCode = item.code ?? item.slotCode ?? item.positionCode ?? item.positionId ?? item.id;
        const id = item.id ?? item.slotId ?? slotCode;
        if (id === void 0 || id === null)
          return null;
        return {
          id: String(id),
          factoryId,
          lineId,
          slotId: String(id),
          positionId: String(slotCode ?? id),
          positionIndex: item.index,
          side: item.side,
          varietyId: item.varietyId,
          variety: String(item.varietyName ?? item.variety ?? ""),
          equipmentId: item.equipmentId,
          deviceCode: item.deviceCode,
          macAddress: utils_pda.normalizeMac(item.deviceMac ?? item.macAddress ?? ""),
          deviceMac: item.deviceMac,
          deviceStatus: item.deviceStatus,
          isOnline: Boolean(item.isOnline),
          status: "bound",
          bindTime: item.bindTime || ""
        };
      }).filter(Boolean);
    }
    async function loadBoundDeviceSlots() {
      const factoryId = selectedFactory.value;
      const lineId = selectedLine.value;
      const requestId = ++boundSlotsRequestId;
      if (!factoryId || !lineId)
        return;
      try {
        const response = await api_electronicScale.getSlotsWithBoundDevices({ factoryId, lineId });
        const nextRecords = normalizeBoundDeviceSlots(response, factoryId, lineId);
        if (requestId !== boundSlotsRequestId || selectedFactory.value !== factoryId || selectedLine.value !== lineId)
          return;
        if (nextRecords) {
          records.value = nextRecords;
        }
      } catch (error) {
        if (requestId !== boundSlotsRequestId || selectedFactory.value !== factoryId || selectedLine.value !== lineId)
          return;
        records.value = utils_pda.getBindingRecords();
      }
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
      lineOptionsRequestId += 1;
      boundSlotsRequestId += 1;
      bindingStep.value = "factory";
      selectedFactory.value = "";
      selectedLine.value = "";
      lineOptions.value = [];
      resetBindingForm();
    }
    function handleBindingBack() {
      if (bindingStep.value === "workspace") {
        boundSlotsRequestId += 1;
        bindingStep.value = "line";
        selectedLine.value = "";
        resetBindingForm();
        return;
      }
      if (bindingStep.value === "line") {
        lineOptionsRequestId += 1;
        boundSlotsRequestId += 1;
        bindingStep.value = "factory";
        selectedFactory.value = "";
        selectedLine.value = "";
        lineOptions.value = [];
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
    async function handleConfirmDialog() {
      if (unbindingSubmitting.value) {
        return;
      }
      if (confirmDialog.action === "unbind") {
        if (!confirmDialog.payload) {
          closeConfirmDialog();
          return;
        }
        unbindingSubmitting.value = true;
        try {
          await api_electronicScale.unbindScale({
            slotId: String(confirmDialog.payload)
          });
          closeConfirmDialog();
          showToast("解绑成功");
          loadBoundDeviceSlots();
          restoreScanFocus(120);
        } catch (error) {
          restoreScanFocus(120);
        } finally {
          unbindingSubmitting.value = false;
        }
      }
    }
    function selectFactory(factoryId) {
      const nextFactoryId = String(factoryId || "");
      boundSlotsRequestId += 1;
      selectedFactory.value = nextFactoryId;
      selectedLine.value = "";
      lineOptions.value = [];
      bindingStep.value = "line";
      loadLineOptions(nextFactoryId);
    }
    function selectLine(lineId) {
      selectedLine.value = String(lineId || "");
      bindingStep.value = "workspace";
      resetBindingForm();
      loadBoundDeviceSlots();
      restoreScanFocus(120);
    }
    function switchLine() {
      boundSlotsRequestId += 1;
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
    async function confirmBind() {
      if (bindingSubmitting.value) {
        return;
      }
      if (!positionCode.value || !macCode.value) {
        showToast("请完善绑定信息");
        return;
      }
      bindingSubmitting.value = true;
      try {
        await api_electronicScale.bindScaleByPosition({
          position: positionCode.value.trim().toUpperCase(),
          deviceMac: utils_pda.normalizeMac(macCode.value)
        });
        resetBindingForm();
        showToast("绑定成功");
        loadBoundDeviceSlots();
        restoreScanFocus(120);
      } catch (error) {
        restoreScanFocus(120);
      } finally {
        bindingSubmitting.value = false;
      }
    }
    function promptUnbind(slotId) {
      openConfirmDialog("解绑设备", "确定要解绑该设备吗？", "unbind", String(slotId || ""));
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
        a: common_vendor.o(handleBindingBack, "d1"),
        b: common_vendor.o(selectFactory, "9c"),
        c: common_vendor.o(selectLine, "dd"),
        d: common_vendor.o(switchLine, "6b"),
        e: common_vendor.o(handlePositionInput, "95"),
        f: common_vendor.o(handleMacInput, "aa"),
        g: common_vendor.o(activateScanTarget, "93"),
        h: common_vendor.o(openScanner, "7c"),
        i: common_vendor.o(confirmBind, "2c"),
        j: common_vendor.o(promptUnbind, "7d"),
        k: common_vendor.p({
          ["top-offset"]: topOffset,
          ["binding-step"]: bindingStep.value,
          ["binding-page-title"]: bindingPageTitle.value,
          factories: factoryOptions.value,
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
        m: common_vendor.o(handleScanBlur, "a0"),
        n: common_vendor.o([($event) => scanInputValue.value = $event.detail.value, handleScanInput], "ed"),
        o: common_vendor.o(handleScanConfirm, "b0"),
        p: scanInputValue.value,
        q: confirmDialog.visible
      }, confirmDialog.visible ? {
        r: common_vendor.o(closeConfirmDialog, "5d"),
        s: common_vendor.o(handleConfirmDialog, "56"),
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
