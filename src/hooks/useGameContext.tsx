import { useContext } from 'react';
import { GameContext } from '../context/GameContext';

const useGameContext = () => {
  const context = useContext(GameContext);

  if (!context) {
    throw Error('useGameContext must be used inside an GameContextProvider');
  }

  return context;
};

export default useGameContext;
