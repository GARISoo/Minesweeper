/* eslint-disable react/no-array-index-key */
import { useEffect } from 'react';
import useAutoSolver from '../../hooks/useAutoSolver';
import useGame from '../../hooks/useGame';
import useGameContext from '../../hooks/useGameContext';
import socket from '../../socket';
import styles from './Minesweepers.module.scss';
import '../../App.scss';

const Minesweepers = () => {
  const {
    dispatch, field, flaggedCells, autoSolving, moves,
  } = useGameContext();
  const {
    startNewLevel, openCell, flagCell, startAutoSolve, handleCells,
  } = useGame();
  const { autoSolve } = useAutoSolver();

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

  const isFlagged = (x: number, y: number) => {
    const cell = `${x} ${y}`;
    const flagged = flaggedCells.includes(cell) ? 'flagged' : '';

    return flagged;
  };

  useEffect(() => {
    if (autoSolving) {
      const { newCellsToFlag, newCellsToOpen } = autoSolve();
      const solverStuck = !newCellsToFlag.length && !newCellsToOpen.length;

      if (solverStuck) {
        dispatch({ type: 'SET_AUTO_SOLVING', payload: false });
      } else {
        handleCells(newCellsToFlag, newCellsToOpen);
      }
    }
  }, [autoSolving, moves]);

  return (
    <div>
      <button onClick={() => socket.send('help')}>help</button>
      <button onClick={startAutoSolve}>solve</button>
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
      <div className={styles.field}>
        {field.map((cellsRow, y) => (
          <div key={y} className={styles.fieldRow}>
            {cellsRow.map((cell, x) => (
              <span
                className={`${styles.fieldCell} value${cell !== '*' ? cell : 'B'} ${cell === '□' && isFlagged(x, y)}`}
                onClick={() => openCell(x, y)}
                key={`${y} ${x}`}
                onContextMenu={(e) => handleRightClick(e, x, y, cell)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Minesweepers;
