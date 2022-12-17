import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import useAutoSolver from '../hooks/useAutoSolver';
import { useHasChanged } from '../hooks/usePrevious';
import socket from '../socket';

type GameProviderProps = {
    children: ReactNode
}

type DispatchType = {
    type: string,
    payload: unknown
}

type StateType = {
    field: string[][]
    allFields: string[][][]
    completedFields: string[]
    activeFieldCoords: string
    flaggedCells: string[]
    // clearedCells: string[]
    cellsToOpen: string[]
    rows: number
    columns: number
    autoSolving: boolean
    moves: number
}

type ActionType = {
    type: string,
    payload: any
}

type GameContextType = {
    field: string[][]
    allFields: string[][][]
    completedFields: string[]
    activeFieldCoords: string
    flaggedCells: string[]
    // clearedCells: string[]
    cellsToOpen: string[]
    rows: number
    columns: number
    autoSolving: boolean
    moves: number
    dispatch: (arg: DispatchType) => void
}

export const GameContext = createContext({} as GameContextType);

export const useGame = () => useContext(GameContext);

export const gameReducer = (state: StateType, action: ActionType) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state, field: action.payload, rows: action.payload.length, columns: action.payload[0].length,
      };
    case 'SET_FLAGGED_CELLS':
      return { ...state, flaggedCells: action.payload };
    case 'SET_ACTIVE_FIELD_COORDS':
      return { ...state, activeFieldCoords: action.payload };
    case 'SET_COMPLETED_FIELDS':
      return { ...state, completedFields: action.payload };
    // case 'SET_CLEARED_CELLS':
    //   return { ...state, clearedCells: action.payload };
    case 'ADD_MOVES':
      return { ...state, moves: state.moves + action.payload };
    case 'SET_AUTO_SOLVING':
      return { ...state, autoSolving: action.payload };
    case 'SET_OPENING_CELLS':
      return { ...state, openingManyCells: action.payload };
    case 'SET_CELLS_TO_OPEN':
      return { ...state, cellsToOpen: action.payload };
    default:
      return state;
  }
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [state, dispatch] = useReducer(gameReducer, {
    field: [],
    allFields: [],
    activeFieldCoords: '0 0',
    completedFields: [],
    flaggedCells: [],
    // clearedCells: [],
    cellsToOpen: [],
    openingManyCells: false,
    rows: 0,
    columns: 0,
    autoSolving: false,
    moves: 0,
  });

  const ws = useRef<any>(null);
  const {
    cellsToOpen, flaggedCells, field, completedFields, activeFieldCoords,
  } = state;

  const checkIfFieldBeenSolved = (fieldToCheck: string[][], cellsFlagged: string[]) => {
    if (!fieldToCheck.length) {
      return false;
    }

    const fieldBeenSolved = fieldToCheck.every((row: string[]) => row.every((cell: string) => {
      const cellIsNumber = !Number.isNaN(+cell);
      console.log(cellsFlagged);
      const cellIsFlagged = cellsFlagged.includes(`${row.indexOf(cell)} ${fieldToCheck.indexOf(row)}`);
      console.log(`${row.indexOf(cell)} ${fieldToCheck.indexOf(row)}`);
      return cellIsNumber || cellIsFlagged;
    }));
    console.log(fieldBeenSolved);
    if (fieldBeenSolved) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    const needToOpenCells = cellsToOpen.length;

    if (needToOpenCells) {
      const [x, y] = cellsToOpen[0].split(' ').map((el: string) => +el);
      const cellNotFlagged = !flaggedCells.includes(`${x} ${y}`);

      const newCellsToOpen = cellsToOpen.slice(1);

      dispatch({ type: 'SET_CELLS_TO_OPEN', payload: newCellsToOpen });

      if (cellNotFlagged) {
        ws.current.send(`open ${x} ${y}`);
      }
    }
  }, [cellsToOpen]);

  useEffect(() => {
    socket.onopen = () => {
      socket.send('new 1');
    };

    socket.onclose = () => {
      console.log('closed');
    };

    socket.onmessage = ({ data }) => {
      const isNewMap = data.includes('map');

      if (isNewMap && !cellsToOpen.length) {
        const adjustedField = data.split('\n').slice(1, -1).map((cell: string) => cell.split(''));

        const start = performance.now();
        // console.log('Start');

        const columns = adjustedField[0].length;
        const rows = adjustedField.length;

        const colLimit = 20;
        const rowLimit = 25;

        const yParts = rows / rowLimit;
        const xParts = columns / colLimit;
        // const fieldAmount = xParts * yParts;

        const fieldCoords = yParts > 1 ? (
          Array.from({ length: yParts }, (_y, i) => Array.from({ length: xParts }, (_x, j) => `${i} ${j}`))
        ) : (
          Array.from({ length: xParts }, (_x, j) => `0 ${j}`)
        );

        const allFields = fieldCoords.length ? fieldCoords : ['0 0'];

        for (let i = 0; i < yParts; i += 1) {
          const activeRow = Number(activeFieldCoords[2]);

          if (activeRow !== i) {
            i += 1;
          } else {
            for (let j = 0; j < xParts; j += 1) {
              const activeCol = Number(activeFieldCoords[0]);

              if (activeCol !== j) {
                j += 1;
              } else {
                const partOfField = adjustedField.slice(i * rowLimit, i * rowLimit + rowLimit).map(
                  (row: string[]) => row.slice(j * colLimit, j * colLimit + colLimit),
                );

                const solved = checkIfFieldBeenSolved(partOfField, flaggedCells);

                if (solved) {
                  dispatch({ type: 'SET_COMPLETED_FIELDS', payload: [...completedFields, `${j} ${i}`] });
                  const nextX = j === xParts - 1 ? 0 : j + 1;
                  const nextY = i === yParts - 1 ? 0 : i + 1;

                  const nextFieldCoords = `${nextX} ${nextY}`;

                  const nextPartOfField = adjustedField.slice(nextY * rowLimit, nextY * rowLimit + rowLimit).map(
                    (row: string[]) => row.slice(nextX * colLimit, nextX * colLimit + colLimit),
                  );

                  dispatch({ type: 'SET_FIELD', payload: nextPartOfField });
                  dispatch({ type: 'SET_ACTIVE_FIELD_COORDS', payload: nextFieldCoords });
                } else {
                  dispatch({ type: 'SET_FIELD', payload: partOfField });
                  break;
                }
              }
            }
          }
        }

        console.log('fieldsCoords', allFields);

        const end = performance.now();

        // console.log(`Time to set field: ${end - start}ms`);
      } else {
        socket.send('map');
      }
    };

    ws.current = socket;
  }, [ws]);

  return (
    <GameContext.Provider
      value={{ ...state, dispatch }}
    >
      {children}
    </GameContext.Provider>
  );
};
