import { getCellInfo } from '../helpers/autoSolver';
import useGameContext from './useGameContext';

const useAutoSolver = () => {
  const {
    dispatch, field, flaggedCells, columns, rows,
  } = useGameContext();

  const autoSolve = () => {
    const newCellsToFlag: string[] = [];
    const newCellsToOpen: string[] = [];

    field.forEach((row, y) => row.forEach((cell, x) => {
      const emptyCell = cell === '□' || cell === '0';

      if (!emptyCell) {
        const { surroundingCells } = getCellInfo(x, y, field, flaggedCells, columns, rows, cell);

        surroundingCells.forEach((el) => {
          const chanceDetermined = el.chanceOfBomb !== null;
          const targetCell = `${el.x} ${el.y}`;

          if (chanceDetermined) {
            if (el.chanceOfBomb === 0) {
              newCellsToOpen.push(targetCell);
            } else if (el.chanceOfBomb === 100) {
              const alreadyFlagged = newCellsToFlag.includes(targetCell);

              if (!alreadyFlagged) {
                newCellsToFlag.push(targetCell);
              }
            }
          }
        });
      }
    }));

    return { newCellsToFlag, newCellsToOpen };
  };

  // nbmh

  return {
    autoSolve,
  };
};

export default useAutoSolver;
