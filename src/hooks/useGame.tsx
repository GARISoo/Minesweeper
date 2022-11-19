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
    if (cells.length) {
      cells.forEach((cell) => {
        const [x, y] = cell.split(' ');
        openCell(Number(x), Number(y));
      });
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

  const handleCells = (newCellsToFlag: string[], newCellsToOpen: string[]) => {
    if (newCellsToFlag.length) {
      flagManyCells(newCellsToFlag);
    }

    if (newCellsToOpen.length) {
      openManyCells(newCellsToOpen);
    }

    // call dispatch after 1 sec and clear it and by adding moves triggers useEffect to rerun entire solver
    const timeout = setTimeout(() => {
      dispatch({ type: 'ADD_MOVES', payload: 1 });
    }, 1000);

    return () => clearTimeout(timeout);
  };

  const getSrcPath = (cell: string, x: number, y: number) => {
    let path = 'assets/mines/';

    switch (cell) {
      case '0':
        path += '0.svg';
        break;
      case '1':
        path += '1.svg';
        break;
      case '2':
        path += '2.svg';
        break;
      case '3':
        path += '3.svg';
        break;
      case '4':
        path += '4.svg';
        break;
      case '5':
        path += '5.svg';
        break;
      case '6':
        path += '6.svg';
        break;
      case '7':
        path += '7.svg';
        break;
      case '8':
        path += '8.svg';
        break;
      case '□':
        path += 'empty.svg';
        break;
      case '*':
        path += 'mine.svg';
        break;
      default:
        break;
    }

    const isFlaggedCell = flaggedCells.includes(`${x} ${y}`);

    if (isFlaggedCell) {
      path = 'assets/mines/flag.svg';
    }

    return path;
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
    getSrcPath,
    startAutoSolve,
    stopAutoSolve,
    handleCells,
  };
};

export default useGame;
