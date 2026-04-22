import request from '@/request/index'

export interface LoginParams {
	username: string
	password: string
}

export interface UserInfo {
	id: number
	name: string
	account: string
}

export interface LoginResponse {
	token: string
	userInfo: UserInfo
}

export const login = (data: LoginParams) => {
	return request<LoginResponse>({
		url: '/rfid/login',
		method: 'POST',
		data,
		noToken: true
	})
}

export function getInfo() {
	return request({
		url: '/getInfo',
		method: 'get'
	})
}

export function logout() {
	return request({
		url: '/api/pda/logout',
		method: 'post'
	})
}
