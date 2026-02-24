export const PUZZLE = {
    size: 4,
    clues: {
      top:    [2, 2, 1, 3],
      bottom: [2, 1, 3, 2],
      left:   [1, 3, 2, 2],
      right:  [3, 2, 1, 2],
    },
    solution: [
      [4, 2, 3, 1],
      [1, 3, 2, 4],
      [2, 4, 1, 3],
      [3, 1, 4, 2],
    ],
  };
  
  export type Board = number[][];
  export type Errors = boolean[][];
  export type Clues = {
    top: number[];
    bottom: number[];
    left: number[];
    right: number[];
  };
  
  // Returns how many skyscrapers are visible in a line of numbers
  export function countVisible(line: number[]): number {
    let maxHeight = 0;
    let visible = 0;
    for (const height of line) {
      if (height > maxHeight) {
        visible++;
        maxHeight = height;
      }
    }
    return visible;
  }
  
  // Validates the entire board against clues
  export function validateBoard(board: Board, clues: Clues, size: number): Errors {
    const errors: Errors = Array.from({ length: size }, () => Array(size).fill(false));
  
    for (let i = 0; i < size; i++) {
      const row = board[i];
      const col = board.map(r => r[i]);
  
      const rowNums = row.filter(n => n !== 0);
      if (new Set(rowNums).size !== rowNums.length) {
        row.forEach((_, j) => (errors[i][j] = true));
      }
  
      const colNums = col.filter(n => n !== 0);
      if (new Set(colNums).size !== colNums.length) {
        col.forEach((_, j) => (errors[j][i] = true));
      }
  
      if (rowNums.length === size) {
        if (clues.left[i] && countVisible(row) !== clues.left[i])
          row.forEach((_, j) => (errors[i][j] = true));
        if (clues.right[i] && countVisible([...row].reverse()) !== clues.right[i])
          row.forEach((_, j) => (errors[i][j] = true));
      }
  
      if (colNums.length === size) {
        if (clues.top[i] && countVisible(col) !== clues.top[i])
          col.forEach((_, j) => (errors[j][i] = true));
        if (clues.bottom[i] && countVisible([...col].reverse()) !== clues.bottom[i])
          col.forEach((_, j) => (errors[j][i] = true));
      }
    }
  
    return errors;
  }
  
  // Checks if the board matches the solution
  export function checkWin(board: Board, solution: Board): boolean {
    return solution.every((row, i) => row.every((val, j) => board[i][j] === val));
  }