import React, { useState, useCallback, useEffect, useRef } from 'react';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BoundingBoxDrawerProps {
  enabled: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onBoxDrawn: (box: BoundingBox) => void;
}

export const BoundingBoxDrawer: React.FC<BoundingBoxDrawerProps> = ({
  enabled,
  containerRef,
  onBoxDrawn,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const [boxStyle, setBoxStyle] = useState<React.CSSProperties | null>(null);

  const initialRectRef = useRef<DOMRect | null>(null);
  const initialScrollRef = useRef<{ scrollTop: number; scrollLeft: number } | null>(null);

  const getRelativePosition = useCallback(
    (e: MouseEvent, rect: DOMRect, scroll: { scrollTop: number; scrollLeft: number }): { x: number; y: number } => {
      return {
        x: e.clientX - rect.left + scroll.scrollLeft,
        y: e.clientY - rect.top + scroll.scrollTop,
      };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!enabled || !containerRef.current) {return;}
      if (!containerRef.current.contains(e.target as Node)) {return;}

      e.preventDefault();

      const rect = containerRef.current.getBoundingClientRect();
      const scroll = {
        scrollTop: containerRef.current.scrollTop,
        scrollLeft: containerRef.current.scrollLeft,
      };

      initialRectRef.current = rect;
      initialScrollRef.current = scroll;

      const pos = getRelativePosition(e, rect, scroll);

      setIsDrawing(true);
      setStartPoint(pos);
      setCurrentBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
      setBoxStyle({
        left: e.clientX,
        top: e.clientY,
        width: 0,
        height: 0,
      });
    },
    [enabled, containerRef, getRelativePosition]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDrawing || !startPoint || !initialRectRef.current || !initialScrollRef.current) {return;}

      const rect = initialRectRef.current;
      const scroll = initialScrollRef.current;
      const pos = getRelativePosition(e, rect, scroll);

      const x = Math.min(startPoint.x, pos.x);
      const y = Math.min(startPoint.y, pos.y);
      const width = Math.abs(pos.x - startPoint.x);
      const height = Math.abs(pos.y - startPoint.y);

      setCurrentBox({ x, y, width, height });

      const viewportX = rect.left + x - scroll.scrollLeft;
      const viewportY = rect.top + y - scroll.scrollTop;

      setBoxStyle({
        left: viewportX,
        top: viewportY,
        width,
        height,
      });
    },
    [isDrawing, startPoint, getRelativePosition]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentBox) {return;}

    if (currentBox.width > 5 && currentBox.height > 5) {
      onBoxDrawn(currentBox);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBox(null);
    setBoxStyle(null);
    initialRectRef.current = null;
    initialScrollRef.current = null;
  }, [isDrawing, currentBox, onBoxDrawn]);

  useEffect(() => {
    if (!enabled) {return;}

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, handleMouseDown, handleMouseMove, handleMouseUp]);

  if (!enabled || !boxStyle) {return null;}

  return (
    <div
      className="fixed border-2 border-primary bg-primary/10 pointer-events-none z-50"
      style={boxStyle}
    />
  );
};
