import { useState, useRef, useEffect } from 'react';
import socket from '../../socket';
import styles from './Minesweeper.module.scss';

const levels = [
  {
    id: 1,
    name: 'Beginner',
    handleNewLevel: () => socket.send('new 1'),
  },
  {
    id: 2,
    name: 'Medium',
    handleNewLevel: () => socket.send('new 2'),
  },
  {
    id: 3,
    name: 'Advanced',
    handleNewLevel: () => socket.send('new 3'),
  },
  {
    id: 4,
    name: 'Hardcore',
    handleNewLevel: () => socket.send('new 4'),
  },
];

const Minesweeper = () => {
  const [field, setField] = useState<string[][]>([]);
  const [flaggedCells, setFlaggedCells] = useState<string[]>([]);
  const ws = useRef<any>(null);

  useEffect(() => {
    socket.onopen = () => {
      socket.send('new 1');
    };

    socket.onclose = () => {
      console.log('closed');
    };

    socket.onmessage = ({ data }) => {
      if (data.includes('new') || data.includes('open: OK')
      || data.includes('open: You lose') || data.includes('open: You win')) {
        socket.send('map');
      }
      if (data.includes('map')) {
        const adjustedField = data.split('\n').slice(1, -1).map((cell: any) => cell.split(''));
        setField(adjustedField);
        setFlaggedCells([]);
      }
    };

    ws.current = socket;
  }, []);

  const openCell = (x: number, y: number) => {
    const checkFlaggedCell = flaggedCells.includes(`${x}${y}`);

    if (!checkFlaggedCell) {
      socket.send(`open ${x} ${y}`);
    }
  };

  const determineSVG = (cell: string, x: number, y: number) => {
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

    const checkFlaggedCell = flaggedCells.includes(`${x}${y}`);

    if (checkFlaggedCell) {
      path = 'assets/mines/flag.svg';
    }

    return path;
  };

  const handleRightClick = (e: any, x: number, y: number) => {
    e.preventDefault();

    const cell = `${x}${y}`;

    if (flaggedCells.includes(cell)) {
      setFlaggedCells(flaggedCells.filter((el) => el !== cell));
    } else {
      setFlaggedCells([...flaggedCells, cell]);
    }
  };

  return (
    <div>
      <button onClick={() => socket.send('help')}>help</button>
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
      <div>
        {field.map((cellsRow, y) => (
          <div key={Math.random() * 15785} className={styles.fieldRow}>
            {cellsRow.map((cell, x) => (
              <span
                className={styles.fieldCell}
                onClick={() => openCell(x, y)}
                key={Math.random() * 15785}
                onContextMenu={(e) => handleRightClick(e, x, y)}
              >
                <img src={determineSVG(cell, x, y)} alt="cell" className={styles.fieldCellSVG} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Minesweeper;
