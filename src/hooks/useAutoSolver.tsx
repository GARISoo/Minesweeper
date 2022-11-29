import { CellInfo, getCellInfo } from '../helpers/autoSolver';
import useGameContext from './useGameContext';

const useAutoSolver = () => {
  const {
    dispatch, field, flaggedCells, columns, rows,
  } = useGameContext();

  const autoSolve = () => {
    const newCellsToFlag: string[] = [];
    const newCellsToOpen: string[] = [];
    // const newClearedCells: string[] = [];

    let restartLoop = false;

    // console.log(clearedCells);

    field.every((row, y) => {
      row.every((cell, x) => {
        const emptyCell = cell === '□' || cell === '0';
        // const cellHasBeenCleared = clearedCells.includes(`${x} ${y}`) || newClearedCells.includes(`${x} ${y}`);

        if (!emptyCell) {
          const { surroundingCells } = getCellInfo(x, y, field, flaggedCells, columns, rows, cell);

          const initialCellsToFlagLength = newCellsToFlag.length;
          const initialCellsToOpenLength = newCellsToOpen.length;

          surroundingCells.forEach((el: CellInfo) => {
            const chanceDetermined = el.chanceOfBomb !== null;
            const targetCell = `${el.x} ${el.y}`;

            if (chanceDetermined) {
              if (el.chanceOfBomb === 0) {
                const alreadySetToOpen = newCellsToOpen.includes(targetCell);

                if (!alreadySetToOpen) {
                  newCellsToOpen.push(targetCell);
                }
              } else if (el.chanceOfBomb === 100) {
                const alreadyFlagged = newCellsToFlag.includes(targetCell);

                if (!alreadyFlagged) {
                  newCellsToFlag.push(targetCell);
                }
              }
            }
          });

          // if (cellCleared) {
          //   const targetCell = `${x} ${y}`;
          //   const alreadyCleared = newClearedCells.includes(targetCell);

          //   if (!alreadyCleared) {
          //     newClearedCells.push(targetCell);
          //   }
          // }

          const cellsToFlagLengthChanged = newCellsToFlag.length !== initialCellsToFlagLength;
          const cellsToOpenLengthChanged = newCellsToOpen.length !== initialCellsToOpenLength;

          if (cellsToFlagLengthChanged || cellsToOpenLengthChanged) {
            restartLoop = true;
          }
        }

        return !restartLoop;
      });

      return !restartLoop;
    });

    return { newCellsToFlag, newCellsToOpen };
  };

  // nbmh

  return {
    autoSolve,
  };
};

export default useAutoSolver;
