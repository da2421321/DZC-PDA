<template>
	<view class="page">
		<HomePanel
			:current-user-name="currentUserName"
			:modules="homeModules"
			@logout="promptLogout"
			@select-module="handleModuleSelect"
		/>

		<ConfirmDialog
			v-if="confirmDialog.visible"
			:title="confirmDialog.title"
			:message="confirmDialog.message"
			:confirm-text="logoutConfirmText"
			:danger="true"
			@close="closeConfirmDialog"
			@confirm="handleConfirmLogout"
		/>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import ConfirmDialog from '../../components/pda/ConfirmDialog.vue'
import HomePanel from '../../components/pda/HomePanel.vue'
import { clearAuthAccount, getAuthAccount, getCurrentUserName } from '../../utils/pda'

const logoutTitle = '\u9000\u51fa\u767b\u5f55'
const logoutMessage = '\u786e\u5b9a\u8981\u9000\u51fa\u5f53\u524d\u8d26\u53f7\u5417\uff1f'
const logoutConfirmText = '\u786e\u8ba4\u9000\u51fa'

const account = ref('')
const currentUserName = ref('')
const homeModules = [
	{
		id: 'scale-binding',
		title: '\u7535\u5b50\u79f0\u7ed1\u5b9a',
		description: '\u7ed1\u5b9a\u7535\u5b50\u79f0\u4e0e\u4f4d\u7f6e',
		iconType: 'gear-filled',
		theme: 'blue'
	}
]

const confirmDialog = reactive({
	visible: false,
	title: '',
	message: ''
})

onShow(() => {
	syncAuth()
})

function syncAuth() {
	const currentAccount = getAuthAccount()
	if (!currentAccount) {
		uni.redirectTo({
			url: '/pages/login/index'
		})
		return
	}

	account.value = currentAccount
	currentUserName.value = getCurrentUserName(currentAccount)
}

function promptLogout() {
	confirmDialog.visible = true
	confirmDialog.title = logoutTitle
	confirmDialog.message = logoutMessage
}

function closeConfirmDialog() {
	confirmDialog.visible = false
	confirmDialog.title = ''
	confirmDialog.message = ''
}

function handleConfirmLogout() {
	clearAuthAccount()
	closeConfirmDialog()
	uni.reLaunch({
		url: '/pages/login/index'
	})
}

function handleModuleSelect(moduleId) {
	if (moduleId === 'scale-binding') {
		uni.navigateTo({
			url: '/pages/scale-binding/index'
		})
	}
}
</script>

<style>
page {
	background: #ffffff;
	color: #0f172a;
	font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.page {
	min-height: 100vh;
	background: #ffffff;
	position: relative;
}
</style>
