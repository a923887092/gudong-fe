// import storage from './storage'
import axios from 'axios'

// let _userTicket = null

// export function initUserInfo (ticket) {
//   _userTicket = ticket
// }
let baseUrl = '/'
if (process.env.NODE_ENV === 'production') {
  baseUrl = '/'
}

function fetcherCreator (url, userInfo) {
  const fetcher = axios.create({
    method: 'post',
    baseURL: url,
    withCredentials: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  })

  fetcher.interceptors.request.use(function (config) {
    config.headers = {
      ...config.headers,
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
    if (!config.data) { // 解决不传参时，Content-Type 不生效，服务器返回 415 的问题
      config.data = {}
    }
    return config
  }, function (error) {
    return Promise.reject(error)
  })

  fetcher.interceptors.response.use(function (response) {
    if (response.data.code === 2 || response.data.code === 3) {
      // token 失效处理
      return
    }
    return response.data
  }, function (error) {
    return Promise.reject(error)
  })

  return fetcher
}

// 包装fetch
const fetchGenerator = poster => (api, arg) => {
  return new Promise((resolve, reject) => {
    // TODO:开始loading
    return poster(api, arg)
      .then(res => {
        //  TODO:结束loading
        resolve(res)
      }).catch(error => {
        console.error('*** fetch error ***', error)
        //  TODO:结束loading
        reject(error)
      })
  })
}

const defaultFetcher = fetcherCreator(baseUrl)

export default fetchGenerator(defaultFetcher.post)
