/**
 * 时间工具函数
 * formatTime - 格式化时间显示
 * mockTimeOffset - 时间偏移（秒）
 * offsetByHours - 按小时偏移
 */

let timeOffset = 0

/** 获取当前时间（带偏移） */
export function getNow() {
  const now = new Date()
  if (timeOffset !== 0) {
    return new Date(now.getTime() + timeOffset * 1000)
  }
  return now
}

/** 设置时间偏移量（秒） */
export function mockTimeOffset(seconds) {
  timeOffset = seconds
}

/** 按小时偏移 */
export function offsetByHours(hours) {
  timeOffset += hours * 3600
  return timeOffset
}

/** 重置时间偏移 */
export function resetTimeOffset() {
  timeOffset = 0
  return timeOffset
}

export function getTimeOffset() {
  return timeOffset
}

/** 格式化时间 */
export function formatTime(date, format = 'full') {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hours}:${minutes}:${seconds}`
    case 'short':
      return `${hours}:${minutes}`
    case 'relative': {
      const now = getNow()
      const diff = now - d
      const oneDay = 24 * 60 * 60 * 1000
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < oneDay && now.getDate() === d.getDate()) return `今天 ${hours}:${minutes}`
      if (diff < 2 * oneDay) return `昨天 ${hours}:${minutes}`
      if (diff < 7 * oneDay) return `${Math.floor(diff / oneDay)}天前`
      return `${year}-${month}-${day}`
    }
    case 'full':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}
