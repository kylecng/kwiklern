export const IS_DEV_MODE = import.meta.env.DEV

export const randInt = (min, max) => Math.floor(Math.random() * (max - min) + min)

export const randDate = () => {
  const today = new Date()
  const threeYearsAgo = new Date()
  threeYearsAgo.setFullYear(today.getFullYear() - 1)

  const randomTimestamp =
    Math.random() * (today.getTime() - threeYearsAgo.getTime()) + threeYearsAgo.getTime()
  const randomDate = new Date(randomTimestamp)

  return randomDate
}

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const trySilent = (func) => {
  try {
    func()
    return true
  } catch {}
}

export const tryReturn = (func) => {
  try {
    return func()
  } catch {}
}

export const devLog = (...args) => {
  if (IS_DEV_MODE) {
    const callerInfo = new Error().stack.split('\n')[2].trim()
    console.log(`%c${callerInfo}\n`, 'color: blue; font-weight: bold;', ...args)
  }
}

export const devErr = (...args) => {
  if (IS_DEV_MODE) {
    const callerInfo = new Error().stack.split('\n')[2].trim()
    console.error(`%c${callerInfo}\n`, 'color: red; font-weight: bold;', ...args)
  }
}

export const devInfo = (...args) => {
  if (IS_DEV_MODE) {
    const callerInfo = new Error().stack.split('\n')[2].trim()
    console.info(`%c${callerInfo}\n`, 'color: green; font-weight: bold;', ...args)
  }
}

export const getErrStr = (error) => {
  return (
    tryReturn(() => error.message) ||
    tryReturn(() => JSON.parse(error)) ||
    tryReturn(() => error.toString())
  )
}
