"use client";

import { ChevronRight, Check, Loader2 } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";

type SlideToConfirmProps = {
  /** Label shown centered in the slider track */
  label: string;
  /** Callback fired when the user completes the slide */
  onConfirm: () => void;
  /** Disables interaction */
  disabled?: boolean;
  /** Shows a loading spinner in the thumb and locks interaction */
  pending?: boolean;
  /** Optional icon rendered inside the thumb (defaults to ChevronRight) */
  icon?: ReactNode;
  /** Track color variant */
  variant?: "green" | "orange";
  /** Extra CSS class for the outer wrapper */
  className?: string;
};

const THRESHOLD = 0.8; // 80% of track width to trigger

export function SlideToConfirm({
  label,
  onConfirm,
  disabled = false,
  pending = false,
  icon,
  variant = "green",
  className = "",
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);

  const thumbSize = 56;
  const trackPadding = 4;

  const getMaxX = useCallback(() => {
    if (!trackRef.current) return 0;
    return trackRef.current.offsetWidth - thumbSize - trackPadding * 2;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || pending || completed) return;
      dragging.current = true;
      startX.current = e.clientX - dragX;
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled, pending, completed, dragX]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const maxX = getMaxX();
      const newX = Math.max(0, Math.min(e.clientX - startX.current, maxX));
      setDragX(newX);
    },
    [getMaxX]
  );

  const handlePointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);

    const maxX = getMaxX();
    if (maxX > 0 && dragX / maxX >= THRESHOLD) {
      // Snap to end and trigger
      setDragX(maxX);
      setCompleted(true);
      onConfirm();
    } else {
      // Spring back
      setDragX(0);
    }
  }, [dragX, getMaxX, onConfirm]);

  // Compute label opacity (fades as thumb moves)
  const maxX = trackRef.current
    ? trackRef.current.offsetWidth - thumbSize - trackPadding * 2
    : 1;
  const labelOpacity = Math.max(0, 1 - (dragX / (maxX || 1)) * 1.5);

  // Progress fill width
  const fillWidth = dragX + thumbSize + trackPadding;

  const locked = disabled || pending;

  return (
    <div
      ref={trackRef}
      className={`slide-track ${variant === "orange" ? "slide-track-orange" : "slide-track-green"} ${locked ? "slide-disabled" : ""} ${completed ? "slide-success" : ""} ${className}`}
    >
      {/* Progress fill */}
      <div
        className="absolute inset-y-0 left-0 rounded-l-[32px]"
        style={{
          width: `${fillWidth}px`,
          background:
            variant === "orange"
              ? "linear-gradient(90deg, rgba(148,74,0,0.3) 0%, rgba(192,96,0,0.5) 100%)"
              : "linear-gradient(90deg, rgba(0,109,55,0.3) 0%, rgba(0,153,77,0.5) 100%)",
          transition: isDragging ? "none" : "width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />

      {/* Label */}
      <div
        className="slide-label"
        style={{
          opacity: labelOpacity,
          paddingLeft: `${thumbSize + trackPadding * 2}px`,
          transition: isDragging ? "none" : "opacity 0.35s ease",
        }}
      >
        {pending ? "Processing..." : label}
      </div>

      {/* Thumb */}
      <div
        className={`slide-thumb ${!isDragging && !completed && !locked ? "slide-thumb-hint" : ""}`}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {pending ? (
          <Loader2 className="h-6 w-6 animate-spin text-brand-muted" />
        ) : completed ? (
          <Check className="h-6 w-6 text-brand-green" strokeWidth={3} />
        ) : (
          icon ?? (
            <ChevronRight
              className={`h-6 w-6 ${variant === "orange" ? "text-brand-orange-deep" : "text-brand-green"}`}
              strokeWidth={2.5}
            />
          )
        )}
      </div>
    </div>
  );
}
