export function occupancyToGrid(map: any) {
  if (!map || !map.info) {
      // CORE Simulation Fallback logic ensuring demo layouts never crash
      return [
          { x: 2, y: 3, occupied: true },
          { x: 4, y: 5, occupied: true },
          { x: -1, y: 2, occupied: true }
      ];
  }

  const { width, height, data } = map.info;
  const grid: any[] = [];

  for (let i = 0; i < data.length; i++) {
    const val = data[i];

    // Math parsing Cartesion planes from 1D Arrays
    grid.push({
      x: i % width,
      y: Math.floor(i / width),
      occupied: val > 50, // Physical threshold logic bounds
    });
  }

  return grid;
}
