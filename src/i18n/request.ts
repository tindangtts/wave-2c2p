import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as 'en' | 'th' | 'mm')) {
    locale = routing.defaultLocale
  }

  const [common, auth, kyc, home, transfer, wallet, profile] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/auth.json`),
    import(`../../messages/${locale}/kyc.json`),
    import(`../../messages/${locale}/home.json`),
    import(`../../messages/${locale}/transfer.json`),
    import(`../../messages/${locale}/wallet.json`),
    import(`../../messages/${locale}/profile.json`),
  ])

  return {
    locale,
    messages: {
      ...common.default,
      auth: auth.default,
      kyc: kyc.default,
      home: home.default,
      transfer: transfer.default,
      wallet: wallet.default,
      profile: profile.default,
    },
  }
})
