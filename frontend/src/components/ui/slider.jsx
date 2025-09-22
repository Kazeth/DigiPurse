"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

// A custom, accessible, and theme-consistent range slider component.
const Slider = ({
  className,
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue = [0, 100],
  onValueChange,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(controlledValue);
  const [activeThumb, setActiveThumb] = useState(null);

  const trackRef = useRef(null);
  const minThumbRef = useRef(null);
  const maxThumbRef = useRef(null);

  // Update local state if the controlled prop changes
  useEffect(() => {
    setLocalValue(controlledValue);
  }, [controlledValue]);

  const [minValue, maxValue] = localValue;

  const getPercentage = useCallback((val) => ((val - min) / (max - min)) * 100, [min, max]);

  const minPercent = getPercentage(minValue);
  const maxPercent = getPercentage(maxValue);

  const handleInteractionStart = (thumb) => (event) => {
    event.preventDefault();
    setActiveThumb(thumb);
    const thumbRef = thumb === 'min' ? minThumbRef : maxThumbRef;
    thumbRef.current?.focus();
  };
  
  const handleInteractionMove = useCallback((event) => {
    if (activeThumb === null || !trackRef.current) return;
    
    const trackRect = trackRef.current.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const percent = Math.max(0, Math.min(100, ((clientX - trackRect.left) / trackRect.width) * 100));
    let newValue = min + (percent / 100) * (max - min);

    // Snap to the nearest step
    newValue = Math.round(newValue / step) * step;

    const newRange = [...localValue];

    if (activeThumb === 'min') {
      newRange[0] = Math.min(newValue, newRange[1] - step);
    } else {
      newRange[1] = Math.max(newValue, newRange[0] + step);
    }

    setLocalValue(newRange);
    if (onValueChange) {
      onValueChange(newRange);
    }
  }, [activeThumb, min, max, step, localValue, onValueChange]);
  
  const handleInteractionEnd = useCallback(() => {
    setActiveThumb(null);
  }, []);

  useEffect(() => {
    if (activeThumb !== null) {
      document.addEventListener('mousemove', handleInteractionMove);
      document.addEventListener('mouseup', handleInteractionEnd);
      document.addEventListener('touchmove', handleInteractionMove);
      document.addEventListener('touchend', handleInteractionEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleInteractionMove);
      document.removeEventListener('mouseup', handleInteractionEnd);
      document.removeEventListener('touchmove', handleInteractionMove);
      document.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [activeThumb, handleInteractionMove, handleInteractionEnd]);

  return (
    <div
      ref={trackRef}
      className={cn('relative w-full h-2 rounded-full bg-black/30 touch-none select-none flex items-center', className)}
      {...props}
    >
      {/* Track Background */}
      <div className="relative w-full h-1 bg-purple-900/50 rounded-full">
        {/* Selected Range Highlight */}
        <div
          className="absolute h-full bg-purple-400 rounded-full"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
      </div>

      {/* Minimum Value Thumb */}
      <button
        ref={minThumbRef}
        type="button"
        onMouseDown={handleInteractionStart('min')}
        onTouchStart={handleInteractionStart('min')}
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-purple-200 border-2 border-purple-400 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-400 focus:ring-offset-black/50"
        style={{ left: `${minPercent}%` }}
        aria-label="Minimum price"
        aria-valuemin={min}
        aria-valuemax={maxValue - step}
        aria-valuenow={minValue}
      />
      
      {/* Maximum Value Thumb */}
      <button
        ref={maxThumbRef}
        type="button"
        onMouseDown={handleInteractionStart('max')}
        onTouchStart={handleInteractionStart('max')}
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-purple-200 border-2 border-purple-400 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-400 focus:ring-offset-black/50"
        style={{ left: `${maxPercent}%` }}
        aria-label="Maximum price"
        aria-valuemin={minValue + step}
        aria-valuemax={max}
        aria-valuenow={maxValue}
      />
    </div>
  );
};

export default Slider;
