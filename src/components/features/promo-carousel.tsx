"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const promos = [
  {
    id: "1",
    title: "Transfer within Thai",
    image: "/images/promo-1.jpg",
    bgColor: "bg-wave-yellow-light",
  },
  {
    id: "2",
    title: "Transfer to Myanmar",
    image: "/images/promo-2.jpg",
    bgColor: "bg-wave-blue-light",
  },
];

export function PromoCarousel() {
  return (
    <div>
      <h3 className="text-base font-bold text-foreground mb-3">
        Promotion/Information
      </h3>
      <Carousel className="w-full">
        <CarouselContent>
          {promos.map((promo) => (
            <CarouselItem key={promo.id}>
              <div
                className={`${promo.bgColor} rounded-xl h-32 flex items-center justify-center p-4`}
              >
                <span className="text-sm font-medium text-foreground">
                  {promo.title}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
