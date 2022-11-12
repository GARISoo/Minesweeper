/* eslint-disable react/no-array-index-key */
import { useState, useRef, useEffect } from 'react';
import autoSolve from '../../helpers/autoSolver';
import useGame from '../../hooks/useGame';
import useGameContext from '../../hooks/useGameContext';
import { useHasChanged } from '../../hooks/usePrevious';
import socket from '../../socket';
import styles from './Minesweepers.module.scss';

const Minesweepers = () => {
  const { field, flaggedCells } = useGameContext();
  const {
    startNewLevel, openCell, openManyCells, flagCell, flagManyCells, getSrcPath,
  } = useGame();
  const [cellsToOpen, setCellsToOpen] = useState<string[]>([]);
  const [cellsToFlag, setCellsToFlag] = useState<string[]>([]);
  const [autoSolving, setAutoSolving] = useState(false);
  const hasCellsToFlagChanged = useHasChanged(cellsToFlag);
  const hasCellsToOpenChanged = useHasChanged(cellsToOpen);

  const ws = useRef<any>(null);

  const levels = [
    {
      id: 1,
      name: 'Beginner',
      handleNewLevel: () => startNewLevel(1),
    },
    {
      id: 2,
      name: 'Medium',
      handleNewLevel: () => startNewLevel(2),
    },
    {
      id: 3,
      name: 'Advanced',
      handleNewLevel: () => startNewLevel(3),
    },
    {
      id: 4,
      name: 'Hardcore',
      handleNewLevel: () => startNewLevel(4),
    },
  ];

  const handleRightClick = (e: any, x: number, y: number, value: string) => {
    e.preventDefault();

    flagCell(x, y, value);
  };

  const tryToSolve = () => {
    setAutoSolving(true);

    const { toOpen, toFlag } = autoSolve(field, flaggedCells);

    if (toFlag.length) {
      setCellsToFlag(toFlag);
    }
    if (toOpen.length) {
      setCellsToOpen(toOpen);
    }

    if (!toFlag.length && !toOpen.length) {
      setAutoSolving(false);
    }

    console.log('cellsToOpen:', cellsToOpen, 'cellsToFlag:', cellsToFlag);
  };

  // eslint-disable-next-line consistent-return
  // useEffect(() => {
  //   flagManyCellsAsBomb(cellsToFlag);
  //   manyCellsToOpen(cellsToOpen);

  //   if (autoSolving && (cellsToOpen.length || cellsToFlag.length)) {
  //     const interval = setInterval(tryToSolve, 1000);
  //     return () => clearInterval(interval);
  //   }
  // }, [cellsToFlag, cellsToOpen, autoSolving]);

  // if something doesnt work, remove this useffect
  useEffect(() => {
    if (hasCellsToFlagChanged && hasCellsToOpenChanged) {
      setAutoSolving(false);
      console.log('stopped');
    }
  }, [hasCellsToFlagChanged]);

  return (
    <div>
      <button onClick={() => socket.send('help')}>help</button>
      <button onClick={tryToSolve}>solve</button>
      <div>
        {levels.map(({ id, name, handleNewLevel }) => (
          <button
            className={styles.levelBtn}
            key={id}
            onClick={handleNewLevel}
          >
            {name}
          </button>
        ))}
      </div>
      <div>
        {field.map((cellsRow, y) => (
          <div key={Math.random() * 12345} className={styles.fieldRow}>
            {cellsRow.map((cell, x) => (
              <span
                className={styles.fieldCell}
                onClick={() => openCell(x, y)}
                key={`${y} ${x}`}
                onContextMenu={(e) => handleRightClick(e, x, y, cell)}
              >
                <img src={getSrcPath(cell, x, y)} alt="cell" className={styles.fieldCellSVG} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Minesweepers;
