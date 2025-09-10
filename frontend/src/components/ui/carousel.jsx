// src/components/ui/carousel.jsx

import * as React from "react";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel>");
  }
  return context;
}

const Carousel = React.forwardRef(
  ({ orientation = "horizontal", opts, className, children, ...props }, ref) => {
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      [plugin.current]
    );

    const value = React.useMemo(
      () => ({
        emblaApi,
        emblaRef,
        orientation,
      }),
      [emblaApi, emblaRef, orientation]
    );

    return (
      <CarouselContext.Provider value={value}>
        <div
          ref={ref}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
    const { emblaRef, orientation } = useCarousel();
    
    return (
      <div ref={emblaRef} className="overflow-hidden">
        <div
          ref={ref}
          // REMOVED "-ml-4" to help fix the gap
          className={cn("flex", orientation === "horizontal" ? "" : "flex-col", className)}
          {...props}
        />
      </div>
    );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      // REMOVED "pl-4" to help fix the gap
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

export { Carousel, CarouselContent, CarouselItem };