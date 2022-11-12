import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useReducer,
  useRef,
} from 'react';
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
    default:
      return state;
  }
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [state, dispatch] = useReducer(gameReducer, {
    field: [],
    flaggedCells: [],
  });

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
