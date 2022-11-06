type CellInfo = {
  position: string;
  x: number;
  y: number;
  outOfBounds?: boolean;
  value: string;
  flagged: boolean;
};

const getSurroundingCellsInfo = (
  cell: string, x: number, y: number, field: string[][], flaggedCells: string[], columns: number, rows: number,
) => {
  const cellsToOpen = [];
  const cellsToFlag = [];
  let surroundingBombsRevealed: string[] = [];

  if (cell === '0' || cell === '□') {
    return null;
  }

  let surroundingCells = [
    {
      position: 'topLeft',
      x: x - 1,
      y: y - 1,
    },
    {
      position: 'top',
      x,
      y: y - 1,
    },
    {
      position: 'topRight',
      x: x + 1,
      y: y - 1,
    },
    {
      position: 'right',
      x: x + 1,
      y,
    },
    {
      position: 'bottomRight',
      x: x + 1,
      y: y + 1,
    },
    {
      position: 'bottom',
      x,
      y: y + 1,
    },
    {
      position: 'bottomLeft',
      x: x - 1,
      y: y + 1,
    },
    {
      position: 'left',
      x: x - 1,
      y,
    },
  ];

  // checks if out of bounds and adds known values of the in bounds cells
  surroundingCells = surroundingCells.map((el) => {
    let outOfBounds = false;
    let value = '';

    if (el.x < 0 || el.y < 0) {
      outOfBounds = true;
    } else if (el.x >= columns || el.y >= rows) {
      outOfBounds = true;
    } else {
      value = field[el.x][el.y];

      const alreadyFlagged = flaggedCells.includes(`${el.x} ${el.y}`);

      if (alreadyFlagged) {
        surroundingBombsRevealed = [...surroundingBombsRevealed, `${el.x} ${el.y}`];
      }
    }

    return { ...el, outOfBounds, value };
  });

  return surroundingCells;
};

const getCellInfo = (
  x: number, y: number, field: string[][], flaggedCells: string[], columns: number, rows: number,
) => {
  const surroundingCells = [
    {
      position: 'topLeft',
      x: x - 1,
      y: y - 1,
    },
    {
      position: 'top',
      x,
      y: y - 1,
    },
    {
      position: 'topRight',
      x: x + 1,
      y: y - 1,
    },
    {
      position: 'right',
      x: x + 1,
      y,
    },
    {
      position: 'bottomRight',
      x: x + 1,
      y: y + 1,
    },
    {
      position: 'bottom',
      x,
      y: y + 1,
    },
    {
      position: 'bottomLeft',
      x: x - 1,
      y: y + 1,
    },
    {
      position: 'left',
      x: x - 1,
      y,
    },
  ];

  let revealedBombs = 0;
  let unOpenedCells = 0;

  // checks if out of bounds and adds known values of the in bounds cells
  const surroundingCellsInfo = surroundingCells.map((el) => {
    let outOfBounds = false;
    let value = '';
    let flagged = false;

    if (el.x < 0 || el.y < 0) {
      outOfBounds = true;
    } else if (el.x >= columns || el.y >= rows) {
      outOfBounds = true;
    } else {
      value = field[el.y][el.x];
      const alreadyFlagged = flaggedCells.includes(`${el.x} ${el.y}`);

      if (alreadyFlagged) {
        flagged = true;
        revealedBombs += 1;
      } else if (value === '□') {
        unOpenedCells += 1;
      }
    }

    return {
      ...el, outOfBounds, value, flagged,
    };
  });

  return { cellInfo: surroundingCellsInfo, revealedBombs, unOpenedCells };
};

const checkCellStatus = (cellInfo: CellInfo[]) => {

};

const autoSolve = (field: string[][], flaggedCells: string[]) => {
  const columns = field[0].length;
  const rows = field.length;

  const cellsToFlag: string[] = [];
  const cellsToOpen: string[] = [];

  field.forEach((row, y) => row.forEach((cell, x) => {
    const cellNotOpened = cell === '□' || cell === '0';

    if (!cellNotOpened) {
      const { cellInfo, revealedBombs, unOpenedCells } = getCellInfo(x, y, field, flaggedCells, columns, rows);
      const cellValue = parseInt(cell, 10);
      const chanceToHitBomb = ((cellValue - revealedBombs) / unOpenedCells) * 100;
      console.log(chanceToHitBomb);
      // const possibleBombs = cellValue - revealedBombs;
      // const chanceToHitABomb = possibleBombs / unOpenedCells;
      // console.log(chanceToHitABomb);
      // console.log(cellValue);
      // const chanceToHitBomb = (unOpenedCells / (cellValue)) * 100;
      // const chanceToHitBomb = ((unOpenedCells - (cellValue - revealedBombs)) / unOpenedCells) * 100;
      // console.log(chanceToHitBomb);
      // calculate chance to hit a bomb from the surrounding cells

      // calculate chance to hit a bomb from the surrounding cells
      // const chanceToHitBomb = (cellValue - surroundingBombs) / (8 - surroundingBombs);
      // console.log(cellValue, surroundingBombs);
      // const surroundingCellsFlagged = cellInfo.filter((el) => el.flagged).length;
      // const surroundingCellsOpened = cellInfo.filter((el) => el.value !== '□' && el.value !== '0').length;
      // const surroundingCells = cellInfo.filter((el) => !el.outOfBounds);
      // const surroundingCellsToFlag = surroundingCells.filter((el) => el.value === '□' || el.value === '0');
      // const surroundingCellsToOpen = surroundingCells.filter((el) => el.value !== '□' && el.value !== '0');

      // calculate chance of bomb in each cell and flag it if it's 100%
      // if it's 0% open it
      // if it's 50% open it if there are 2 bombs around
      // if it's 33% open it if there are 3 bombs around
      // if it's 25% open it if there are 4 bombs around
      // if it's 20% open it if there are 5 bombs around
      // if it's 16% open it if there are 6 bombs around
      // if it's 14% open it if there are 7 bombs around
      // if it's 12% open it if there are 8 bombs around

      // console.log(cellInfo);
      // const { dangerousCell, safeCell } = checkCellStatus(cellInfo);

      // if (dangerousCell) {
      //   cellsToFlag.push(`${x} ${y}`);
      // }

      // if (safeCell) {
      //   cellsToOpen.push(`${x} ${y}`);
      // }
    }
  }));

  return { cellsToFlag, cellsToOpen };
};

// make an algorithm for minesweeper auto solver

export default autoSolve;
