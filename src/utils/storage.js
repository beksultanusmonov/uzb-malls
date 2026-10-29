import { MALLS_DATA } from '../data/mallsData'

const STORAGE_KEY = 'uzbekistan_malls_data_v2'
const AUTH_KEY = 'uzbekistan_malls_admin_auth'

/**
 * LocalStorage'dan barcha mallar ma'lumotlarini yuklash
 */
export function getStoredMalls() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (error) {
    console.error('LocalStorage o\'qishda xatolik:', error)
  }

  // Agar mavjud bo'lmasa, datadagi MALLS_DATA saqlanadi va qaytariladi
  saveStoredMalls(MALLS_DATA)
  return MALLS_DATA
}

/**
 * LocalStorage'ga mallar ma'lumotlarini saqlash
 */
export function saveStoredMalls(malls) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(malls))
  } catch (error) {
    console.error('LocalStorage saqlashda xatolik:', error)
  }
}

/**
 * Ma'lumotlarni datadagi standart holatiga qaytarish
 */
export function resetStoredMalls() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MALLS_DATA))
    return MALLS_DATA
  } catch (error) {
    console.error('LocalStorage reset xatoligi:', error)
    return MALLS_DATA
  }
}

/**
 * Admin avtorizatsiya holatini tekshirish
 */
export function getAdminAuth() {
  try {
    return sessionStorage.getItem(AUTH_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Admin avtorizatsiyasini o'rnatish
 */
export function setAdminAuth(isAuth) {
  try {
    if (isAuth) {
      sessionStorage.setItem(AUTH_KEY, 'true')
    } else {
      sessionStorage.removeItem(AUTH_KEY)
    }
  } catch {
    // Ignore session storage errors
  }
}
