import { Point, Wall } from '../types';

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function distanceToLine(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function pointOnLine(point: Point, lineStart: Point, lineEnd: Point, threshold: number = 10): boolean {
  return distanceToLine(point, lineStart, lineEnd) < threshold;
}

export function getWallAngle(wall: Wall): number {
  return Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
}

export function getPointOnWall(wall: Wall, position: number): Point {
  const t = position;
  return {
    x: wall.start.x + (wall.end.x - wall.start.x) * t,
    y: wall.start.y + (wall.end.y - wall.start.y) * t
  };
}

export function snapToGrid(point: Point, gridSize: number = 10): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  };
}

export function getWallLength(wall: Wall): number {
  return distance(wall.start, wall.end);
}

export function normalizeVector(p1: Point, p2: Point): Point {
  const len = distance(p1, p2);
  if (len === 0) return { x: 0, y: 0 };
  return {
    x: (p2.x - p1.x) / len,
    y: (p2.y - p1.y) / len
  };
}

export function perpendicularVector(v: Point): Point {
  return { x: -v.y, y: v.x };
}

export function alignToAxis(start: Point, end: Point, threshold: number = 30): Point {
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  
  if (dx < threshold && dy >= threshold) {
    return { x: start.x, y: end.y };
  }
  
  if (dy < threshold && dx >= threshold) {
    return { x: end.x, y: start.y };
  }
  
  if (dx > dy) {
    return { x: end.x, y: start.y };
  } else {
    return { x: start.x, y: end.y };
  }
}

export function findNearestEndpoint(point: Point, walls: Wall[], snapDistance: number = 20): Point | null {
  let nearestPoint: Point | null = null;
  let minDistance = snapDistance;
  
  for (const wall of walls) {
    const distToStart = distance(point, wall.start);
    if (distToStart < minDistance) {
      minDistance = distToStart;
      nearestPoint = wall.start;
    }
    
    const distToEnd = distance(point, wall.end);
    if (distToEnd < minDistance) {
      minDistance = distToEnd;
      nearestPoint = wall.end;
    }
  }
  
  return nearestPoint;
}

export function findNearestWallMidpoint(point: Point, walls: Wall[], snapDistance: number = 20): Point | null {
  let nearestPoint: Point | null = null;
  let minDistance = snapDistance;
  
  for (const wall of walls) {
    const midpoint = {
      x: (wall.start.x + wall.end.x) / 2,
      y: (wall.start.y + wall.end.y) / 2
    };
    
    const distToMid = distance(point, midpoint);
    if (distToMid < minDistance) {
      minDistance = distToMid;
      nearestPoint = midpoint;
    }
  }
  
  return nearestPoint;
}
