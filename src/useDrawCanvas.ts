import { useRef, useState, useCallback, useEffect, RefObject } from "react";

export const useDrawCanvas = (props: {
  canvasRef: RefObject<HTMLCanvasElement>;
}) => {
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const positionRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  /**
   * 初期化
   */
  const init = useCallback(() => {
    const canvas = props.canvasRef.current;
    if (!canvas) {
      throw new Error('canvas is undefined');
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error('context is undefined');
    }

    ctx.fillStyle = "lightgray";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = ctx;
  }, [props.canvasRef]);
  useEffect(init, [init]);

  /**
   * 描画開始
   */
  const handleStart = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();

    const ctx = contextRef.current;
    if (!ctx) {
      throw new Error('context is undefined');
    }

    ctx.beginPath();
    positionRef.current = null;
    setIsDrawing(true);
  }, []);

  /**
   * 描画中
   */
  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      if (!isDrawing) {
        return;
      }

      const canvas = props.canvasRef.current;
      if (!canvas) {
        throw new Error('canvas is undefined');
      }
  
      const ctx = contextRef.current;
      if (!ctx) {
        throw new Error('context is undefined');
      }
  
      ctx.lineCap = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "black";

      const { x, y } = (() => {
        const rect = canvas.getBoundingClientRect();

        if (e instanceof MouseEvent) {
          return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
        }

        if (e instanceof TouchEvent) {
          return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top,
          };
        }

        throw new Error("invalid event");
      })();

      ctx.moveTo(positionRef.current?.x ?? x, positionRef.current?.y ?? y);
      ctx.lineTo(x, y);
      ctx.stroke();

      positionRef.current = { x, y };
    },
    [props.canvasRef, isDrawing],
  );

  /**
   * 描画終了
   */
  const handleEnd = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();

    const ctx = contextRef.current;
    if (!ctx) {
      throw new Error('context is undefined');
    }

    ctx.closePath();
    positionRef.current = null;
    setIsDrawing(false);
  }, []);

  /**
   * 全消し
   */
  const handleClear = useCallback(() => {
    init();
  }, [init]);

  /**
   * ダウンロード
   */
  const handleDownload = useCallback(() => {
    const canvas = props.canvasRef.current;
    if (!canvas) {
      throw new Error('canvas is undefined');
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg");
    link.download = "image.jpeg";
    link.click();
  }, [props.canvasRef]);

  /**
   * イベント登録
   */
  useEffect(() => {
    const canvas = props.canvasRef.current;
    if (!canvas) {
      throw new Error('canvas is undefined');
    }

    // for PC
    canvas.addEventListener("mousedown", handleStart, { passive: false });
    canvas.addEventListener("mousemove", handleMove, { passive: false });
    canvas.addEventListener("mouseup", handleEnd, { passive: false });

    // for Smartphone
    canvas.addEventListener("touchstart", handleStart, { passive: false });
    canvas.addEventListener("touchmove", handleMove, { passive: false });
    canvas.addEventListener("touchend", handleEnd, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", handleStart);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseup", handleEnd);
      canvas.removeEventListener("touchstart", handleStart);
      canvas.removeEventListener("touchmove", handleMove);
      canvas.removeEventListener("touchend", handleEnd);
    };
  }, [props.canvasRef, handleStart, handleMove, handleEnd]);

  return {
    clear: handleClear,
    download: handleDownload,
  };
};
