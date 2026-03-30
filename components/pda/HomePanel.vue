<template>
	<view class="home-page">
		<view class="header">
			<view class="brand">
				<text class="brand-name">GRACER</text>
				<text class="brand-slogan">{{ brandSubtitle }}</text>
			</view>
			<view class="user-info">
				<text class="welcome">{{ welcomeLabel }}{{ currentUserName || defaultUserName }}</text>
				<view class="logout-btn" @tap="emit('logout')">
					<uni-icons type="redo" color="#64748b" size="22" />
				</view>
			</view>
		</view>

		<view class="card-container">
			<view
				v-for="item in modules"
				:key="item.id"
				class="function-card"
				:class="`card-${item.theme || 'blue'}`"
				@tap="emit('select-module', item.id)"
			>
				<view class="card-icon">
					<uni-icons v-if="item.iconType" :type="item.iconType" color="#ffffff" size="30" />
					<image v-else-if="item.iconPath" class="icon-img" :src="item.iconPath" mode="aspectFit" />
					<text v-else class="icon-fallback">{{ item.icon }}</text>
				</view>
				<view class="card-content">
					<text class="card-title">{{ item.title }}</text>
					<text class="card-desc">{{ item.description }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	currentUserName: {
		type: String,
		default: ''
	},
	modules: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['logout', 'select-module'])

const welcomeLabel = '\u6b22\u8fce\uff0c'
const defaultUserName = '\u64cd\u4f5c\u5458'
const brandSubtitle = '\u683c\u745e\u54f2\u00b7\u7ec7\u5faa\u73af'
</script>

<style scoped>
.home-page {
	min-height: 100vh;
	padding: 0 40rpx;
	padding-top: calc(var(--status-bar-height, 44px) + 40rpx);
	box-sizing: border-box;
	background: #ffffff;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 48rpx;
}

.brand {
	display: flex;
	flex-direction: column;
}

.brand-name {
	font-size: 56rpx;
	font-weight: 700;
	color: #1f2937;
	letter-spacing: 4rpx;
}

.brand-slogan {
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #6b7280;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.welcome {
	font-size: 28rpx;
	color: #374151;
	font-weight: 500;
}

.logout-btn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.8);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
}

.logout-icon {
	width: 36rpx;
	height: 36rpx;
}

.card-container {
	display: flex;
	flex-wrap: wrap;
	gap: 32rpx;
}

.function-card {
	width: calc((100% - 32rpx) / 2);
	min-height: 280rpx;
	padding: 32rpx;
	box-sizing: border-box;
	border-radius: 32rpx;
	display: flex;
	flex-direction: column;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.card-icon {
	width: 96rpx;
	height: 96rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.25);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24rpx;
}

.icon-img {
	width: 48rpx;
	height: 48rpx;
}

.icon-fallback {
	font-size: 48rpx;
	line-height: 1;
	color: #ffffff;
}

.card-content {
	margin-top: 30rpx;
}

.card-title {
	display: block;
	margin-bottom: 12rpx;
	font-size: 36rpx;
	font-weight: 700;
	color: #ffffff;
}

.card-desc {
	font-size: 24rpx;
	line-height: 1.4;
	color: rgba(255, 255, 255, 0.85);
}

.card-blue {
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}
</style>
