export const loginHero = '/static/images/product-placeholder.jpg'

export const factories = [
	{ id: 'factory-a', name: '一号厂区' },
	{ id: 'factory-b', name: '二号厂区' }
]

export const lineMap = {
	'factory-a': [
		{ id: 'line-1', name: '产线 A-1' },
		{ id: 'line-2', name: '产线 A-2' }
	],
	'factory-b': [
		{ id: 'line-1', name: '产线 B-1' },
		{ id: 'line-2', name: '产线 B-2' }
	]
}

export const nameMap = {
	'admin@gracer.com': '张三',
	'user@gracer.com': '李四'
}

export const varietyPool = ['废棉A级', '废棉B级', '涤纶切片', '混合废料']
const AUTH_ACCOUNT_KEY = 'gracer_auth_account'
const SAVED_ACCOUNTS_KEY = 'gracer_saved_accounts'
const BINDING_RECORDS_KEY = 'gracer_scale_binding_records'

const defaultSavedAccounts = [
	{ account: 'admin@gracer.com', password: 'gracer123' },
	{ account: 'user@gracer.com', password: 'user123' }
]

const defaultBindingRecords = [
	{
		id: '1',
		factoryId: 'factory-a',
		lineId: 'line-1',
		positionId: 'A01-01',
		variety: '废棉A级',
		macAddress: '00:1B:44:11:3A:B7',
		status: 'bound',
		bindTime: '2026-03-11 08:30:00'
	},
	{
		id: '2',
		factoryId: 'factory-a',
		lineId: 'line-1',
		positionId: 'A01-02',
		variety: '废棉B级',
		macAddress: '00:1B:44:11:3A:C8',
		status: 'bound',
		bindTime: '2026-03-11 09:15:00'
	},
	{
		id: '3',
		factoryId: 'factory-a',
		lineId: 'line-2',
		positionId: 'A02-01',
		variety: '涤纶切片',
		macAddress: '00:1B:44:11:3A:D9',
		status: 'bound',
		bindTime: '2026-03-10 14:20:00'
	},
	{
		id: '4',
		factoryId: 'factory-b',
		lineId: 'line-1',
		positionId: 'B01-01',
		variety: '混合废料',
		macAddress: '00:1B:44:11:3A:E1',
		status: 'bound',
		bindTime: '2026-03-11 10:00:00'
	}
]

function cloneList(list) {
	return list.map((item) => ({ ...item }))
}

export function getSavedAccounts() {
	const accounts = uni.getStorageSync(SAVED_ACCOUNTS_KEY)
	if (Array.isArray(accounts)) {
		return cloneList(accounts)
	}
	return cloneList(defaultSavedAccounts)
}

export function saveSavedAccounts(accounts) {
	uni.setStorageSync(SAVED_ACCOUNTS_KEY, accounts)
}

export function getAuthAccount() {
	const account = uni.getStorageSync(AUTH_ACCOUNT_KEY)
	if (account) {
		return account
	}

	const userInfo = uni.getStorageSync('userInfo')
	if (userInfo && typeof userInfo === 'object') {
		return userInfo.account || userInfo.username || ''
	}

	return ''
}

export function setAuthAccount(account) {
	uni.setStorageSync(AUTH_ACCOUNT_KEY, account)
}

export function clearAuthAccount() {
	uni.removeStorageSync(AUTH_ACCOUNT_KEY)
	uni.removeStorageSync('token')
	uni.removeStorageSync('userInfo')
}

export function getCurrentUserName(account) {
	const userInfo = uni.getStorageSync('userInfo')
	if (userInfo && typeof userInfo === 'object' && userInfo.name) {
		return userInfo.name
	}

	return nameMap[account] || (account ? account.split('@')[0] : '张三')
}

export function getBindingRecords() {
	const records = uni.getStorageSync(BINDING_RECORDS_KEY)
	if (Array.isArray(records)) {
		return cloneList(records)
	}
	return cloneList(defaultBindingRecords)
}

export function saveBindingRecords(records) {
	uni.setStorageSync(BINDING_RECORDS_KEY, records)
}

export function pad(value) {
	return value < 10 ? `0${value}` : `${value}`
}

export function formatDateTime(date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function normalizeMac(value) {
	const source = String(value).trim().toUpperCase()
	const pure = source.replace(/[^0-9A-F]/g, '')

	if (pure.length !== 12) {
		return source
	}

	const groups = []
	for (let index = 0; index < pure.length; index += 2) {
		groups.push(pure.slice(index, index + 2))
	}

	return groups.join(':')
}
