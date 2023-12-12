import { FC, useRef } from "react";
import { useDrawCanvas } from "./useDrawCanvas";

export const App: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { clear, download } = useDrawCanvas({ canvasRef });

  return (
    <>
      <h1>react-canvas-draw</h1>
      <div>
        <canvas ref={canvasRef} id="canvas" width="800" height="400" />
      </div>
      <button onClick={clear}>Clear</button>
      <button onClick={download}>Download</button>
    </>
  );
};
