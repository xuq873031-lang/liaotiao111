/**
 * 防抖函数
 * @param {Function} fn 待执行函数
 * @param {number} delay 延迟毫秒
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}
