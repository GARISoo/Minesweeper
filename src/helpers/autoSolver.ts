type CellInfo = {
  position: string;
  x: number;
  y: number;
  outOfBounds?: boolean;
  value: string;
  flagged: boolean;
  chanceOfBomb: number;
};

export const getCellInfo = (
  x: number, y: number, field: string[][], flaggedCells: string[], columns: number, rows: number, cell: string,
) => {
  const getCellValue = (yCord: number, xCord: number) => {
    const outOfBounds = xCord < 0 || xCord >= columns || yCord < 0 || yCord >= rows;

    if (outOfBounds) {
      return '';
    }

    return field[yCord][xCord];
  };

  const checkIfFlagged = (xCord: number, yCord: number) => flaggedCells.includes(`${xCord} ${yCord}`);

  const middleCell = cell;

  const surroundingCellInfo = [
    {
      position: 'topLeft',
      value: getCellValue(y - 1, x - 1),
      flagged: checkIfFlagged(x - 1, y - 1),
      chanceOfBomb: null,
      x: x - 1,
      y: y - 1,
    },
    {
      position: 'top',
      value: getCellValue(y - 1, x),
      flagged: checkIfFlagged(x, y - 1),
      chanceOfBomb: null,
      x,
      y: y - 1,
    },
    {
      position: 'topRight',
      value: getCellValue(y - 1, x + 1),
      flagged: checkIfFlagged(x + 1, y - 1),
      chanceOfBomb: null,
      x: x + 1,
      y: y - 1,
    },
    {
      position: 'right',
      value: getCellValue(y, x + 1),
      flagged: checkIfFlagged(x + 1, y),
      chanceOfBomb: null,
      x: x + 1,
      y,
    },
    {
      position: 'bottomRight',
      value: getCellValue(y + 1, x + 1),
      flagged: checkIfFlagged(x + 1, y + 1),
      chanceOfBomb: null,
      x: x + 1,
      y: y + 1,
    },
    {
      position: 'bottom',
      value: getCellValue(y + 1, x),
      flagged: checkIfFlagged(x, y + 1),
      chanceOfBomb: null,
      x,
      y: y + 1,
    },
    {
      position: 'bottomLeft',
      value: getCellValue(y + 1, x - 1),
      flagged: checkIfFlagged(x - 1, y + 1),
      chanceOfBomb: null,
      x: x - 1,
      y: y + 1,
    },
    {
      position: 'left',
      value: getCellValue(y, x - 1),
      flagged: checkIfFlagged(x - 1, y),
      chanceOfBomb: null,
      x: x - 1,
      y,
    },
  ];

  const revealedBombs = surroundingCellInfo.filter((el) => el.flagged).length;
  const unOpenedCells = surroundingCellInfo.filter((el) => el.value === '□').length;

  const cellValue = parseInt(middleCell, 10);
  const chanceToHitBomb = ((cellValue - revealedBombs) / unOpenedCells) * 100;

  // adds all surrounding cells 100% chance for a bomb
  if (chanceToHitBomb === 100) {
    const surroundingCells = surroundingCellInfo.map((el) => {
      const validCell = el.value === '□' && !el.flagged;

      if (validCell) {
        return { ...el, chanceOfBomb: 100 };
      }

      return el;
    });

    return { surroundingCells };
  }

  // adds all surrounding cells 0% chance for a bomb
  if (chanceToHitBomb === 0) {
    const surroundingCells = surroundingCellInfo.map((el) => {
      const validCell = el.value === '□' && !el.flagged;

      if (validCell) {
        return { ...el, chanceOfBomb: 0 };
      }

      return el;
    });

    return { surroundingCells };
  }

  // if chancetohitbomb is not 0 or 100, it will recalculate with specific cases
  // const surroundingCells = surroundingCellInfo.map((el) => {
  //   const outOfBounds = el.value === '';
  // });

  console.log('surroundingCellInfo', surroundingCellInfo);

  return { surroundingCells: surroundingCellInfo };
};

const autoSolve = (field: string[][], flaggedCells: string[]) => {
  const columns = field[0].length;
  const rows = field.length;

  const toFlag: string[] = [];
  const toOpen: string[] = [];

  // field.forEach((row, y) => row.forEach((cell, x) => {
  //   const cellNotOpened = cell === '□' || cell === '0';

  //   if (!cellNotOpened) {
  //     const { surroundingCells } = getCellInfo(x, y, field, flaggedCells, columns, rows, cell);

  //     if (allSurroundingCellsAreDangerous) {
  //       surroundingCells.forEach((el) => {
  //         const goodToPush = !el.outOfBounds && !el.flagged && el.value === '□';
  //         const alreadyPushed = toFlag.includes(`${el.x} ${el.y}`) || flaggedCells.includes(`${el.x} ${el.y}`);
  //         if (!alreadyPushed && goodToPush) {
  //           toFlag.push(`${el.x} ${el.y}`);
  //         }
  //       });
  //     } else if (allSurroundingCellsAreSafe) {
  //       surroundingCells.forEach((el) => {
  //         const goodToPush = !el.outOfBounds && !el.flagged && el.value === '□';
  //         const alreadyPushed = toOpen.includes(`${el.x} ${el.y}`) || flaggedCells.includes(`${el.x} ${el.y}`);
  //         if (!alreadyPushed && goodToPush) {
  //           toOpen.push(`${el.x} ${el.y}`);
  //         }
  //       });
  //     }
  //   }
  // }));

  return { toFlag, toOpen };
};

export default autoSolve;
