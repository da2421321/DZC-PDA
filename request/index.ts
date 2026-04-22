// 全局请求封装
const env = 1// 0生产 1开发
//http://192.168.1.23:8096
//https://gracer.hainiu.biz/api
const urlList = ['https://www.hhcarbonr.com/api', 'https://gracer.hainiu.biz/api']
export const base_url = urlList[env]

// 请求超出时间
const timeout = 50000

let loadingCount = 0
let showModal = false

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

export interface RequestParams<TData = Record<string, unknown>> {
    url: string
    method?: RequestMethod
    data?: TData
    header?: Record<string, string>
    noToken?: boolean
    silent?: boolean
}

export interface ApiResponse<TData = unknown> {
    code?: string | number
    message?: string
    msg?: string
    data?: TData
    [key: string]: unknown
}

// 需要修改token，和根据实际修改请求头
function request<TResponse = unknown>(params: RequestParams): Promise<TResponse> {
    if (showModal) return Promise.reject(new Error('登录处理中'))
    let url = params.url;
    let method = params.method || "get";
    let data: Record<string, any> = (params.data || {}) as Record<string, any>;
    const token = uni.getStorageSync('token');
    const {
        id: uid
    } = uni.getStorageSync('userInfo');
    let header: Record<string, string> = {
        'Content-Type': 'application/json;charset=UTF-8',
        ...params.header
    }
    if (!params.noToken && token) {
        header.Authorization = 'Bearer ' + token
        if (uid) {
            data.uid = uid
        }
    }
    // 如果没有开启静默模式，则显示loading
    if (!params.silent) {
        loadingCount++
        if (loadingCount === 1) {
            uni.showLoading({
                mask: true
            });
        }
    }

    return new Promise<TResponse>((resolve, reject) => {
        uni.request({
            url: base_url + url,
            method: method,
            header: header,
            data: data,
            timeout,
            success(response: any) {
                const res = response
                const whiteList = ['00000', '200', '20002', '20004', '20005', 'B0001']
                // 根据返回的状态码做出对应的操作
                if (res.statusCode == 200) {
                    if (whiteList.includes(String(res.data.code))) {
                        // 成功时关闭 loading
                        if (!params.silent) {
                            loadingCount--
                            if (loadingCount <= 0) {
                                loadingCount = 0
                                uni.hideLoading()
                            }
                        }
                        resolve(res.data as TResponse);
                    } else {
                        // 只有非静默请求才关闭 loading
                        if (!params.silent) {
                            loadingCount--
                            if (loadingCount <= 0) {
                                loadingCount = 0
                                uni.hideLoading()
                            }
                        }
                        const errMsg = res.data.message || res.data.msg || ''
                        // 检查是否为登录失效错误
                        if (errMsg.includes('loginUser') || errMsg.includes('token')) {
                            uni.clearStorageSync()
                            if (!showModal) {
                                showModal = true
                                uni.showModal({
                                    title: "提示",
                                    content: '登录已过期，请重新登录',
                                    showCancel: false,
                                    success() {
                                        showModal = false
                                        uni.reLaunch({
                                            url: "/pages/login/index",
                                        })
                                    },
                                })
                            }
                        } else {
                            if (!params.silent) {
                                setTimeout(() => {
                                    uni.showToast({
                                        title: errMsg || '服务异常，请联系管理员。',
                                        icon: 'none',
                                        duration: 2000,
                                    })
                                })
                            }
                        }
                        reject(new Error(errMsg || '操作失败'));
                    }
                } else {
                    // 只有非静默请求才关闭 loading
                    if (!params.silent) {
                        loadingCount--
                        if (loadingCount <= 0) {
                            loadingCount = 0
                            uni.hideLoading()
                        }
                    }
                    setTimeout(() => {
                        switch (res.statusCode) {
                            case 401:
                                uni.clearStorageSync()
                                if (!showModal) {
                                    showModal = true
                                    uni.showModal({
                                        title: "提示",
                                        content: res.data.message || '当前登录会话过期，请重新登录。',
                                        showCancel: false,
                                        success() {
                                            showModal = false
                                            setTimeout(() => {
                                                uni.navigateTo({
                                                    url: "/pages/login/index",
                                                })
                                            }, 1000);
                                        },

                                    })
                                }

                                break;
                            case 404:
                                if (!params.silent) {
                                    uni.showToast({
                                        title: res.data.message || '请求地址不存在。',
                                        icon: 'none',
                                        duration: 2000,
                                    })
                                }
                                break;
                            case 500:
                                // 检查是否是登录状态失效的错误
                                const errMsg = res.data.message || res.msg || '';
                                const isAuthError = res.data.code === 'B0301' ||
                                    res.data.code === 'A0307' || res.code === 500 ||
                                    errMsg.includes('loginUser') ||
                                    errMsg.includes('token') ||
                                    errMsg.includes('登录');

                                if (isAuthError) {
                                    uni.clearStorageSync()
                                    if (!showModal) {
                                        showModal = true
                                        uni.showModal({
                                            title: "提示",
                                            content: '登录已过期，请重新登录',
                                            showCancel: false,
                                            success() {
                                                showModal = false
                                                uni.reLaunch({
                                                    url: "/pages/login/index",
                                                })
                                            },
                                        })
                                    }
                                } else {
                                    if (!params.silent) {
                                        uni.showToast({
                                            title: errMsg || '服务异常，请联系管理员。',
                                            icon: 'none',
                                            duration: 2000,
                                        })
                                    }
                                }

                                break;
                            default:
                                if (!params.silent) {
                                    uni.showToast({
                                        title: res.data.message || '服务异常，请联系管理员。',
                                        icon: 'none',
                                        duration: 2000,
                                    })
                                }
                                break;
                        }
                    })
                    reject(new Error((res.data && (res.data.message || res.data.msg)) || res.errMsg || `请求失败(${res.statusCode})`));
                }
            },

            fail(err: any) {
                reject(err);
                if (!params.silent) {
                    loadingCount--
                    if (loadingCount <= 0) {
                        loadingCount = 0
                        uni.hideLoading()
                    }
                    setTimeout(() => {
                        uni.showToast({
                            title: '服务异常，请联系管理员。',
                            icon: 'none',
                            duration: 2000
                        })
                    })
                }
            },
            complete() {
                // 不管成功还是失败都会执行
                // complete 中不再处理 loading，统一在 success/fail 中处理
                // 如果需要兜底，可以在这里再次检查
                if (!params.silent) {
                    // 为防止逻辑漏洞，双重保险：如果在 success/fail 中漏掉（虽然上面都覆盖了），这里可以做最终清理
                    // 但由于 success 分支较多，直接在 success/fail 处理更精确。
                    // 既然上面都处理了，这里可以留空，或者仅处理 loadingCount 异常情况
                }
            }
        });
    });
}

export default request
