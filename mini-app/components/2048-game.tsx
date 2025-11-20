"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const GRID_SIZE = 4;

function emptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

export default function Game2048() {
  const [grid, setGrid] = useState(emptyGrid());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // start with two tiles
    addRandomTile(grid);
    addRandomTile(grid);
    // listen for arrow keys
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        move(e.key);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [grid, gameOver]);

  const addRandomTile = (currentGrid: number[][]) => {
    const empty = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    const newGrid = currentGrid.map(row => [...row]);
    newGrid[r][c] = value;
    setGrid(newGrid);
  };

  const compress = (row: number[]) => {
    const newRow = row.filter(v => v !== 0);
    while (newRow.length < GRID_SIZE) newRow.push(0);
    return newRow;
  };

  const merge = (row: number[]) => {
    for (let i = 0; i < GRID_SIZE - 1; i++) {
      if (row[i] !== 0 && row[i] === row[i + 1]) {
        row[i] *= 2;
        setScore(prev => prev + row[i]);
        row[i + 1] = 0;
      }
    }
    return row;
  };

  const move = (direction: string) => {
    let rotated = false;
    let newGrid = grid.map(row => [...row]);

    const rotate = (g: number[][]) => {
      const res = emptyGrid();
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          res[c][GRID_SIZE - 1 - r] = g[r][c];
        }
      }
      return res;
    };

    const reverse = (g: number[][]) => g.map(row => row.reverse());

    const apply = () => {
      for (let r = 0; r < GRID_SIZE; r++) {
        const compressed = compress(newGrid[r]);
        const merged = merge(compressed);
        newGrid[r] = compress(merged);
      }
    };

    switch (direction) {
      case "ArrowUp":
        newGrid = rotate(newGrid);
        rotated = true;
        break;
      case "ArrowDown":
        newGrid = rotate(rotate(newGrid));
        rotated = true;
        break;
      case "ArrowRight":
        newGrid = reverse(newGrid);
        break;
      case "ArrowLeft":
        // no change
        break;
    }

    apply();

    if (rotated) newGrid = rotate(rotate(rotate(newGrid)));
    if (direction === "ArrowRight") newGrid = reverse(newGrid);

    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      setGrid(newGrid);
      addRandomTile(newGrid);
      if (!hasMoves(newGrid)) setGameOver(true);
    }
  };

  const hasMoves = (g: number[][]) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) return true;
        if (c < GRID_SIZE - 1 && g[r][c] === g[r][c + 1]) return true;
        if (r < GRID_SIZE - 1 && g[r][c] === g[r + 1][c]) return true;
      }
    }
    return false;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-1">
        {grid.flat().map((val, idx) => (
          <div
            key={idx}
            className={`w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold ${
              val
                ? "bg-blue-200"
                : "bg-gray-200"
            }`}
          >
            {val || ""}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => move("ArrowUp")}>↑</Button>
        <Button onClick={() => move("ArrowLeft")}>←</Button>
        <Button onClick={() => move("ArrowDown")}>↓</Button>
        <Button onClick={() => move("ArrowRight")}>→</Button>
      </div>
      <div className="text-lg">Score: {score}</div>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-xl font-semibold">Game Over</div>
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
