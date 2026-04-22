<template>
	<view class="page">
		<ScaleBindingFlow
			:top-offset="topOffset"
			:binding-step="bindingStep"
			:binding-page-title="bindingPageTitle"
			:factories="factoryOptions"
			:current-factory-name="currentFactoryName"
			:line-options="lineOptions"
			:current-line-name="currentLineName"
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
			@update-position="handlePositionInput"
			@update-mac="handleMacInput"
			@activate-scan-target="activateScanTarget"
			@open-scanner="openScanner"
			@confirm-bind="confirmBind"
			@prompt-unbind="promptUnbind"
		/>

		<input
			v-model="scanInputValue"
			class="scan-capture-input"
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
import { computed, reactive, ref } from 'vue'
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

const bindingStep = ref('factory')
const factoryOptions = ref(defaultFactories)
const lineOptions = ref([])
const selectedFactory = ref('')
const selectedLine = ref('')
const positionCode = ref('')
const macCode = ref('')
const scanTarget = ref('position')
const scanInputValue = ref('')
const scanInputFocus = ref(false)
const scannedPositionData = ref(null)
const bindingSubmitting = ref(false)
const unbindingSubmitting = ref(false)
const records = ref([])
let focusTimer = null
let inputTimer = null
let lineOptionsRequestId = 0
let boundSlotsRequestId = 0

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
	return '\u7535\u5b50\u79e4\u7ed1\u5b9a'
})
const canBind = computed(() => !!positionCode.value && !!macCode.value && !bindingSubmitting.value)
const workspaceRecords = computed(() => {
	return records.value.filter((item) => item.factoryId === selectedFactory.value && item.lineId === selectedLine.value && item.status === 'bound')
})
const confirmButtonText = computed(() => (confirmDialog.action === 'unbind' ? '\u786e\u8ba4\u89e3\u7ed1' : '\u786e\u8ba4'))

onLoad(() => {
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
		restoreScanFocus()
	}
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

function restoreScanFocus(delay = 120) {
	if (bindingStep.value !== 'workspace') return
	if (focusTimer) {
		clearTimeout(focusTimer)
		focusTimer = null
	}
	focusTimer = setTimeout(() => {
		scanInputFocus.value = true
	}, delay)
}

function releaseScanFocus() {
	scanInputFocus.value = false
	if (focusTimer) {
		clearTimeout(focusTimer)
		focusTimer = null
	}
}

function activateScanTarget(target) {
	if (target !== 'position' && target !== 'mac') return
	scanTarget.value = target
	restoreScanFocus(60)
}

function handleScanBlur() {
	scanInputFocus.value = false
	restoreScanFocus(200)
}

function handleScanInput() {
	if (bindingStep.value !== 'workspace') return
	if (inputTimer) {
		clearTimeout(inputTimer)
		inputTimer = null
	}
	inputTimer = setTimeout(() => {
		if (scanInputValue.value.trim()) {
			handleScanConfirm()
		}
	}, 120)
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
	showToast('\u4f4d\u7f6e\u626b\u7801\u6210\u529f')
}

function handleScanConfirm() {
	if (inputTimer) {
		clearTimeout(inputTimer)
		inputTimer = null
	}
	const rawValue = scanInputValue.value.trim()
	scanInputValue.value = ''
	if (!rawValue || bindingStep.value !== 'workspace') return
	applyScanValue(rawValue)
	restoreScanFocus(80)
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
	releaseScanFocus()
	if (inputTimer) {
		clearTimeout(inputTimer)
		inputTimer = null
	}
	positionCode.value = ''
	macCode.value = ''
	scannedPositionData.value = null
	scanInputValue.value = ''
	scanTarget.value = 'position'
}

function resetBindingFlow() {
	lineOptionsRequestId += 1
	boundSlotsRequestId += 1
	bindingStep.value = 'factory'
	selectedFactory.value = ''
	selectedLine.value = ''
	lineOptions.value = []
	resetBindingForm()
}

function handleBindingBack() {
	if (bindingStep.value === 'workspace') {
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

	const pages = getCurrentPages()
	if (pages.length > 1) {
		uni.navigateBack()
		return
	}

	uni.reLaunch({
		url: '/pages/index/index'
	})
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
			restoreScanFocus(120)
		} catch (error) {
			restoreScanFocus(120)
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
	restoreScanFocus(120)
}

function switchLine() {
	boundSlotsRequestId += 1
	bindingStep.value = 'line'
	selectedLine.value = ''
	resetBindingForm()
}

function handlePositionInput(event) {
	activateScanTarget('position')
	positionCode.value = event.detail.value.toUpperCase()
	scannedPositionData.value = null
}

function handleMacInput(event) {
	activateScanTarget('mac')
	macCode.value = event.detail.value.toUpperCase()
}

function openScanner(target) {
	activateScanTarget(target)
}

async function confirmBind() {
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
		showToast('\u7ed1\u5b9a\u6210\u529f')
		loadBoundDeviceSlots()
		restoreScanFocus(120)
	} catch (error) {
		restoreScanFocus(120)
	} finally {
		bindingSubmitting.value = false
	}
}

function promptUnbind(slotId) {
	openConfirmDialog('\u89e3\u7ed1\u8bbe\u5907', '\u786e\u5b9a\u8981\u89e3\u7ed1\u8be5\u8bbe\u5907\u5417\uff1f', 'unbind', String(slotId || ''))
}

onHide(() => {
	releaseScanFocus()
	if (inputTimer) {
		clearTimeout(inputTimer)
		inputTimer = null
	}
})

onUnload(() => {
	releaseScanFocus()
	if (inputTimer) {
		clearTimeout(inputTimer)
		inputTimer = null
	}
})
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

.scan-capture-input {
	position: fixed;
	left: -2000rpx;
	bottom: 0;
	width: 10rpx;
	height: 10rpx;
	opacity: 0;
	pointer-events: none;
	caret-color: transparent;
	z-index: -1;
}
</style>


