/**
 * Ish vaqtini hisoblash va ayni vaqtda ochiq/yopiqligini aniqlash utiliti
 */

export const DAY_NAMES = [
  'Yakshanba',
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba'
]

export const DAY_NAMES_ORDERED = [
  { index: 1, name: 'Dushanba', short: 'Dush' },
  { index: 2, name: 'Seshanba', short: 'Sesh' },
  { index: 3, name: 'Chorshanba', short: 'Chor' },
  { index: 4, name: 'Payshanba', short: 'Pay' },
  { index: 5, name: 'Juma', short: 'Juma' },
  { index: 6, name: 'Shanba', short: 'Shan' },
  { index: 0, name: 'Yakshanba', short: 'Yak' }
]

/**
 * 7 kunlik standart jadval yaratish uchun yordamchi
 */
export function createStandardSchedule(regularOpen = '10:00', regularClose = '22:00', weekendClose = '23:00') {
  return {
    1: { open: regularOpen, close: regularClose, isClosed: false }, // Dushanba
    2: { open: regularOpen, close: regularClose, isClosed: false }, // Seshanba
    3: { open: regularOpen, close: regularClose, isClosed: false }, // Chorshanba
    4: { open: regularOpen, close: regularClose, isClosed: false }, // Payshanba
    5: { open: regularOpen, close: weekendClose, isClosed: false }, // Juma
    6: { open: regularOpen, close: weekendClose, isClosed: false }, // Shanba
    0: { open: regularOpen, close: regularClose, isClosed: false }  // Yakshanba
  }
}

/**
 * Minutlarni "X soat Y daqiqa" ko'rinishiga keltirish
 */
export function formatMinutes(minutes) {
  if (minutes < 1) return '1 daqiqadan kam'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} daqiqa`
  if (mins === 0) return `${hours} soat`
  return `${hours} soat ${mins} daqiqa`
}

/**
 * Brend yoki do'konning ayni vaqtdagi ish holatini aniqlash
 * @param {Object} schedule - 7 kunlik jadval
 * @param {Date} currentTime - hozirgi yoki simulyatsiya qilinayotgan vaqt
 */
export function getBrandStatus(schedule, currentTime = new Date()) {
  if (!schedule) {
    return {
      isOpen: false,
      statusText: "Noma'lum",
      statusColor: 'gray',
      badgeClass: 'badge-neutral',
      remainingText: "Ma'lumot mavjud emas",
      todayHours: "10:00 - 22:00",
      closingSoon: false,
      weeklyList: []
    }
  }

  const dayIndex = currentTime.getDay()
  const currentHours = currentTime.getHours()
  const currentMinutes = currentTime.getMinutes()
  const currentTotalMinutes = currentHours * 60 + currentMinutes

  const todaySchedule = schedule[dayIndex] || { open: '10:00', close: '22:00', isClosed: false }

  // 7 kunlik to'liq ro'yxatni shakllantirish
  const weeklyList = DAY_NAMES_ORDERED.map((day) => {
    const daySched = schedule[day.index] || { open: '10:00', close: '22:00', isClosed: false }
    return {
      index: day.index,
      dayName: day.name,
      shortName: day.short,
      isToday: day.index === dayIndex,
      isClosed: daySched.isClosed,
      open: daySched.open,
      close: daySched.close,
      formattedText: daySched.isClosed ? 'Dam olish kuni' : `${daySched.open} - ${daySched.close}`
    }
  })

  // Agar bugun dam olish kuni bo'lsa
  if (todaySchedule.isClosed) {
    // Ertangi yoki eng yaqin ochilish kunini topish
    let nextDayIndex = (dayIndex + 1) % 7
    let daysAhead = 1
    while (schedule[nextDayIndex]?.isClosed && daysAhead < 7) {
      nextDayIndex = (nextDayIndex + 1) % 7
      daysAhead++
    }
    const nextSched = schedule[nextDayIndex] || { open: '10:00' }
    const nextDayName = DAY_NAMES[nextDayIndex]

    return {
      isOpen: false,
      statusText: 'Hozir yopiq',
      statusColor: 'red',
      badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
      remainingText: `Bugun dam olish kuni • ${nextDayName} ${nextSched.open} da ochiladi`,
      todayHours: 'Dam olish kuni',
      closingSoon: false,
      weeklyList,
      percentOfDay: 0
    }
  }

  const [openH, openM] = todaySchedule.open.split(':').map(Number)
  const openTotalMinutes = openH * 60 + openM

  const [closeH, closeM] = todaySchedule.close.split(':').map(Number)
  const closeTotalMinutes = closeH * 60 + closeM

  const todayHours = `${todaySchedule.open} - ${todaySchedule.close}`

  // A) Hozir ochiq vaqt oralig'i
  if (currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes) {
    const remainingMinutes = closeTotalMinutes - currentTotalMinutes
    const isClosingSoon = remainingMinutes <= 45

    const totalWorkingMinutes = closeTotalMinutes - openTotalMinutes
    const elapsedMinutes = currentTotalMinutes - openTotalMinutes
    const percent = Math.min(100, Math.max(0, Math.round((elapsedMinutes / totalWorkingMinutes) * 100)))

    return {
      isOpen: true,
      statusText: isClosingSoon ? 'Tez orada yopiladi' : 'Hozir ochiq',
      statusColor: isClosingSoon ? 'amber' : 'green',
      badgeClass: isClosingSoon
        ? 'bg-amber-500/15 text-amber-500 border-amber-500/30 font-medium'
        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium',
      remainingText: `Yopilishiga ${formatMinutes(remainingMinutes)} qoldi (${todaySchedule.close} gacha)`,
      detailText: `${todaySchedule.close} da yopiladi`,
      todayHours,
      closingSoon: isClosingSoon,
      remainingMinutes,
      weeklyList,
      percentOfDay: percent
    }
  }

  // B) Hali ochilmagan (ertalab)
  if (currentTotalMinutes < openTotalMinutes) {
    const untilOpenMinutes = openTotalMinutes - currentTotalMinutes
    return {
      isOpen: false,
      statusText: 'Hozir yopiq',
      statusColor: 'red',
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-medium',
      remainingText: `Bugun ${todaySchedule.open} da ochiladi (${formatMinutes(untilOpenMinutes)}dan so'ng)`,
      detailText: `Ochilish vaqti: ${todaySchedule.open}`,
      todayHours,
      closingSoon: false,
      untilOpenMinutes,
      weeklyList,
      percentOfDay: 0
    }
  }

  // C) Bugungi ish vaqti tugagan (kechasi)
  const tomorrowIndex = (dayIndex + 1) % 7
  const tomorrowSched = schedule[tomorrowIndex] || { open: '10:00', close: '22:00', isClosed: false }

  const nextText = tomorrowSched.isClosed
    ? `Ertaga dam olish kuni`
    : `Ertaga ${tomorrowSched.open} da ochiladi`

  return {
    isOpen: false,
    statusText: 'Hozir yopiq',
    statusColor: 'red',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-medium',
    remainingText: nextText,
    detailText: `Bugun ${todaySchedule.close} da yopilgan`,
    todayHours,
    closingSoon: false,
    weeklyList,
    percentOfDay: 100
  }
}
