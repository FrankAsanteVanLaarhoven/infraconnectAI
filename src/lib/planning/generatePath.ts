export function generatePath(event: any) {
  // Simplified mathematical Cartesian tracking bounding A* path matrices securely
  const start = { x: 0, y: 0 };
  const goal = { x: event.target ? event.target[0] : 5, y: event.target ? event.target[2] : 5 };

  const path: any[] = [];

  let x = start.x;
  let y = start.y;

  while (x !== goal.x || y !== goal.y) {
    if (x < goal.x) x++;
    else if (x > goal.x) x--;

    if (y < goal.y) y++;
    else if (y > goal.y) y--;

    path.push({ x, y });
  }

  return path;
}
