export type Point = { x: number; y: number };

export interface CostMap {
  width: number;
  height: number;
  isRestricted: (p: Point) => boolean;
  getCost: (p: Point) => number;
}

export function aStar(grid: CostMap, start: Point, goal: Point): Point[] {
  const open: Point[] = [start];
  const cameFrom = new Map<string, Point>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const key = (n: Point) => `${n.x},${n.y}`;

  gScore.set(key(start), 0);
  fScore.set(key(start), heuristic(start, goal));

  function heuristic(a: Point, b: Point) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  
  function reconstruct(cameFrom: Map<string, Point>, current: Point) {
      const path = [current];
      while (cameFrom.has(key(current))) {
          current = cameFrom.get(key(current))!;
          path.unshift(current);
      }
      return path;
  }
  
  function getNeighbors(grid: CostMap, p: Point) {
      const dirs = [
          {x: p.x + 1, y: p.y}, {x: p.x - 1, y: p.y},
          {x: p.x, y: p.y + 1}, {x: p.x, y: p.y - 1}
      ];
      return dirs.filter(n => 
          n.x >= 0 && n.x < grid.width && 
          n.y >= 0 && n.y < grid.height && 
          !grid.isRestricted(n)
      );
  }

  while (open.length > 0) {
    open.sort((a, b) => (fScore.get(key(a)) ?? Infinity) - (fScore.get(key(b)) ?? Infinity));
    const current = open.shift()!;

    if (current.x === goal.x && current.y === goal.y) {
      return reconstruct(cameFrom, current);
    }

    for (const n of getNeighbors(grid, current)) {
      const movementCost = grid.getCost(n);
      const tentative = (gScore.get(key(current)) ?? Infinity) + movementCost + 1;

      if (tentative < (gScore.get(key(n)) ?? Infinity)) {
        cameFrom.set(key(n), current);
        gScore.set(key(n), tentative);
        fScore.set(key(n), tentative + heuristic(n, goal));

        if (!open.find(o => key(o) === key(n))) {
            open.push(n);
        }
      }
    }
  }

  return [];
}

