import socket from '../socket';
import useGameContext from './useGameContext';

const useGame = () => {
  const { dispatch, flaggedCells } = useGameContext();

  const startNewLevel = (level: number) => {
    socket.send(`new ${level}`);

    dispatch({ type: 'SET_FLAGGED_CELLS', payload: [] });
  };

  const openCell = (x: number, y: number) => {
    const cellNotFlagged = !flaggedCells.includes(`${x} ${y}`);

    if (cellNotFlagged) {
      socket.send(`open ${x} ${y}`);
    }
  };

  const openManyCells = (cells: string[]) => {
    const notEmpty = cells.length;

    if (notEmpty) {
      dispatch({ type: 'SET_CELLS_TO_OPEN', payload: cells });
    }
  };

  const flagCell = (x: number, y: number, value: string) => {
    const cell = `${x} ${y}`;
    const isEmptyCell = value === '□';

    if (isEmptyCell) {
      const alreadyFlagged = flaggedCells.includes(cell);

      if (alreadyFlagged) {
        const fieldWithRemovedFlag = flaggedCells.filter((el) => el !== cell);

        dispatch({ type: 'SET_FLAGGED_CELLS', payload: fieldWithRemovedFlag });
      } else {
        const fieldWithAddedFlag = [...flaggedCells, cell];

        dispatch({ type: 'SET_FLAGGED_CELLS', payload: fieldWithAddedFlag });
      }
    }
  };

  const flagManyCells = (cells: string[]) => {
    const cellsToFlag = cells.filter((cell) => !flaggedCells.includes(cell));
    const fieldWithAddedFlags = [...flaggedCells, ...cellsToFlag];

    dispatch({ type: 'SET_FLAGGED_CELLS', payload: fieldWithAddedFlags });
  };

  // const clearManyCells = (cells: string[]) => {
  //   const cellsToClear = cells.filter((cell) => !clearedCells.includes(cell));
  //   const fieldWithClearedCells = [...clearedCells, ...cellsToClear];

  //   dispatch({ type: 'SET_CLEARED_CELLS', payload: fieldWithClearedCells });
  // };

  const handleCells = (newCellsToFlag: string[], newCellsToOpen: string[]) => {
    // if (newClearedCells.length) {
    //   clearManyCells(newClearedCells);
    // }

    if (newCellsToFlag.length) {
      flagManyCells(newCellsToFlag);
    }

    if (newCellsToOpen.length) {
      openManyCells(newCellsToOpen);
    }

    // call dispatch after 1 sec and clear it and by adding moves triggers useEffect to rerun entire solver
    const timeout = setTimeout(() => {
      dispatch({ type: 'ADD_MOVES', payload: 1 });
    }, 10);

    return () => clearTimeout(timeout);
  };

  const startAutoSolve = () => {
    dispatch({ type: 'SET_AUTO_SOLVING', payload: true });
  };

  const stopAutoSolve = () => {
    dispatch({ type: 'SET_AUTO_SOLVING', payload: false });
  };

  return {
    startNewLevel,
    flagCell,
    flagManyCells,
    openCell,
    openManyCells,
    startAutoSolve,
    stopAutoSolve,
    handleCells,
  };
};

export default useGame;
