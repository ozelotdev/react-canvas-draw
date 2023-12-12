import { FC } from "react";
import { useDrawCanvas } from "./useDrawCanvas";

export const App: FC = () => {
  const { canvas, clear, download } = useDrawCanvas({
    width: 800,
    height: 400,
  });

  return (
    <>
      <h1>react-canvas-draw</h1>
      <div>{canvas}</div>
      <button onClick={clear}>Clear</button>
      <button onClick={download}>Download</button>
    </>
  );
};
