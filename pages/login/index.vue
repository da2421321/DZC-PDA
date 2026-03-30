<template>
	<view class="login-container">
		<view class="brand-section">
			<text class="app-name">GRACER</text>
			<text class="app-slogan">格瑞哲·织循环</text>
			<text class="app-tagline">"为地球织一件绿衣裳"</text>
		</view>

		<view class="product-image-wrapper">
			<image class="product-image" :src="loginHero" mode="aspectFill" />
		</view>

		<view class="form-section">
			<view class="input-wrapper">
				<input
					class="input-field"
					:value="form.account"
					type="text"
					placeholder="请输入账号"
					placeholder-class="placeholder"
					@input="handleAccountInput"
					@focus="showAccountList = true"
					@blur="handleBlur"
				/>
				<view v-if="showAccountList && savedAccounts.length > 0" class="account-dropdown">
					<view
						v-for="(account, index) in savedAccounts"
						:key="`${account.account}-${index}`"
						class="account-item"
						@tap.stop="selectAccount(account)"
					>
						<text class="account-text">{{ account.account }}</text>
					</view>
				</view>
			</view>

			<view class="input-wrapper password-wrapper">
				<input
					class="input-field"
					:value="form.password"
					:password="!showPassword"
					placeholder="请输入密码"
					placeholder-class="placeholder"
					@input="handlePasswordInput"
				/>
				<view class="password-toggle" @tap="togglePassword">
					<uni-icons :type="showPassword ? 'eye-slash' : 'eye'" size="18" color="#999999" />
				</view>
			</view>

			<view class="remember-section">
				<checkbox-group @change="onRememberChange">
					<label class="remember-label">
						<checkbox :checked="rememberPassword" value="remember" />
						<text class="remember-text">记住密码</text>
					</label>
				</checkbox-group>
			</view>

			<button class="login-btn" :loading="isLoading" @tap="handleLogin">
				{{ isLoading ? '登录中...' : '登录' }}
			</button>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import {
	getAuthAccount,
	getSavedAccounts,
	loginHero,
	saveSavedAccounts,
	setAuthAccount
} from '../../utils/pda'

const REMEMBER_PASSWORD_KEY = 'rememberPassword'

const form = reactive({
	account: '',
	password: ''
})

const isLoading = ref(false)
const showPassword = ref(false)
const rememberPassword = ref(uni.getStorageSync(REMEMBER_PASSWORD_KEY) !== false)
const showAccountList = ref(false)
const savedAccounts = ref([])

let hideTimer = null

onLoad(() => {
	syncSavedAccounts()
})

onShow(() => {
	const currentAccount = getAuthAccount()
	if (currentAccount) {
		uni.reLaunch({
			url: '/pages/index/index'
		})
		return
	}

	syncSavedAccounts()
})

onUnload(() => {
	if (hideTimer) {
		clearTimeout(hideTimer)
		hideTimer = null
	}
})

function syncSavedAccounts() {
	savedAccounts.value = getSavedAccounts()

	if (rememberPassword.value && savedAccounts.value.length > 0) {
		const [lastAccount] = savedAccounts.value
		form.account = lastAccount.account || ''
		form.password = lastAccount.password || ''
		return
	}

	if (!rememberPassword.value) {
		form.password = ''
	}
}

function handleAccountInput(event) {
	form.account = event.detail.value
}

function handlePasswordInput(event) {
	form.password = event.detail.value
}

function handleBlur() {
	if (hideTimer) {
		clearTimeout(hideTimer)
	}

	hideTimer = setTimeout(() => {
		showAccountList.value = false
	}, 200)
}

function selectAccount(account) {
	form.account = account.account
	form.password = account.password
	showAccountList.value = false
}

function togglePassword() {
	showPassword.value = !showPassword.value
}

function onRememberChange(event) {
	rememberPassword.value = event.detail.value.includes('remember')
	uni.setStorageSync(REMEMBER_PASSWORD_KEY, rememberPassword.value)

	if (!rememberPassword.value) {
		form.password = ''
		savedAccounts.value = []
		saveSavedAccounts([])
	}
}

function saveAccount() {
	if (!rememberPassword.value || !form.account || !form.password) {
		return
	}

	const nextAccounts = savedAccounts.value.filter((item) => item.account !== form.account)
	nextAccounts.unshift({
		account: form.account,
		password: form.password
	})

	savedAccounts.value = nextAccounts.slice(0, 5)
	saveSavedAccounts(savedAccounts.value)
}

function showToast(title) {
	uni.showToast({
		title,
		icon: 'none'
	})
}

function handleLogin() {
	if (isLoading.value) {
		return
	}

	if (!form.account.trim() || !form.password.trim()) {
		showToast('请输入账号和密码')
		return
	}

	isLoading.value = true

	setTimeout(() => {
		uni.setStorageSync('token', `mock-token-${Date.now()}`)
		saveAccount()
		setAuthAccount(form.account.trim())
		showAccountList.value = false
		isLoading.value = false

		uni.showToast({
			title: '登录成功',
			icon: 'success'
		})

		setTimeout(() => {
			uni.reLaunch({
				url: '/pages/index/index'
			})
		}, 600)
	}, 300)
}
</script>

<style lang="scss" scoped>
.login-container {
	min-height: 100vh;
	background-color: #ffffff;
	display: flex;
	flex-direction: column;
	padding: 80rpx 32rpx 48rpx;
	box-sizing: border-box;
	overflow-y: auto;
}

.brand-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 64rpx;
	margin-bottom: 32rpx;
}

.app-name {
	font-size: 48rpx;
	font-weight: 700;
	color: #1f2937;
	letter-spacing: 0.3em;
	margin-bottom: 12rpx;
}

.app-slogan {
	font-size: 24rpx;
	color: #858585;
	margin-bottom: 24rpx;
}

.app-tagline {
	font-size: 24rpx;
	color: #666666;
	margin-top: 24rpx;
}

.product-image-wrapper {
	margin: 32rpx 0 40rpx;
}

.product-image {
	width: 100%;
	height: 280rpx;
	border-radius: 24rpx;
}

.form-section {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.input-wrapper {
	position: relative;
	width: 100%;
}

.input-field {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	border: 2rpx solid #e5e5e5;
	border-radius: 16rpx;
	background-color: #ffffff;
	color: #1f2937;
	box-sizing: border-box;
}

.placeholder {
	color: #999999;
}

.account-dropdown {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	margin-top: 8rpx;
	background-color: #ffffff;
	border: 2rpx solid #e5e5e5;
	border-radius: 16rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	z-index: 100;
	max-height: 256rpx;
	overflow-y: auto;
}

.account-item {
	padding: 20rpx 24rpx;
	border-bottom: 2rpx solid #f5f5f5;
}

.account-item:last-child {
	border-bottom: none;
}

.account-text {
	font-size: 24rpx;
	color: #1f2937;
}

.password-wrapper .input-field {
	padding-right: 96rpx;
}

.password-toggle {
	position: absolute;
	right: 24rpx;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8rpx;
}

.remember-section {
	margin-bottom: 40rpx;
}

.remember-label {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.remember-text {
	font-size: 24rpx;
	color: #666666;
}

.login-btn {
	width: 100%;
	height: 88rpx;
	background-color: #000000;
	color: #ffffff;
	font-size: 28rpx;
	font-weight: 500;
	border-radius: 16rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
}

.login-btn::after {
	border: none;
}
</style>
