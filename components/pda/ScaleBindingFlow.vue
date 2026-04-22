<template>
	<view class="screen binding" :style="{ paddingTop: `${topOffset}px` }">
		<view class="top-nav">
			<view class="nav-side" @tap="emit('back')">
				<uni-icons type="left" color="#475569" size="30" />
			</view>
			<text class="nav-title">{{ bindingPageTitle }}</text>
		</view>

		<view v-if="bindingStep === 'factory'" class="select-panel">
			<text class="caption">请选择当前作业的厂区</text>
			<view
				v-for="factory in factories"
				:key="factory.id"
				class="select-card"
				@tap="emit('select-factory', factory.id)"
			>
				<view class="select-main">
					<view class="badge">
						<uni-icons type="shop-filled" color="#2563eb" size="30" />
					</view>
					<text class="select-title">{{ factory.name }}</text>
				</view>
				<uni-icons type="right" color="#9ca3af" size="24" />
			</view>
		</view>

		<view v-else-if="bindingStep === 'line'" class="select-panel">
			<view class="crumbs">
				<text class="crumb">{{ currentFactoryName }}</text>
				<text class="crumb sep">/</text>
				<text class="crumb mute">请选择产线</text>
			</view>
			<view
				v-for="line in lineOptions"
				:key="line.id"
				class="select-card"
				@tap="emit('select-line', line.id)"
			>
				<view class="select-main">
					<view class="badge">
						<uni-icons type="list" color="#2563eb" size="30" />
					</view>
					<text class="select-title">{{ line.name }}</text>
				</view>
				<uni-icons type="right" color="#9ca3af" size="24" />
			</view>
		</view>

		<view v-else class="workspace">
			<view class="workspace-bar">
				<text class="workspace-text">{{ currentFactoryName }} / {{ currentLineName }}</text>
				<text class="workspace-switch" @tap="emit('switch-line')">切换</text>
			</view>

			<scroll-view class="workspace-scroll" scroll-y="true">
				<view class="form-item">
					<text class="label">1. 扫描位置</text>
					<view :class="['scan-row', scanTarget === 'position' ? 'active' : '']">
						<input
							class="scan-input"
							:value="positionCode"
							placeholder="扫描位置二维码"
							placeholder-class="placeholder"
							@input="emit('update-position', $event)"
							@focus="emit('activate-scan-target', 'position')"
						/>
						<view class="scan-btn" @tap="emit('open-scanner', 'position')">
							<text class="scan-btn-text">扫码</text>
						</view>
					</view>
					<view v-if="scannedPositionData" class="tag">
						<text class="tag-text">品种：{{ scannedPositionData.variety }}</text>
					</view>
				</view>

				<view class="form-item">
					<text class="label">2. 扫描电子称</text>
					<view :class="['scan-row', scanTarget === 'mac' ? 'active' : '']">
						<input
							class="scan-input"
							:value="macCode"
							placeholder="扫描设备二维码"
							placeholder-class="placeholder"
							@input="emit('update-mac', $event)"
							@focus="emit('activate-scan-target', 'mac')"
						/>
						<view class="scan-btn" @tap="emit('open-scanner', 'mac')">
							<text class="scan-btn-text">扫码</text>
						</view>
					</view>
				</view>

				<view class="scan-target-tip">
					<text class="scan-target-tip-text">当前扫码目标：{{ scanTarget === 'mac' ? 'MAC 输入框' : '位置输入框' }}</text>
				</view>

				<view :class="['primary-btn', canBind ? '' : 'disabled']" @tap="emit('confirm-bind')">
					<text class="primary-btn-text">确认绑定</text>
				</view>

				<view class="records">
					<text class="records-title">已绑定设备 ({{ workspaceRecords.length }})</text>
					<view v-if="workspaceRecords.length">
						<view v-for="record in workspaceRecords" :key="record.id" class="record-card">
							<view class="record-main">
								<view class="record-row">
									<text class="record-pos">{{ record.positionId }}</text>
									<text class="record-variety">{{ record.variety }}</text>
								</view>
								<text class="record-mac">MAC: {{ record.macAddress }}</text>
								<text class="record-time">{{ formatRecordTime(record.bindTime) }}</text>
							</view>
							<view class="danger-btn" @tap="emit('prompt-unbind', record.slotId || record.id)">
								<text class="danger-btn-text">解绑</text>
							</view>
						</view>
					</view>
					<view v-else class="empty">
						<text class="empty-text">该产线暂无绑定记录</text>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	topOffset: {
		type: Number,
		default: 64
	},
	bindingStep: {
		type: String,
		default: 'factory'
	},
	bindingPageTitle: {
		type: String,
		default: ''
	},
	factories: {
		type: Array,
		default: () => []
	},
	currentFactoryName: {
		type: String,
		default: ''
	},
	lineOptions: {
		type: Array,
		default: () => []
	},
	currentLineName: {
		type: String,
		default: ''
	},
	positionCode: {
		type: String,
		default: ''
	},
	macCode: {
		type: String,
		default: ''
	},
	scanTarget: {
		type: String,
		default: 'position'
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
})

const emit = defineEmits([
	'back',
	'select-factory',
	'select-line',
	'switch-line',
	'update-position',
	'update-mac',
	'activate-scan-target',
	'open-scanner',
	'confirm-bind',
	'prompt-unbind'
])

function formatRecordTime(value) {
	const parts = String(value).split(' ')
	return parts[1] || value
}
</script>

<style scoped>
.binding {
	height: 100vh;
	padding-left: 0;
	padding-right: 0;
	display: flex;
	flex-direction: column;
	background: #f5f7fb;
}

.top-nav {
	padding: calc(var(--status-bar-height, 44px) + 16rpx) 20rpx 24rpx;
	background: #ffffff;
	box-shadow: 0 4rpx 18rpx rgba(15, 23, 42, 0.08);
	display: flex;
	align-items: center;
	position: relative;
	z-index: 2;
}

.nav-side {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.nav-title {
	margin-left: 12rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: #0f172a;
}

.select-panel {
	flex: 1;
	padding: 34rpx 24rpx 40rpx;
}

.caption {
	display: block;
	margin-bottom: 20rpx;
	font-size: 26rpx;
	line-height: 1.4;
	color: #64748b;
}

.select-card {
	min-height: 142rpx;
	padding: 0 32rpx;
	box-sizing: border-box;
	border-radius: 34rpx;
	background: #ffffff;
	border: 2rpx solid #eef2f7;
	box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.08);
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 20rpx;
}

.select-main {
	display: flex;
	align-items: center;
	min-width: 0;
}

.badge {
	width: 84rpx;
	height: 84rpx;
	border-radius: 50%;
	background: #eaf2ff;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 24rpx;
	flex-shrink: 0;
}

.select-title {
	font-size: 34rpx;
	font-weight: 500;
	color: #0f172a;
}

.crumbs {
	display: flex;
	align-items: center;
	margin-bottom: 18rpx;
	padding-left: 4rpx;
}

.crumb {
	font-size: 22rpx;
	color: #64748b;
}

.crumb.sep {
	margin: 0 10rpx;
}

.crumb.mute {
	color: #94a3b8;
}

.workspace {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 0;
}

.workspace-bar {
	padding: 18rpx 24rpx;
	background: #dbeafe;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.workspace-text {
	font-size: 22rpx;
	font-weight: 700;
	color: #1e40af;
}

.workspace-switch {
	font-size: 22rpx;
	font-weight: 700;
	color: #2563eb;
}

.workspace-scroll {
	flex: 1;
	height: 0;
	padding: 26rpx 24rpx 28rpx;
	box-sizing: border-box;
}

.form-item {
	margin-bottom: 24rpx;
}

.label {
	display: block;
	font-size: 22rpx;
	font-weight: 600;
	color: #334155;
	margin-bottom: 12rpx;
	padding-left: 4rpx;
}

.scan-row {
	display: flex;
	align-items: center;
	gap: 14rpx;
}

.scan-row.active .scan-input {
	border: 2rpx solid #93c5fd;
	box-shadow: 0 0 0 4rpx rgba(37, 99, 235, 0.12);
}

.scan-input {
	flex: 1;
	height: 88rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 12rpx 32rpx rgba(148, 163, 184, 0.1);
	padding: 0 24rpx;
	box-sizing: border-box;
	font-size: 28rpx;
	color: #0f172a;
}

.placeholder {
	color: #94a3b8;
}

.scan-btn {
	width: 104rpx;
	height: 88rpx;
	border-radius: 24rpx;
	background: #eff6ff;
	border: 2rpx solid #bfdbfe;
	display: flex;
	align-items: center;
	justify-content: center;
}

.scan-btn-text {
	display: block;
	width: 40rpx;
	height: 40rpx;
	font-size: 0;
	line-height: 0;
	color: transparent;
	overflow: hidden;
	background:
		linear-gradient(#2563eb, #2563eb) left top / 12rpx 4rpx no-repeat,
		linear-gradient(#2563eb, #2563eb) left top / 4rpx 12rpx no-repeat,
		linear-gradient(#2563eb, #2563eb) right top / 12rpx 4rpx no-repeat,
		linear-gradient(#2563eb, #2563eb) right top / 4rpx 12rpx no-repeat,
		linear-gradient(#2563eb, #2563eb) left bottom / 12rpx 4rpx no-repeat,
		linear-gradient(#2563eb, #2563eb) left bottom / 4rpx 12rpx no-repeat,
		linear-gradient(#2563eb, #2563eb) right bottom / 12rpx 4rpx no-repeat,
		linear-gradient(#2563eb, #2563eb) right bottom / 4rpx 12rpx no-repeat,
		linear-gradient(#2563eb, #2563eb) 12rpx 18rpx / 4rpx 12rpx no-repeat,
		linear-gradient(#2563eb, #2563eb) 18rpx 10rpx / 4rpx 20rpx no-repeat,
		linear-gradient(#2563eb, #2563eb) 24rpx 14rpx / 4rpx 16rpx no-repeat;
}

.scan-target-tip {
	margin-top: -4rpx;
	margin-bottom: 18rpx;
}

.scan-target-tip-text {
	font-size: 22rpx;
	color: #475569;
}

.tag {
	margin-top: 12rpx;
	display: inline-flex;
	padding: 10rpx 18rpx;
	border-radius: 99rpx;
	background: #eff6ff;
}

.tag-text {
	font-size: 20rpx;
	color: #1d4ed8;
}

.primary-btn {
	height: 92rpx;
	border-radius: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 22rpx 48rpx rgba(37, 99, 235, 0.2);
	background: linear-gradient(140deg, #2563eb 0%, #1d4ed8 100%);
}

.primary-btn.disabled {
	background: #cbd5e1;
	box-shadow: none;
}

.primary-btn-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
}

.records {
	margin-top: 14rpx;
	padding-bottom: 12rpx;
}

.records-title {
	display: block;
	font-size: 26rpx;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 16rpx;
}

.record-card {
	padding: 24rpx;
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 14rpx 32rpx rgba(148, 163, 184, 0.1);
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.record-main {
	flex: 1;
	min-width: 0;
	padding-right: 16rpx;
}

.record-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 10rpx;
	margin-bottom: 8rpx;
}

.record-pos {
	font-size: 26rpx;
	font-weight: 600;
	color: #0f172a;
}

.record-variety {
	padding: 4rpx 12rpx;
	border-radius: 99rpx;
	background: #f1f5f9;
	font-size: 18rpx;
	color: #64748b;
}

.record-mac {
	display: block;
	font-size: 22rpx;
	color: #475569;
	margin-bottom: 8rpx;
}

.record-time {
	display: block;
	font-size: 22rpx;
	color: #64748b;
}

.danger-btn {
	min-width: 100rpx;
	height: 64rpx;
	padding: 0 18rpx;
	border-radius: 20rpx;
	background: #fef2f2;
	display: flex;
	align-items: center;
	justify-content: center;
}

.danger-btn-text {
	font-size: 24rpx;
	font-weight: 700;
	color: #ef4444;
}

.empty {
	padding: 44rpx 20rpx;
	border-radius: 28rpx;
	border: 2rpx dashed #cbd5e1;
	background: rgba(255, 255, 255, 0.76);
	display: flex;
	align-items: center;
	justify-content: center;
}

.empty-text {
	display: block;
	font-size: 22rpx;
	color: #64748b;
}
</style>
