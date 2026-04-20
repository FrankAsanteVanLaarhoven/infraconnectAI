type Point = { x: number; y: number };

export function rrt(start: Point, goal: Point, obstacles: any[], maxIter = 1000) {
  const tree: Point[] = [start];

  function dist(a: Point, b: Point) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  function randomPoint() {
    return {
      x: Math.random() * 10 - 5, // Range mapped to initial grid bounds
      y: Math.random() * 10 - 5,
    };
  }

  function nearest(p: Point) {
    return tree.reduce((best, n) =>
      dist(n, p) < dist(best, p) ? n : best
    );
  }

  function step(from: Point, to: Point, stepSize = 0.5) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    return {
      x: from.x + (dx / len) * stepSize,
      y: from.y + (dy / len) * stepSize,
    };
  }

  function collides(node: Point, obstacles: any[]) {
      // Basic bounding box intersection math mapping
      for (const obs of obstacles) {
          if (dist(node, obs.pos) < 1.0) return true;
      }
      return false;
  }

  for (let i = 0; i < maxIter; i++) {
    const rand = randomPoint();
    const near = nearest(rand);
    const newNode = step(near, rand);

    if (!collides(newNode, obstacles)) {
      tree.push(newNode);

      if (dist(newNode, goal) < 0.5) {
        return [...tree, goal]; // Intent path established mathematically
      }
    }
  }

  return []; // Return empty if unresolved under iteration limits
}
