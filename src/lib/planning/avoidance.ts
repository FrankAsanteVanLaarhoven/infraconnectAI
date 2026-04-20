export function computeAvoidance(robot: any, others: any[]) {
  const force = { x: 0, y: 0 };

  others.forEach((o) => {
    if (o.id === robot.id) return;

    const dx = robot.position[0] - o.position[0];
    const dy = robot.position[2] - o.position[2];
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Dynamic repulsive mapping forcing parameters bounding absolute node geometries 1.5M securely
    if (dist > 0 && dist < 1.5) {
      force.x += dx / dist;
      force.y += dy / dist;
    }
  });

  return force;
}
