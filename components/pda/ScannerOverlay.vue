<template>
	<view class="overlay scanner">
		<view class="scanner-close-row">
			<view class="ghost-btn scanner-close" @tap="emit('close')">
				<text class="ghost-btn-text">关闭</text>
			</view>
		</view>

		<view class="scanner-main">
			<view class="scanner-box">
				<view class="corner tl" />
				<view class="corner tr" />
				<view class="corner bl" />
				<view class="corner br" />
				<view class="scanner-line" />
			</view>
			<text class="scanner-title">{{ scannerTitle }}</text>
			<text class="scanner-desc">将二维码放入框内即可自动扫描</text>
			<view class="primary-btn" @tap="emit('complete')">
				<text class="primary-btn-text">模拟扫描成功</text>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	scannerTitle: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['close', 'complete'])
</script>

<style scoped>
.overlay {
	position: fixed;
	inset: 0;
	z-index: 50;
}

.scanner {
	background: rgba(15, 23, 42, 0.96);
	display: flex;
	flex-direction: column;
}

.scanner-close-row {
	padding: calc(env(safe-area-inset-top) + 24rpx) 24rpx 12rpx;
	display: flex;
	justify-content: flex-end;
}

.ghost-btn {
	min-width: 112rpx;
	height: 64rpx;
	padding: 0 22rpx;
	border-radius: 99rpx;
	background: rgba(255, 255, 255, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
}

.ghost-btn-text {
	font-size: 22rpx;
	font-weight: 600;
	color: #ffffff;
}

.scanner-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0 40rpx 80rpx;
	box-sizing: border-box;
}

.scanner-box {
	width: 560rpx;
	height: 560rpx;
	border-radius: 36rpx;
	border: 4rpx solid rgba(59, 130, 246, 0.7);
	position: relative;
	margin-bottom: 42rpx;
}

.corner {
	position: absolute;
	width: 72rpx;
	height: 72rpx;
	border-color: #60a5fa;
	border-style: solid;
}

.tl {
	top: -4rpx;
	left: -4rpx;
	border-width: 6rpx 0 0 6rpx;
	border-top-left-radius: 20rpx;
}

.tr {
	top: -4rpx;
	right: -4rpx;
	border-width: 6rpx 6rpx 0 0;
	border-top-right-radius: 20rpx;
}

.bl {
	left: -4rpx;
	bottom: -4rpx;
	border-width: 0 0 6rpx 6rpx;
	border-bottom-left-radius: 20rpx;
}

.br {
	right: -4rpx;
	bottom: -4rpx;
	border-width: 0 6rpx 6rpx 0;
	border-bottom-right-radius: 20rpx;
}

.scanner-line {
	position: absolute;
	left: 20rpx;
	right: 20rpx;
	height: 6rpx;
	border-radius: 99rpx;
	background: linear-gradient(90deg, rgba(96, 165, 250, 0) 0%, #60a5fa 50%, rgba(96, 165, 250, 0) 100%);
	box-shadow: 0 0 28rpx rgba(96, 165, 250, 0.8);
	animation: scan 2.2s ease-in-out infinite;
}

.scanner-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #ffffff;
	margin-bottom: 12rpx;
}

.scanner-desc {
	display: block;
	font-size: 22rpx;
	color: #cbd5e1;
	margin-bottom: 32rpx;
}

.primary-btn {
	height: 92rpx;
	padding: 0 36rpx;
	border-radius: 28rpx;
	background: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
}

.primary-btn-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #2563eb;
}

@keyframes scan {
	0% {
		top: 28rpx;
	}

	50% {
		top: calc(100% - 34rpx);
	}

	100% {
		top: 28rpx;
	}
}
</style>
