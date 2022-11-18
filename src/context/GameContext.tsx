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

type GameContextType = {
    field: string[][]
    flaggedCells: string[]
    rows: number
    columns: number
    autoSolving: boolean
    moves: number
    dispatch: (arg: DispatchType) => void
}

export const GameContext = createContext({} as GameContextType);

export const useGame = () => useContext(GameContext);

export const gameReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, field: action.payload };
    case 'SET_FLAGGED_CELLS':
      return { ...state, flaggedCells: action.payload };
    case 'SET_ROWS':
      return { ...state, rows: action.payload };
    case 'ADD_MOVES':
      return { ...state, moves: state.moves + action.payload };
    case 'SET_COLUMNS':
      return { ...state, columns: action.payload };
    case 'SET_AUTO_SOLVING':
      return { ...state, autoSolving: action.payload };
    default:
      return state;
  }
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [state, dispatch] = useReducer(gameReducer, {
    field: [],
    flaggedCells: [],
    rows: 0,
    columns: 0,
    autoSolving: false,
    moves: 0,
  });

  const { autoSolve } = useAutoSolver();
  const ws = useRef<any>(null);

  useEffect(() => {
    socket.onopen = () => {
      socket.send('new 1');
    };

    socket.onclose = () => {
      console.log('closed');
    };

    socket.onmessage = ({ data }) => {
      const isNewMap = data.includes('map');

      if (isNewMap) {
        const adjustedField = data.split('\n').slice(1, -1).map((cell: string) => cell.split(''));
        dispatch({ type: 'SET_FIELD', payload: adjustedField });
        dispatch({ type: 'SET_ROWS', payload: adjustedField.length });
        dispatch({ type: 'SET_COLUMNS', payload: adjustedField[0].length });
      } else {
        socket.send('map');
      }
    };

    ws.current = socket;
  }, []);

  return (
    <GameContext.Provider
      value={{ ...state, dispatch }}
    >
      {children}
    </GameContext.Provider>
  );
};
