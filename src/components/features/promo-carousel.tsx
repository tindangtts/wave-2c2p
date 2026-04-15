"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";

export function PromoCarousel() {
  const t = useTranslations("home");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const promos = [
    {
      key: "promo1",
      badge: t("promotions.promo1.title"),
      badgeIcon: "🇹🇭",
      badgeBg: "bg-white/90 text-[#212121]",
      image: "/images/promo-transfer-thai.svg",
    },
    {
      key: "promo2",
      badge: t("promotions.promo2.title"),
      badgeIcon: "🇲🇲",
      badgeBg: "bg-[#FFE600]/90 text-[#212121]",
      image: "/images/promo-transfer-myanmar.png",
    },
    {
      key: "promo3",
      badge: t("promotions.promo3.title"),
      badgeIcon: "💳",
      badgeBg: "bg-white/90 text-[#212121]",
      image: "/images/promo-visa.svg",
    },
  ];

  return (
    <div>
      <h3 className="text-base font-bold text-[#000000] mb-4">
        {t("promotions.title")}
      </h3>

      {/* Embla carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {promos.map((promo) => (
            <div
              key={promo.key}
              className="flex-[0_0_85%] max-w-[340px] mr-3"
            >
              <div className="h-[136px] rounded-[17px] overflow-hidden relative bg-[#f0f0f0]">
                <Image
                  src={promo.image}
                  alt={promo.badge}
                  fill
                  className="object-cover"
                  sizes="340px"
                />
                {/* Badge overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${promo.badgeBg}`}>
                    <span>{promo.badgeIcon}</span>
                    {promo.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {(scrollSnaps.length > 0 ? scrollSnaps : promos).map((_, idx) => (
          <span
            key={idx}
            className="w-2 h-2 rounded-full dot-indicator"
            style={{
              backgroundColor: idx === selectedIndex ? "#FFE600" : "#E0E0E0",
              transform: idx === selectedIndex ? "scale(1.25)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
