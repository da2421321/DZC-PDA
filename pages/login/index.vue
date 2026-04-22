<template>
	<view class="login-container">
		<!-- 品牌标题 -->
		<view class="brand-section">
			<text class="app-name">GRACER</text>
			<text class="app-slogan">格瑞哲·织循环</text>
			<text class="app-tagline">"为地球织一件绿衣裳"</text>
		</view>

		<!-- 产品图片 -->
		<view class="product-image-wrapper">
			<image class="product-image" src="/static/images/product-placeholder.jpg" mode="aspectFill" />
		</view>

		<!-- 表单区域 -->
		<view class="form-section">
			<!-- 账号输入框 -->
			<view class="input-wrapper" style="margin-bottom: 20rpx;">
				<input
					class="input-field"
					v-model="form.username"
					type="text"
					placeholder="请输入账号"
					placeholder-class="placeholder"
					placeholder-style="font-size: 42rpx; color: #999;"
					@focus="showAccountList = true"
					@blur="handleBlur"
				/>
				<view v-if="showAccountList && savedAccounts.length > 0" class="account-dropdown">
					<view
						v-for="(account, index) in savedAccounts"
						:key="index"
						class="account-item"
						@tap.stop="selectAccount(account)"
					>
						<text class="account-text">{{ account.username }}</text>
					</view>
				</view>
			</view>

			<!-- 密码输入框 -->
			<view class="input-wrapper password-wrapper" style="margin-bottom: 20rpx;">
				<input
					class="input-field"
					v-model="form.password"
					:password="!showPassword"
					placeholder="请输入密码"
					placeholder-class="placeholder"
					placeholder-style="font-size: 42rpx; color: #999;"
				/>
				<view class="password-toggle" @click="togglePassword">
					<uni-icons :type="showPassword ? 'eye-slash' : 'eye'" size="18" color="#999"></uni-icons>
				</view>
			</view>

			<!-- 记住密码 -->
			<view class="remember-section">
				<checkbox-group @change="onRememberChange">
					<label class="remember-label">
						<checkbox :checked="rememberPassword" value="remember" />
						<text class="remember-text">记住密码</text>
					</label>
				</checkbox-group>
			</view>

			<!-- 登录按钮 -->
			<button class="login-btn" :loading="isLoading" @click="handleLogin">
				{{ isLoading ? '登录中...' : '登录' }}
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { login } from '../../api/user'
import { setAuthAccount } from '@/utils/pda'

interface LoginForm {
	username: string
	password: string
}

interface SavedAccount {
	username: string
	password: string
}

const form = reactive<LoginForm>({
	username: '',
	password: ''
})

const isLoading = ref<boolean>(false)
const showPassword = ref<boolean>(false)
const rememberPassword = ref<boolean>(uni.getStorageSync('rememberPassword') !== false)
const showAccountList = ref<boolean>(false)
const savedAccounts = ref<SavedAccount[]>([])

onMounted(() => {
	const token = uni.getStorageSync('token')
	if (token) {
		uni.reLaunch({
			url: '/pages/index/index'
		})
		return
	}

	const saved = uni.getStorageSync('savedAccounts')
	if (saved) {
		try {
			savedAccounts.value = JSON.parse(saved)
		} catch (error) {
			console.error('解析保存的账号失败', error)
		}
	}

	if (rememberPassword.value && savedAccounts.value.length > 0) {
		const lastAccount = savedAccounts.value[0]
		form.username = lastAccount.username
		form.password = lastAccount.password
	}
})

const handleBlur = () => {
	setTimeout(() => {
		showAccountList.value = false
	}, 200)
}

const selectAccount = (account: SavedAccount) => {
	form.username = account.username
	form.password = account.password
	showAccountList.value = false
}

const togglePassword = () => {
	showPassword.value = !showPassword.value
}

const onRememberChange = (event: { detail: { value: string[] } }) => {
	rememberPassword.value = event.detail.value.includes('remember')
	uni.setStorageSync('rememberPassword', rememberPassword.value)

	if (!rememberPassword.value) {
		savedAccounts.value = []
		uni.removeStorageSync('savedAccounts')
	}
}

const saveAccount = () => {
	if (rememberPassword.value && form.username && form.password) {
		const existingIndex = savedAccounts.value.findIndex((account) => account.username === form.username)
		if (existingIndex >= 0) {
			savedAccounts.value[existingIndex] = {
				username: form.username,
				password: form.password
			}
		} else {
			savedAccounts.value.unshift({
				username: form.username,
				password: form.password
			})
		}

		if (savedAccounts.value.length > 5) {
			savedAccounts.value = savedAccounts.value.slice(0, 5)
		}

		uni.setStorageSync('savedAccounts', JSON.stringify(savedAccounts.value))
	}
}

const handleLogin = async () => {
	if (!form.username || !form.password) {
		uni.showToast({
			title: '请输入账号和密码',
			icon: 'none'
		})
		return
	}

	isLoading.value = true

	try {
		const res = await login({
			username: form.username,
			password: form.password
		})

		if (!res || !res.token) {
			uni.showToast({
				title: '登录失败，请重试',
				icon: 'none'
			})
			return
		}

		const savedAccountsBackup = uni.getStorageSync('savedAccounts')
		const rememberPasswordBackup = uni.getStorageSync('rememberPassword')
		uni.clearStorageSync()

		if (savedAccountsBackup) {
			uni.setStorageSync('savedAccounts', savedAccountsBackup)
		}

		if (rememberPasswordBackup !== '') {
			uni.setStorageSync('rememberPassword', rememberPasswordBackup)
		}

		uni.setStorageSync('token', res.token)
		if (res.userInfo) {
			uni.setStorageSync('userInfo', res.userInfo)
		}

		setAuthAccount(res.userInfo?.account || form.username)
		saveAccount()

		uni.showToast({
			title: '登录成功',
			icon: 'success'
		})

		setTimeout(() => {
			uni.reLaunch({
				url: '/pages/index/index'
			})
		}, 1000)
	} catch (error) {
		console.error(error)
	} finally {
		isLoading.value = false
	}
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
		color: #666;
		margin-top: 24rpx;
	}
}

.product-image-wrapper {
	margin: 32rpx 0 40rpx;

	.product-image {
		width: 100%;
		height: 280rpx;
		border-radius: 24rpx;
		object-fit: cover;
	}
}

.form-section {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 24rpx;

	.placeholder {
		font-size: 42rpx;
		color: #999;
	}

	.input-wrapper {
		position: relative;
		width: 100%;

		.input-field {
			width: 100%;
			height: 104rpx;
			padding: 0 28rpx;
			font-size: 42rpx;
			line-height: 104rpx;
			border: 2rpx solid #e5e5e5;
			border-radius: 16rpx;
			background-color: #ffffff;
			color: #1f2937;
			box-sizing: border-box;

			&:focus {
				border-color: #999;
				outline: none;
			}

			.placeholder {
				font-size: 42rpx;
				color: #999;
			}
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

			.account-item {
				padding: 28rpx;
				border-bottom: 2rpx solid #f5f5f5;
				cursor: pointer;

				&:last-child {
					border-bottom: none;
				}

				&:active {
					background-color: #f5f5f5;
				}

				.account-text {
					font-size: 36rpx;
					line-height: 1.2;
					color: #1f2937;
				}
			}
		}
	}

	.password-wrapper {
		position: relative;

		.input-field {
			padding-right: 80rpx;
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
	}

	.remember-section {
		margin-bottom: 40rpx;

		.remember-label {
			display: flex;
			align-items: center;
			gap: 16rpx;
			cursor: pointer;

			.remember-text {
				font-size: 36rpx;
				color: #666;
			}
		}
	}

	.login-btn {
		width: 100%;
		height: 104rpx;
		background-color: #000000;
		color: #ffffff;
		font-size: 42rpx;
		font-weight: 500;
		border-radius: 16rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.3s;

		&:active {
			background-color: #333;
		}

		&::after {
			border: none;
		}
	}
}
</style>
