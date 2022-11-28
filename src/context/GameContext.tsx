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
    flaggedCells: string[]
    clearedCells: string[]
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
    flaggedCells: string[]
    clearedCells: string[]
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
    case 'SET_CLEARED_CELLS':
      return { ...state, clearedCells: action.payload };
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
    flaggedCells: [],
    clearedCells: [],
    cellsToOpen: [],
    openingManyCells: false,
    rows: 0,
    columns: 0,
    autoSolving: false,
    moves: 0,
  });

  const ws = useRef<any>(null);
  const { cellsToOpen, flaggedCells } = state;

  useEffect(() => {
    const notEmpty = cellsToOpen.length;

    if (notEmpty) {
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
        console.log('Start');

        dispatch({ type: 'SET_FIELD', payload: adjustedField });

        const end = performance.now();

        console.log(`Time to set field: ${end - start}ms`);
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
