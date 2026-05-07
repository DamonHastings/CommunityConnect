import type { Locator } from '@playwright/test'

export const PAUSE = (ms = 1200) => new Promise((r) => setTimeout(r, ms))

export async function smoothScrollTo(locator: Locator, pauseMs = 700) {
  await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const margin = 80
    const isInViewport =
      rect.top >= margin &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight - margin &&
      rect.right <= window.innerWidth
    if (!isInViewport) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  })
  await PAUSE(pauseMs)
}

export async function smoothClick(locator: Locator) {
  await smoothScrollTo(locator)
  await locator.click()
}

export async function smoothFill(locator: Locator, value: string) {
  await smoothScrollTo(locator)
  await locator.fill(value)
}
