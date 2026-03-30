<template>
	<view class="screen login">
		<view class="brand">
			<text class="brand-title">GRACER</text>
			<text class="brand-sub">格瑞哲·织循环</text>
			<text class="brand-slogan">"为地球织一件绿衣裳"</text>
		</view>

		<view class="hero">
			<image class="hero-image" :src="loginHero" mode="aspectFill" />
			<view class="hero-mask">
				<text class="hero-tag">Android PDA</text>
				<text class="hero-text">仓储绑定作业终端</text>
			</view>
		</view>

		<view class="field-wrap">
			<view class="field">
				<input
					class="input"
					:value="account"
					placeholder="请输入账号"
					placeholder-class="placeholder"
					@focus="emit('focus-account')"
					@blur="emit('blur-account')"
					@input="emit('update-account', $event)"
				/>
				<view class="field-btn" @tap.stop="emit('toggle-account-dropdown')">
					<text class="field-btn-text">账号</text>
				</view>
			</view>

			<view v-if="showAccountList && savedAccounts.length" class="dropdown">
				<view
					v-for="item in savedAccounts"
					:key="item.account"
					class="dropdown-item"
					@tap.stop="emit('select-account', item)"
				>
					<text class="dropdown-text">{{ item.account }}</text>
				</view>
			</view>
		</view>

		<view class="field">
			<input
				class="input"
				:value="password"
				:password="!showPassword"
				placeholder="请输入密码"
				placeholder-class="placeholder"
				@input="emit('update-password', $event)"
			/>
			<view class="field-btn" @tap.stop="emit('toggle-password')">
				<text class="field-btn-text">{{ showPassword ? '隐藏' : '显示' }}</text>
			</view>
		</view>

		<view class="remember" @tap="emit('toggle-remember')">
			<view :class="['check', rememberPassword ? 'active' : '']">
				<text v-if="rememberPassword" class="check-text">✓</text>
			</view>
			<text class="remember-text">记住密码</text>
		</view>

		<view class="primary-btn" @tap="emit('login')">
			<text class="primary-btn-text">登录</text>
		</view>
	</view>
</template>

<script setup>
defineProps({
	loginHero: {
		type: String,
		default: ''
	},
	account: {
		type: String,
		default: ''
	},
	password: {
		type: String,
		default: ''
	},
	showPassword: {
		type: Boolean,
		default: false
	},
	rememberPassword: {
		type: Boolean,
		default: true
	},
	showAccountList: {
		type: Boolean,
		default: false
	},
	savedAccounts: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits([
	'focus-account',
	'blur-account',
	'toggle-account-dropdown',
	'select-account',
	'update-account',
	'update-password',
	'toggle-password',
	'toggle-remember',
	'login'
])
</script>

<style scoped>
.screen {
	min-height: 100vh;
	box-sizing: border-box;
	padding-top: 88rpx;
	padding-left: 32rpx;
	padding-right: 32rpx;
	padding-bottom: 40rpx;
}

.brand {
	text-align: center;
	margin-bottom: 32rpx;
}

.brand-title {
	display: block;
	font-size: 48rpx;
	font-weight: 700;
	letter-spacing: 14rpx;
	margin-bottom: 8rpx;
}

.brand-sub {
	display: block;
	font-size: 22rpx;
	color: #64748b;
}

.brand-slogan {
	display: block;
	font-size: 22rpx;
	color: #334155;
	margin-top: 18rpx;
}

.hero {
	position: relative;
	height: 280rpx;
	border-radius: 30rpx;
	overflow: hidden;
	box-shadow: 0 24rpx 60rpx rgba(37, 99, 235, 0.16);
	margin-bottom: 28rpx;
}

.hero-image {
	width: 100%;
	height: 100%;
}

.hero-mask {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 24rpx;
	background: linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.76) 100%);
}

.hero-tag {
	display: inline-flex;
	padding: 8rpx 16rpx;
	border-radius: 99rpx;
	background: rgba(255, 255, 255, 0.18);
	color: #ffffff;
	font-size: 20rpx;
	margin-bottom: 12rpx;
}

.hero-text {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #ffffff;
}

.field-wrap {
	position: relative;
	z-index: 3;
}

.field {
	height: 92rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.94);
	border: 2rpx solid rgba(148, 163, 184, 0.18);
	box-shadow: 0 14rpx 36rpx rgba(148, 163, 184, 0.1);
	display: flex;
	align-items: center;
	padding: 0 20rpx 0 28rpx;
	box-sizing: border-box;
	margin-bottom: 20rpx;
}

.input {
	flex: 1;
	height: 92rpx;
	font-size: 28rpx;
	color: #0f172a;
}

.placeholder {
	color: #94a3b8;
}

.field-btn {
	height: 56rpx;
	padding: 0 20rpx;
	border-radius: 99rpx;
	background: #eff6ff;
	display: flex;
	align-items: center;
	justify-content: center;
}

.field-btn-text {
	font-size: 22rpx;
	font-weight: 600;
	color: #2563eb;
}

.dropdown {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	margin-top: -8rpx;
	border-radius: 24rpx;
	background: #ffffff;
	box-shadow: 0 18rpx 40rpx rgba(15, 23, 42, 0.12);
	overflow: hidden;
}

.dropdown-item {
	padding: 22rpx 28rpx;
}

.dropdown-text {
	font-size: 24rpx;
	color: #1e293b;
}

.remember {
	display: flex;
	align-items: center;
	margin: 8rpx 0 28rpx;
}

.check {
	width: 30rpx;
	height: 30rpx;
	border-radius: 10rpx;
	border: 2rpx solid #cbd5e1;
	background: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check.active {
	background: #0f172a;
	border-color: #0f172a;
}

.check-text {
	font-size: 18rpx;
	color: #ffffff;
}

.remember-text {
	font-size: 24rpx;
	color: #475569;
	margin-left: 14rpx;
}

.primary-btn {
	height: 92rpx;
	border-radius: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
	box-shadow: 0 22rpx 44rpx rgba(15, 23, 42, 0.16);
}

.primary-btn-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
}
</style>
