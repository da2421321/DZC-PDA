<template>
	<view class="overlay dialog">
		<view class="dialog-card">
			<text class="dialog-title">{{ title }}</text>
			<text class="dialog-message">{{ message }}</text>
			<view class="dialog-actions">
				<view class="dialog-btn cancel" @tap="emit('close')">
					<text class="dialog-cancel-text">取消</text>
				</view>
				<view :class="['dialog-btn', 'confirm', danger ? 'danger' : '']" @tap="emit('confirm')">
					<text class="dialog-confirm-text">{{ confirmText }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	title: {
		type: String,
		default: ''
	},
	message: {
		type: String,
		default: ''
	},
	confirmText: {
		type: String,
		default: '确认'
	},
	danger: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['close', 'confirm'])
</script>

<style scoped>
.overlay {
	position: fixed;
	inset: 0;
	z-index: 50;
}

.dialog {
	background: rgba(15, 23, 42, 0.46);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 36rpx;
	box-sizing: border-box;
}

.dialog-card {
	width: 100%;
	border-radius: 30rpx;
	background: #ffffff;
	padding: 36rpx 30rpx 28rpx;
	box-sizing: border-box;
	box-shadow: 0 24rpx 60rpx rgba(15, 23, 42, 0.2);
}

.dialog-title {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	color: #0f172a;
	text-align: center;
	margin-bottom: 14rpx;
}

.dialog-message {
	display: block;
	font-size: 24rpx;
	line-height: 1.6;
	color: #475569;
	text-align: center;
	margin-bottom: 28rpx;
}

.dialog-actions {
	display: flex;
	gap: 16rpx;
}

.dialog-btn {
	flex: 1;
	height: 84rpx;
	border-radius: 22rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dialog-btn.cancel {
	background: #f1f5f9;
}

.dialog-btn.confirm {
	background: #1d4ed8;
}

.dialog-btn.confirm.danger {
	background: #ef4444;
}

.dialog-cancel-text,
.dialog-confirm-text {
	font-size: 26rpx;
	font-weight: 700;
}

.dialog-cancel-text {
	color: #475569;
}

.dialog-confirm-text {
	color: #ffffff;
}
</style>
