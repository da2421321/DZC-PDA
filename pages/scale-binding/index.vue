<template>
	<view class="page">
		<input
			ref="scanInputRef"
			v-model="scanInputValue"
			class="hidden-scan-input"
			type="text"
			:focus="scanInputFocus"
			:adjust-position="false"
			:hold-keyboard="false"
			inputmode="none"
			:show-keyboard="false"
			@blur="handleScanBlur"
			@input="handleScanInput"
			@confirm="handleScanConfirm"
		/>

		<ScaleBindingFlow
			:top-offset="topOffset"
			:binding-step="bindingStep"
			:binding-page-title="bindingPageTitle"
			:factories="factoryOptions"
			:current-factory-name="currentFactoryName"
			:line-options="lineOptions"
			:current-line-name="currentLineName"
			:show-workspace-selector="!skipFactoryLineSelection"
			:show-binding-form="!isUnbindMode"
			:position-code="positionCode"
			:mac-code="macCode"
			:scan-target="scanTarget"
			:scanned-position-data="scannedPositionData"
			:can-bind="canBind"
			:workspace-records="workspaceRecords"
			@back="handleBindingBack"
			@select-factory="selectFactory"
			@select-line="selectLine"
			@switch-line="switchLine"
			@activate-scan-target="activateScanTarget"
			@confirm-bind="confirmBind"
			@prompt-unbind="promptUnbind"
		/>

		<ConfirmDialog
			v-if="confirmDialog.visible"
			:title="confirmDialog.title"
			:message="confirmDialog.message"
			:confirm-text="confirmButtonText"
			:danger="true"
			@close="closeConfirmDialog"
			@confirm="handleConfirmDialog"
		/>
	</view>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { bindScaleByPosition, getFactoryOptions, getLineOptions, getSlotsWithBoundDevices, unbindScale } from '@/api/electronic-scale'
import ConfirmDialog from '@/components/pda/ConfirmDialog.vue'
import ScaleBindingFlow from '@/components/pda/ScaleBindingFlow.vue'
import {
	factories as defaultFactories,
	getAuthAccount,
	getBindingRecords,
	lineMap,
	normalizeMac
} from '@/utils/pda'

const pageMode = ref('bind')
const isUnbindMode = computed(() => pageMode.value === 'unbind')
const skipFactoryLineSelection = computed(() => !isUnbindMode.value)
const bindingStep = ref('workspace')
const factoryOptions = ref(defaultFactories)
const lineOptions = ref([])
const selectedFactory = ref('')
const selectedLine = ref('')
const positionCode = ref('')
const macCode = ref('')
const scanTarget = ref('position')
const scanInputValue = ref('')
const scanInputFocus = ref(false)
const scanInputRef = ref(null)
const scannedPositionData = ref(null)
const bindingSubmitting = ref(false)
const unbindingSubmitting = ref(false)
const records = ref([])
let lineOptionsRequestId = 0
let boundSlotsRequestId = 0
let scanFocusTimer = null
let scanInputTimer = null

const confirmDialog = reactive({
	visible: false,
	title: '',
	message: '',
	action: '',
	payload: ''
})

const topOffset = 0
const currentFactoryName = computed(() => (factoryOptions.value.find((item) => item.id === selectedFactory.value) || {}).name || '')
const currentLineName = computed(() => (lineOptions.value.find((item) => item.id === selectedLine.value) || {}).name || '')
const bindingPageTitle = computed(() => {
	if (bindingStep.value === 'factory') return '\u9009\u62e9\u5382\u533a'
	if (bindingStep.value === 'line') return '\u9009\u62e9\u4ea7\u7ebf'
	if (isUnbindMode.value) return '\u7535\u5b50\u79e4\u89e3\u7ed1'
	return '\u7535\u5b50\u79e4\u7ed1\u5b9a'
})
const canBind = computed(() => !!positionCode.value && !!macCode.value && !bindingSubmitting.value)
const scanInputEnabled = computed(() => !isUnbindMode.value && bindingStep.value === 'workspace')
const workspaceRecords = computed(() => {
	return records.value.filter((item) => item.factoryId === selectedFactory.value && item.lineId === selectedLine.value && item.status === 'bound')
})
const confirmButtonText = computed(() => (confirmDialog.action === 'unbind' ? '\u786e\u8ba4\u89e3\u7ed1' : '\u786e\u8ba4'))

watch(scanInputEnabled, (enabled) => {
	if (enabled) {
		restoreScanFocus()
		return
	}

	pauseScanInput()
}, { immediate: true })

onLoad((options = {}) => {
	pageMode.value = options.mode === 'unbind' ? 'unbind' : 'bind'
	resetBindingFlow()
})

onShow(() => {
	if (!ensureAuth()) {
		return
	}
	records.value = getBindingRecords()
	loadFactoryOptions()
	if (selectedFactory.value) {
		loadLineOptions(selectedFactory.value)
	}
	if (bindingStep.value === 'workspace') {
		loadBoundDeviceSlots()
	}
	restoreScanFocus()
})

onHide(() => {
	pauseScanInput()
})

onUnload(() => {
	pauseScanInput()
})

function ensureAuth() {
	if (!getAuthAccount()) {
		uni.reLaunch({
			url: '/pages/login/index'
		})
		return false
	}
	return true
}

function showToast(title) {
	uni.showToast({
		title,
		icon: 'none',
		duration: 1500
	})
}

function showBindSuccessModal() {
	uni.showModal({
		title: '\u63d0\u793a',
		content: '\u7ed1\u5b9a\u6210\u529f',
		showCancel: false,
		confirmText: '\u77e5\u9053\u4e86'
	})
}

function extractOptionList(source, depth = 0) {
	if (!source || depth > 4) return null
	if (Array.isArray(source)) return source
	if (typeof source !== 'object') return null

	const keys = ['data', 'records', 'rows', 'list', 'options']
	for (const key of keys) {
		const nested = extractOptionList(source[key], depth + 1)
		if (nested) return nested
	}

	return null
}

function normalizeOptions(response) {
	const list = extractOptionList(response)
	if (!list) return null

	return list
		.map((item) => {
			if (typeof item !== 'object' || item === null) {
				return {
					id: String(item),
					name: String(item)
				}
			}

			const id = item.id ?? item.value ?? item.factoryId ?? item.factoryCode ?? item.lineId ?? item.lineCode ?? item.productionLineId ?? item.productionLineCode ?? item.prodLineId ?? item.prodLineCode ?? item.code ?? item.key
			const name = item.name ?? item.label ?? item.factoryName ?? item.lineName ?? item.productionLineName ?? item.prodLineName ?? item.text ?? item.title ?? id
			if (id === undefined || id === null) return null

			return {
				...item,
				id: String(id),
				name: String(name)
			}
		})
		.filter(Boolean)
}

async function loadFactoryOptions() {
	try {
		const response = await getFactoryOptions()
		const options = normalizeOptions(response)
		if (options !== null) {
			factoryOptions.value = options
		}
	} catch (error) {
		factoryOptions.value = defaultFactories
	}
}

function getFallbackLineOptions(factoryId) {
	return (lineMap[factoryId] || []).map((item) => ({ ...item }))
}

async function loadLineOptions(factoryId) {
	const nextFactoryId = String(factoryId || '')
	const requestId = ++lineOptionsRequestId
	if (!nextFactoryId) {
		lineOptions.value = []
		return
	}

	try {
		const response = await getLineOptions({ factoryId: nextFactoryId })
		const options = normalizeOptions(response)
		if (requestId !== lineOptionsRequestId || selectedFactory.value !== nextFactoryId) return
		lineOptions.value = options !== null ? options : getFallbackLineOptions(nextFactoryId)
	} catch (error) {
		if (requestId !== lineOptionsRequestId || selectedFactory.value !== nextFactoryId) return
		lineOptions.value = getFallbackLineOptions(nextFactoryId)
	}
}

function extractBoundDeviceRows(source, depth = 0) {
	if (!source || depth > 4) return null
	if (Array.isArray(source)) return source
	if (typeof source !== 'object') return null

	if (Array.isArray(source.rows)) return source.rows

	const keys = ['data', 'records', 'list']
	for (const key of keys) {
		const nested = extractBoundDeviceRows(source[key], depth + 1)
		if (nested) return nested
	}

	return null
}

function normalizeBoundDeviceSlots(response, factoryId, lineId) {
	const rows = extractBoundDeviceRows(response)
	if (!rows) return null

	return rows
		.map((item) => {
			if (typeof item !== 'object' || item === null) return null

			const slotCode = item.code ?? item.slotCode ?? item.positionCode ?? item.positionId ?? item.id
			const id = item.id ?? item.slotId ?? slotCode
			if (id === undefined || id === null) return null

			return {
				id: String(id),
				factoryId,
				lineId,
				slotId: String(id),
				positionId: String(slotCode ?? id),
				positionIndex: item.index,
				side: item.side,
				varietyId: item.varietyId,
				variety: String(item.varietyName ?? item.variety ?? ''),
				equipmentId: item.equipmentId,
				deviceCode: item.deviceCode,
				macAddress: normalizeMac(item.deviceMac ?? item.macAddress ?? ''),
				deviceMac: item.deviceMac,
				deviceStatus: item.deviceStatus,
				isOnline: Boolean(item.isOnline),
				status: 'bound',
				bindTime: item.bindTime || ''
			}
		})
		.filter(Boolean)
}

async function loadBoundDeviceSlots() {
	const factoryId = selectedFactory.value
	const lineId = selectedLine.value
	const requestId = ++boundSlotsRequestId
	if (!factoryId || !lineId) return

	try {
		const response = await getSlotsWithBoundDevices({ factoryId, lineId })
		const nextRecords = normalizeBoundDeviceSlots(response, factoryId, lineId)
		if (requestId !== boundSlotsRequestId || selectedFactory.value !== factoryId || selectedLine.value !== lineId) return
		if (nextRecords) {
			records.value = nextRecords
		}
	} catch (error) {
		if (requestId !== boundSlotsRequestId || selectedFactory.value !== factoryId || selectedLine.value !== lineId) return
		records.value = getBindingRecords()
	}
}

function activateScanTarget(target) {
	if (target !== 'position' && target !== 'mac') return
	scanTarget.value = target
	restoreScanFocus(80)
}

function clearScanFocusTimer() {
	if (scanFocusTimer) {
		clearTimeout(scanFocusTimer)
		scanFocusTimer = null
	}
}

function clearScanInputTimer() {
	if (scanInputTimer) {
		clearTimeout(scanInputTimer)
		scanInputTimer = null
	}
}

function restoreScanFocus(delay = 200) {
	clearScanFocusTimer()
	if (!scanInputEnabled.value) {
		scanInputFocus.value = false
		return
	}

	scanFocusTimer = setTimeout(() => {
		scanFocusTimer = null
		if (!scanInputEnabled.value) return

		scanInputFocus.value = false
		nextTick(() => {
			if (scanInputEnabled.value) {
				scanInputFocus.value = true
			}
		})
	}, delay)
}

function pauseScanInput() {
	clearScanFocusTimer()
	clearScanInputTimer()
	scanInputValue.value = ''
	scanInputFocus.value = false
}

function handleScanBlur() {
	scanInputFocus.value = false
	restoreScanFocus(300)
}

function handleScanInput() {
	if (!scanInputEnabled.value) return

	clearScanInputTimer()
	scanInputTimer = setTimeout(() => {
		if (scanInputValue.value.trim()) {
			handleScanConfirm()
		}
	}, 300)
}

function handleScanConfirm() {
	clearScanInputTimer()

	const rawValue = scanInputValue.value.trim()
	scanInputValue.value = ''
	if (!rawValue || !scanInputEnabled.value) return

	applyScanValue(rawValue)
	restoreScanFocus()
}

function parseScanData(rawData) {
	const mmmMatch = rawData.match(/MMM=\{(.+)\}/)
	if (!mmmMatch) return rawData
	try {
		const jsonStr = '{' + mmmMatch[1].replace(/'/g, '"') + '}'
		const data = JSON.parse(jsonStr)
		return String(data.k5 || data.k2 || rawData)
	} catch (error) {
		return rawData
	}
}

function applyScanValue(rawValue) {
	const parsedValue = parseScanData(rawValue).trim().toUpperCase()
	if (!parsedValue) return

	if (scanTarget.value === 'mac') {
		macCode.value = parsedValue
		showToast('\u8bbe\u5907\u626b\u7801\u6210\u529f')
		return
	}

	positionCode.value = parsedValue
	scannedPositionData.value = null
	scanTarget.value = 'mac'
	showToast('\u4f4d\u7f6e\u626b\u7801\u6210\u529f')
}

function openConfirmDialog(title, message, action, payload = '') {
	confirmDialog.visible = true
	confirmDialog.title = title
	confirmDialog.message = message
	confirmDialog.action = action
	confirmDialog.payload = payload
}

function closeConfirmDialog() {
	confirmDialog.visible = false
	confirmDialog.title = ''
	confirmDialog.message = ''
	confirmDialog.action = ''
	confirmDialog.payload = ''
}

function resetBindingForm() {
	positionCode.value = ''
	macCode.value = ''
	scannedPositionData.value = null
	scanTarget.value = 'position'
}

function resetBindingFlow() {
	lineOptionsRequestId += 1
	boundSlotsRequestId += 1
	bindingStep.value = skipFactoryLineSelection.value ? 'workspace' : 'factory'
	selectedFactory.value = ''
	selectedLine.value = ''
	lineOptions.value = []
	resetBindingForm()
}

function leaveBindingPage() {
	const pages = getCurrentPages()
	if (pages.length > 1) {
		uni.navigateBack()
		return
	}

	uni.reLaunch({
		url: '/pages/index/index'
	})
}

function handleBindingBack() {
	if (bindingStep.value === 'workspace') {
		if (skipFactoryLineSelection.value) {
			leaveBindingPage()
			return
		}

		boundSlotsRequestId += 1
		bindingStep.value = 'line'
		selectedLine.value = ''
		resetBindingForm()
		return
	}

	if (bindingStep.value === 'line') {
		lineOptionsRequestId += 1
		boundSlotsRequestId += 1
		bindingStep.value = 'factory'
		selectedFactory.value = ''
		selectedLine.value = ''
		lineOptions.value = []
		return
	}

	leaveBindingPage()
}

async function handleConfirmDialog() {
	if (unbindingSubmitting.value) {
		return
	}

	if (confirmDialog.action === 'unbind') {
		if (!confirmDialog.payload) {
			closeConfirmDialog()
			return
		}

		unbindingSubmitting.value = true
		try {
			await unbindScale({
				slotId: String(confirmDialog.payload)
			})
			closeConfirmDialog()
			showToast('\u89e3\u7ed1\u6210\u529f')
			loadBoundDeviceSlots()
		} catch {
			// 接口层已统一提示错误，这里只负责恢复提交状态。
		} finally {
			unbindingSubmitting.value = false
		}
	}
}

function selectFactory(factoryId) {
	const nextFactoryId = String(factoryId || '')
	boundSlotsRequestId += 1
	selectedFactory.value = nextFactoryId
	selectedLine.value = ''
	lineOptions.value = []
	bindingStep.value = 'line'
	loadLineOptions(nextFactoryId)
}

function selectLine(lineId) {
	selectedLine.value = String(lineId || '')
	bindingStep.value = 'workspace'
	resetBindingForm()
	loadBoundDeviceSlots()
}

function switchLine() {
	boundSlotsRequestId += 1
	bindingStep.value = 'line'
	selectedLine.value = ''
	resetBindingForm()
}

async function confirmBind() {
	if (isUnbindMode.value) {
		return
	}

	if (bindingSubmitting.value) {
		return
	}

	if (!positionCode.value || !macCode.value) {
		showToast('\u8bf7\u5b8c\u5584\u7ed1\u5b9a\u4fe1\u606f')
		return
	}

	bindingSubmitting.value = true
	try {
		await bindScaleByPosition({
			position: positionCode.value.trim().toUpperCase(),
			deviceMac: normalizeMac(macCode.value)
		})
		resetBindingForm()
		showBindSuccessModal()
		loadBoundDeviceSlots()
	} catch {
		// 接口层已统一提示错误，这里只负责恢复提交状态。
	} finally {
		bindingSubmitting.value = false
	}
}

function promptUnbind(slotId) {
	openConfirmDialog('\u89e3\u7ed1\u8bbe\u5907', '\u786e\u5b9a\u8981\u89e3\u7ed1\u8be5\u8bbe\u5907\u5417\uff1f', 'unbind', String(slotId || ''))
}
</script>

<style>
page {
	background: #eef3f8;
	color: #0f172a;
	font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.page {
	min-height: 100vh;
	background: linear-gradient(180deg, #f7fbff 0%, #eef3f8 38%, #e7edf5 100%);
	position: relative;
}

.hidden-scan-input {
	position: fixed;
	bottom: 0;
	left: -2000rpx;
	width: 10rpx;
	height: 10rpx;
	z-index: -1;
	opacity: 0;
	pointer-events: none;
	caret-color: transparent;
}
</style>


