"use client";

import { useCallback, useEffect, useState } from "react";
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
      title: t("promotions.promo1.title"),
      body: t("promotions.promo1.body"),
    },
    {
      key: "promo2",
      title: t("promotions.promo2.title"),
      body: t("promotions.promo2.body"),
    },
    {
      key: "promo3",
      title: t("promotions.promo3.title"),
      body: t("promotions.promo3.body"),
    },
  ];

  return (
    <div>
      <h3 className="text-xl font-bold text-[#212121] mb-3">
        {t("promotions.title")}
      </h3>

      {/* Embla carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {promos.map((promo) => (
            <div
              key={promo.key}
              className="flex-[0_0_80%] max-w-[340px] mr-3"
            >
              <div className="h-40 rounded-xl overflow-hidden bg-gradient-to-r from-[#0091EA] to-[#01579B] px-5 py-4 flex flex-col justify-end">
                <p className="text-lg font-bold text-white leading-snug">
                  {promo.title}
                </p>
                <p className="text-sm text-white/80 mt-1">{promo.body}</p>
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
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: idx === selectedIndex ? "#FFE600" : "#E0E0E0",
            }}
          />
        ))}
      </div>
    </div>
  );
}
