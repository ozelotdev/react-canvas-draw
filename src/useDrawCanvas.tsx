import { useRef, useState, useCallback, useEffect } from "react";

export const useDrawCanvas = (props: { width: number; height: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const positionRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  /**
   * 初期化
   */
  const init = useCallback(() => {
    const canvas = canvasRef.current!;
    canvas.width = props.width;
    canvas.height = props.height;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "lightgray";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = ctx;
  }, [props.width, props.height]);
  useEffect(init, [init]);

  /**
   * 描画開始
   */
  const handleStart = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();

    const ctx = contextRef.current!;

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

      const canvas = canvasRef.current!;
      const ctx = contextRef.current!;
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
    [isDrawing],
  );

  /**
   * 描画終了
   */
  const handleEnd = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();

    const ctx = contextRef.current!;

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
    const canvas = canvasRef.current!;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg");
    link.download = "image.jpeg";
    link.click();
  }, []);

  /**
   * イベント登録
   */
  useEffect(() => {
    const canvas = canvasRef.current!;

    // for PC
    canvas.addEventListener("mousedown", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseup", handleEnd);

    // for Smartphone
    canvas.addEventListener("touchstart", handleStart);
    canvas.addEventListener("touchmove", handleMove);
    canvas.addEventListener("touchend", handleEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleStart);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseup", handleEnd);
      canvas.removeEventListener("touchstart", handleStart);
      canvas.removeEventListener("touchmove", handleMove);
      canvas.removeEventListener("touchend", handleEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  const canvas = (
    <canvas
      ref={canvasRef}
      id="canvas"
      width={props.width}
      height={props.height}
    />
  );

  return {
    canvas,
    clear: handleClear,
    download: handleDownload,
  };
};
