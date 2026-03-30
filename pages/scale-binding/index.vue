<template>
	<view class="page">
		<ScaleBindingFlow
			:top-offset="topOffset"
			:binding-step="bindingStep"
			:binding-page-title="bindingPageTitle"
			:factories="factories"
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
import ConfirmDialog from '../../components/pda/ConfirmDialog.vue'
import ScaleBindingFlow from '../../components/pda/ScaleBindingFlow.vue'
import {
	factories,
	formatDateTime,
	getAuthAccount,
	getBindingRecords,
	lineMap,
	normalizeMac,
	saveBindingRecords
} from '../../utils/pda'

const bindingStep = ref('factory')
const selectedFactory = ref('')
const selectedLine = ref('')
const positionCode = ref('')
const macCode = ref('')
const scanTarget = ref('position')
const scanInputValue = ref('')
const scanInputFocus = ref(false)
const scannedPositionData = ref(null)
const records = ref([])
let focusTimer = null
let inputTimer = null

const confirmDialog = reactive({
	visible: false,
	title: '',
	message: '',
	action: '',
	payload: ''
})

const topOffset = 0
const lineOptions = computed(() => lineMap[selectedFactory.value] || [])
const currentFactoryName = computed(() => (factories.find((item) => item.id === selectedFactory.value) || {}).name || '')
const currentLineName = computed(() => (lineOptions.value.find((item) => item.id === selectedLine.value) || {}).name || '')
const bindingPageTitle = computed(() => {
	if (bindingStep.value === 'factory') return '\u9009\u62e9\u5382\u533a'
	if (bindingStep.value === 'line') return '\u9009\u62e9\u4ea7\u7ebf'
	return '\u7535\u5b50\u79e4\u7ed1\u5b9a'
})
const canBind = computed(() => !!positionCode.value && !!macCode.value)
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
	if (bindingStep.value === 'workspace') {
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
	bindingStep.value = 'factory'
	selectedFactory.value = ''
	selectedLine.value = ''
	resetBindingForm()
}

function handleBindingBack() {
	if (bindingStep.value === 'workspace') {
		bindingStep.value = 'line'
		selectedLine.value = ''
		resetBindingForm()
		return
	}

	if (bindingStep.value === 'line') {
		bindingStep.value = 'factory'
		selectedFactory.value = ''
		selectedLine.value = ''
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

function handleConfirmDialog() {
	if (confirmDialog.action === 'unbind') {
		records.value = records.value.filter((item) => item.id !== confirmDialog.payload)
		saveBindingRecords(records.value)
		closeConfirmDialog()
		showToast('\u89e3\u7ed1\u6210\u529f')
	}
}

function selectFactory(factoryId) {
	selectedFactory.value = factoryId
	selectedLine.value = ''
	bindingStep.value = 'line'
}

function selectLine(lineId) {
	selectedLine.value = lineId
	bindingStep.value = 'workspace'
	resetBindingForm()
	restoreScanFocus(120)
}

function switchLine() {
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

function confirmBind() {
	if (!canBind.value) {
		showToast('\u8bf7\u5b8c\u5584\u7ed1\u5b9a\u4fe1\u606f')
		return
	}

	const nextRecord = {
		id: `${Date.now()}`,
		factoryId: selectedFactory.value,
		lineId: selectedLine.value,
		positionId: positionCode.value.trim().toUpperCase(),
		variety: scannedPositionData.value ? scannedPositionData.value.variety : '\u6df7\u5408\u5e9f\u6599',
		macAddress: normalizeMac(macCode.value),
		status: 'bound',
		bindTime: formatDateTime(new Date())
	}

	records.value = [nextRecord].concat(
		records.value.filter((item) => {
			return !(item.factoryId === selectedFactory.value && item.lineId === selectedLine.value && item.positionId === nextRecord.positionId)
		})
	)

	saveBindingRecords(records.value)
	resetBindingForm()
	showToast('\u7ed1\u5b9a\u6210\u529f')
}

function promptUnbind(recordId) {
	openConfirmDialog('\u89e3\u7ed1\u8bbe\u5907', '\u786e\u5b9a\u8981\u89e3\u7ed1\u8be5\u8bbe\u5907\u5417\uff1f', 'unbind', recordId)
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


