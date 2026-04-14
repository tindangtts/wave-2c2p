'use client'

import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

interface Language {
  code: string
  label: string
  flag: string
  lang?: string
}

const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'mm', label: 'မြန်မာဘာသာ', flag: '🇲🇲', lang: 'my' },
]

interface LanguageSelectorProps {
  currentLocale: string
}

export function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const router = useRouter()

  function handleSelect(localeCode: string) {
    if (localeCode === currentLocale) return

    // Set locale cookie (same name used by next-intl routing)
    document.cookie = `locale=${localeCode}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`

    // Trigger re-render via router refresh — next-intl picks up new cookie
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2 px-4">
      {LANGUAGES.map((lang) => {
        const isActive = lang.code === currentLocale
        return (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={[
              'h-[52px] flex items-center px-4 rounded-xl w-full text-left transition-colors',
              isActive ? 'bg-[#FFE600]' : 'bg-transparent hover:bg-secondary',
            ].join(' ')}
            aria-pressed={isActive}
            aria-label={lang.label}
          >
            <span className="text-2xl leading-none mr-3" role="img" aria-hidden="true">
              {lang.flag}
            </span>
            <span
              className="flex-1 text-base font-normal text-foreground"
              {...(lang.lang ? { lang: lang.lang } : {})}
            >
              {lang.label}
            </span>
            {isActive && (
              <Check className="w-5 h-5 text-[#0091EA] flex-shrink-0" aria-hidden="true" />
            )}
          </button>
        )
      })}
    </div>
  )
}
