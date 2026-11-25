import { useRef, useEffect, useState, useCallback } from 'react';
import { Wall, Opening, Dimension, Tool, Point, DragState, Bed, Wardrobe, Stair } from '../types';
import { Unit, formatLength, formatArea } from '../utils/units';
import { distance, distanceToLine, snapToGrid, getWallLength, getPointOnWall, getWallAngle, normalizeVector, perpendicularVector, alignToAxis, findNearestEndpoint, findNearestWallMidpoint } from '../utils/geometry';

interface FloorPlanCanvasProps {
  currentTool: Tool;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onToolChange: (tool: Tool) => void;
  wallThickness: number;
  openingWidth: number;
  walls: Wall[];
  setWalls: (walls: Wall[] | ((prev: Wall[]) => Wall[])) => void;
  openings: Opening[];
  setOpenings: (openings: Opening[] | ((prev: Opening[]) => Opening[])) => void;
  dimensions: Dimension[];
  setDimensions: (dimensions: Dimension[] | ((prev: Dimension[]) => Dimension[])) => void;
  beds: Bed[];
  setBeds: (beds: Bed[] | ((prev: Bed[]) => Bed[])) => void;
  bedSize: 'queen' | 'single';
  wardrobes: Wardrobe[];
  setWardrobes: (wardrobes: Wardrobe[] | ((prev: Wardrobe[]) => Wardrobe[])) => void;
  wardrobeWidth: number;
  wardrobeHeight: number;
  stairs: Stair[];
  setStairs: (stairs: Stair[] | ((prev: Stair[]) => Stair[])) => void;
  stairWidth: number;
  stairHeight: number;
  saveToHistory: () => void;
  furnitureKind: string;
  furnitureLabel: string;
  unit: Unit;
  backgroundImage?: { img: HTMLImageElement; scale: number; opacity: number } | null;
}

export default function FloorPlanCanvas({
  currentTool,
  selectedElementId,
  onSelectElement,
  onToolChange,
  wallThickness,
  openingWidth,
  walls,
  setWalls,
  openings,
  setOpenings,
  dimensions,
  setDimensions,
  beds,
  setBeds,
  bedSize,
  wardrobes,
  setWardrobes,
  wardrobeWidth,
  wardrobeHeight,
  stairs,
  setStairs,
  stairWidth,
  stairHeight,
  saveToHistory,
  furnitureKind,
  furnitureLabel,
  unit,
  backgroundImage,
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tempWallStart, setTempWallStart] = useState<Point | null>(null);
  const [tempRoomStart, setTempRoomStart] = useState<Point | null>(null);
  const [tempDimensionStart, setTempDimensionStart] = useState<Point | null>(null);
  const [tempDimensionEnd, setTempDimensionEnd] = useState<Point | null>(null);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<DragState>({ type: null, elementId: null, startPoint: null });
  const [scale] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const [isPanning, setIsPanningState] = useState(false);
  const setIsPanning = useCallback((value: boolean) => {
    isPanningRef.current = value;
    setIsPanningState(value);
  }, []);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: ((e.clientX - rect.left) * scaleX - panOffset.x) / zoom,
      y: ((e.clientY - rect.top) * scaleY - panOffset.y) / zoom,
    };
  }, [zoom, panOffset]);

  const findWallAtPoint = useCallback((point: Point): Wall | null => {
    for (const wall of walls) {
      if (distanceToLine(point, wall.start, wall.end) < wall.thickness / 2 + 10) {
        return wall;
      }
    }
    return null;
  }, [walls]);

  const findWallEndpoint = useCallback((point: Point): { wall: Wall; endpoint: 'start' | 'end' } | null => {
    for (const wall of walls) {
      if (distance(point, wall.start) < 15) {
        return { wall, endpoint: 'start' };
      }
      if (distance(point, wall.end) < 15) {
        return { wall, endpoint: 'end' };
      }
    }
    return null;
  }, [walls]);

  const findBedAtPoint = useCallback((point: Point) => {
    return beds.find(bed => {
      const bedWidth = bed.size === 'queen' ? 180 : 120;
      const bedHeight = 200;
      
      const dx = point.x - bed.position.x;
      const dy = point.y - bed.position.y;
      
      const cos = Math.cos(-bed.rotation);
      const sin = Math.sin(-bed.rotation);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      
      return Math.abs(localX) < bedWidth / 2 && Math.abs(localY) < bedHeight / 2;
    });
  }, [beds]);

  const findOpeningAtPoint = useCallback((point: Point): Opening | null => {
    for (const opening of openings) {
      const wall = walls.find(w => w.id === opening.wallId);
      if (!wall) continue;
      
      const openingPoint = getPointOnWall(wall, opening.position);
      const wallDir = normalizeVector(wall.start, wall.end);
      const openingWidthInPixels = opening.width * scale;
      
      const halfWidth = openingWidthInPixels / 2;
      const leftPoint = {
        x: openingPoint.x - wallDir.x * halfWidth,
        y: openingPoint.y - wallDir.y * halfWidth
      };
      const rightPoint = {
        x: openingPoint.x + wallDir.x * halfWidth,
        y: openingPoint.y + wallDir.y * halfWidth
      };
      
      if (distanceToLine(point, leftPoint, rightPoint) < wall.thickness / 2 + 10) {
        return opening;
      }
    }
    return null;
  }, [openings, walls]);

  const findDimensionSnapPoint = useCallback((point: Point) => {
    const snapThreshold = 20;
    
    // Check wall edges (start and end points)
    for (const wall of walls) {
      if (distance(point, wall.start) < snapThreshold) {
        return {
          point: wall.start,
          attachment: { elementId: wall.id, elementType: 'wall' as const, edge: 'start' as const }
        };
      }
      if (distance(point, wall.end) < snapThreshold) {
        return {
          point: wall.end,
          attachment: { elementId: wall.id, elementType: 'wall' as const, edge: 'end' as const }
        };
      }
    }
    
    // Check opening edges (left and right sides)
    for (const opening of openings) {
      const wall = walls.find(w => w.id === opening.wallId);
      if (!wall) continue;
      
      const openingPoint = getPointOnWall(wall, opening.position);
      const wallDir = normalizeVector(wall.start, wall.end);
      const openingWidthInPixels = opening.width * scale;
      const halfWidth = openingWidthInPixels / 2;
      
      const leftPoint = {
        x: openingPoint.x - wallDir.x * halfWidth,
        y: openingPoint.y - wallDir.y * halfWidth
      };
      const rightPoint = {
        x: openingPoint.x + wallDir.x * halfWidth,
        y: openingPoint.y + wallDir.y * halfWidth
      };
      
      if (distance(point, leftPoint) < snapThreshold) {
        return {
          point: leftPoint,
          attachment: { elementId: opening.id, elementType: 'opening' as const, edge: 'left' as const }
        };
      }
      if (distance(point, rightPoint) < snapThreshold) {
        return {
          point: rightPoint,
          attachment: { elementId: opening.id, elementType: 'opening' as const, edge: 'right' as const }
        };
      }
    }
    
    return null;
  }, [walls, openings, scale]);

  const findWardrobeAtPoint = useCallback((point: Point) => {
    return wardrobes.find(wardrobe => {
      const dx = point.x - wardrobe.position.x;
      const dy = point.y - wardrobe.position.y;
      
      const cos = Math.cos(-wardrobe.rotation);
      const sin = Math.sin(-wardrobe.rotation);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      
      const halfWidth = (wardrobe.width * scale) / 2;
      const halfHeight = (wardrobe.height * scale) / 2;
      
      return Math.abs(localX) < halfWidth && Math.abs(localY) < halfHeight;
    });
  }, [wardrobes, scale]);

  const findStairAtPoint = useCallback((point: Point) => {
    return stairs.find(stair => {
      const dx = point.x - stair.position.x;
      const dy = point.y - stair.position.y;
      
      const cos = Math.cos(-stair.rotation);
      const sin = Math.sin(-stair.rotation);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      
      const halfWidth = (stair.width * scale) / 2;
      const halfHeight = (stair.height * scale) / 2;
      
      return Math.abs(localX) < halfWidth && Math.abs(localY) < halfHeight;
    });
  }, [stairs, scale]);

  const findNearestWallFace = useCallback((point: Point) => {
    const snapThreshold = 30;
    let nearestWall: Wall | null = null;
    let minDist = snapThreshold;
    let snapPosition: Point | null = null;
    let snapRotation = 0;
    
    for (const wall of walls) {
      const dist = distanceToLine(point, wall.start, wall.end);
      if (dist < minDist) {
        // Calculate closest point on wall
        const wallDir = normalizeVector(wall.start, wall.end);
        const toPoint = { x: point.x - wall.start.x, y: point.y - wall.start.y };
        const projection = toPoint.x * wallDir.x + toPoint.y * wallDir.y;
        const wallLength = distance(wall.start, wall.end);
        
        if (projection >= 0 && projection <= wallLength) {
          const closestPoint = {
            x: wall.start.x + wallDir.x * projection,
            y: wall.start.y + wallDir.y * projection
          };
          
          // Calculate perpendicular offset for wardrobe position
          const perpDir = perpendicularVector(wallDir);
          const wallAngle = Math.atan2(wallDir.y, wallDir.x);
          
          minDist = dist;
          nearestWall = wall;
          snapPosition = {
            x: closestPoint.x + perpDir.x * (wall.thickness / 2 + wardrobeHeight * scale / 2),
            y: closestPoint.y + perpDir.y * (wall.thickness / 2 + wardrobeHeight * scale / 2)
          };
          snapRotation = wallAngle;
        }
      }
    }
    
    if (nearestWall && snapPosition) {
      return { position: snapPosition, rotation: snapRotation };
    }
    return null;
  }, [walls, wardrobeHeight, scale]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      e.preventDefault();
      setIsPanning(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      panStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      return;
    }
    
    let point = snapToGrid(getCanvasPoint(e));
    
    if (currentTool === 'select') {
      const endpoint = findWallEndpoint(point);
      if (endpoint) {
        setDragState({
          type: endpoint.endpoint === 'start' ? 'wall-start' : 'wall-end',
          elementId: endpoint.wall.id,
          startPoint: point
        });
        onSelectElement(endpoint.wall.id);
        return;
      }
      
      const opening = findOpeningAtPoint(point);
      if (opening) {
        setDragState({
          type: 'opening-move',
          elementId: opening.id,
          startPoint: point
        });
        onSelectElement(opening.id);
        return;
      }
      
      const bed = findBedAtPoint(point);
      if (bed) {
        setDragState({
          type: 'bed-move',
          elementId: bed.id,
          startPoint: point
        });
        onSelectElement(bed.id);
        return;
      }
      
      const wardrobe = findWardrobeAtPoint(point);
      if (wardrobe) {
        setDragState({
          type: 'wardrobe-move',
          elementId: wardrobe.id,
          startPoint: point
        });
        onSelectElement(wardrobe.id);
        return;
      }
      
      const stair = findStairAtPoint(point);
      if (stair) {
        setDragState({
          type: 'stair-move',
          elementId: stair.id,
          startPoint: point
        });
        onSelectElement(stair.id);
        return;
      }
      
      const wall = findWallAtPoint(point);
      if (wall) {
        const isNearEndpoint = findWallEndpoint(point);
        if (!isNearEndpoint) {
          setDragState({
            type: 'wall-move',
            elementId: wall.id,
            startPoint: point
          });
        }
        onSelectElement(wall.id);
        return;
      }
      
      // Check dimensions
      const dimension = dimensions.find(d => {
        const angle = Math.atan2(d.end.y - d.start.y, d.end.x - d.start.x);
        const perpX = Math.cos(angle + Math.PI / 2);
        const perpY = Math.sin(angle + Math.PI / 2);
        
        const offsetStart = {
          x: d.start.x + perpX * d.offset,
          y: d.start.y + perpY * d.offset
        };
        const offsetEnd = {
          x: d.end.x + perpX * d.offset,
          y: d.end.y + perpY * d.offset
        };
        
        // Check distance to the offset line (where dimension is actually drawn)
        const dist = distanceToLine(point, offsetStart, offsetEnd);
        return dist < 15;
      });
      if (dimension) {
        onSelectElement(dimension.id);
        return;
      }
      
      // Click on empty space - start panning
      onSelectElement(null);
      setIsPanning(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      panStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    } else if (currentTool === 'wall') {
      if (!tempWallStart) {
        const nearestEndpoint = findNearestEndpoint(point, walls, 20);
        if (nearestEndpoint) {
          point = nearestEndpoint;
        } else {
          const nearestMidpoint = findNearestWallMidpoint(point, walls, 20);
          if (nearestMidpoint) {
            point = nearestMidpoint;
          }
        }
        setTempWallStart(point);
      } else {
        const alignedEnd = alignToAxis(tempWallStart, point);
        const newWall: Wall = {
          id: `wall-${Date.now()}`,
          start: tempWallStart,
          end: alignedEnd,
          thickness: wallThickness,
        };
        setWalls(prevWalls => [...prevWalls, newWall]);
        setTempWallStart(null);
        setTimeout(saveToHistory, 0);
      }
    } else if (currentTool === 'door' || currentTool === 'window') {
      const wall = findWallAtPoint(point);
      if (wall) {
        const wallLen = getWallLength(wall);
        const distToStart = distance(point, wall.start);
        const position = distToStart / wallLen;
        
        const newOpening: Opening = {
          id: `${currentTool}-${Date.now()}`,
          wallId: wall.id,
          position: Math.max(0.1, Math.min(0.9, position)),
          width: openingWidth,
          type: currentTool,
          swingDirection: currentTool === 'door' ? 1 : undefined,
          hingePosition: currentTool === 'door' ? 'left' : undefined,
        };
        setOpenings(prevOpenings => [...prevOpenings, newOpening]);
        setTimeout(saveToHistory, 0);
      }
    } else if (currentTool === 'dimension') {
      if (!tempDimensionStart) {
        // First click: set start point
        const snapResult = findDimensionSnapPoint(point);
        setTempDimensionStart(snapResult?.point || point);
      } else if (!tempDimensionEnd) {
        // Second click: set end point
        const snapResult = findDimensionSnapPoint(point);
        setTempDimensionEnd(snapResult?.point || point);
      } else {
        // Third click: set offset position and create dimension
        // Re-check snaps for the stored start/end points (they might have moved)
        const startSnapResult = findDimensionSnapPoint(tempDimensionStart);
        const endSnapResult = findDimensionSnapPoint(tempDimensionEnd);
        
        // Use the actual stored points for dimension endpoints
        const dimStart = startSnapResult?.point || tempDimensionStart;
        const dimEnd = endSnapResult?.point || tempDimensionEnd;
        
        // Calculate offset based on third click position (no snapping for offset click)
        const angle = Math.atan2(dimEnd.y - dimStart.y, dimEnd.x - dimStart.x);
        const perpX = Math.cos(angle + Math.PI / 2);
        const perpY = Math.sin(angle + Math.PI / 2);
        
        // Project the click point onto the perpendicular line to get offset distance
        const midX = (dimStart.x + dimEnd.x) / 2;
        const midY = (dimStart.y + dimEnd.y) / 2;
        const toClick = { x: point.x - midX, y: point.y - midY };
        const offsetDistance = toClick.x * perpX + toClick.y * perpY;
        
        const newDimension: Dimension = {
          id: `dim-${Date.now()}`,
          start: dimStart,
          end: dimEnd,
          offset: offsetDistance || 50,
          startAttachment: startSnapResult?.attachment,
          endAttachment: endSnapResult?.attachment,
        };
        setDimensions(prevDimensions => [...prevDimensions, newDimension]);
        setTempDimensionStart(null);
        setTempDimensionEnd(null);
        setTimeout(saveToHistory, 0);
      }
    } else if (currentTool === 'bed') {
      const newBed: Bed = {
        id: `bed-${Date.now()}`,
        position: point,
        rotation: 0,
        size: bedSize,
      };
      setBeds(prevBeds => [...prevBeds, newBed]);
      setTimeout(saveToHistory, 0);
    } else if (currentTool === 'room') {
      if (!tempRoomStart) {
        setTempRoomStart(point);
      } else {
        const dx = point.x - tempRoomStart.x;
        const dy = point.y - tempRoomStart.y;
        if (Math.abs(dx) < 40 || Math.abs(dy) < 40) return;
        const x1 = tempRoomStart.x, y1 = tempRoomStart.y, x2 = point.x, y2 = point.y;
        const stamp = Date.now();
        const corners: [Point, Point][] = [
          [{ x: x1, y: y1 }, { x: x2, y: y1 }],
          [{ x: x2, y: y1 }, { x: x2, y: y2 }],
          [{ x: x2, y: y2 }, { x: x1, y: y2 }],
          [{ x: x1, y: y2 }, { x: x1, y: y1 }],
        ];
        const roomWalls: Wall[] = corners.map(([start, end], i) => ({
          id: `wall-${stamp}-${i}`,
          start,
          end,
          thickness: wallThickness,
        }));
        const innerW = (Math.abs(dx) - wallThickness) / scale;
        const innerH = (Math.abs(dy) - wallThickness) / scale;
        const areaText = formatArea(innerW, innerH, unit);
        const areaLabel: Wardrobe = {
          id: `text-${stamp}`,
          kind: 'text',
          label: areaText,
          position: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
          width: Math.max(60, areaText.length * 11),
          height: 40,
          rotation: 0,
        };
        setWalls(prev => [...prev, ...roomWalls]);
        setWardrobes(prev => [...prev, areaLabel]);
        setTempRoomStart(null);
        setTimeout(saveToHistory, 0);
      }
    } else if (currentTool === 'wardrobe') {
      const isText = furnitureKind === 'text';
      const wallSnap = furnitureKind === 'wardrobe' ? findNearestWallFace(point) : null;
      const newWardrobe: Wardrobe = {
        id: `wardrobe-${Date.now()}`,
        kind: furnitureKind,
        label: furnitureLabel,
        position: wallSnap ? wallSnap.position : point,
        width: isText ? Math.max(40, (furnitureLabel || 'Text').length * 11) : wardrobeWidth,
        height: isText ? 40 : wardrobeHeight,
        rotation: wallSnap ? wallSnap.rotation : 0,
      };
      setWardrobes(prevWardrobes => [...prevWardrobes, newWardrobe]);
      setTimeout(saveToHistory, 0);
    } else if (currentTool === 'stair') {
      const wallSnap = findNearestWallFace(point);
      const newStair: Stair = {
        id: `stair-${Date.now()}`,
        position: wallSnap ? wallSnap.position : point,
        width: stairWidth,
        height: stairHeight,
        rotation: wallSnap ? wallSnap.rotation : 0,
      };
      setStairs(prevStairs => [...prevStairs, newStair]);
      setTimeout(saveToHistory, 0);
    }
  }, [currentTool, tempRoomStart, furnitureKind, furnitureLabel, unit, scale, tempWallStart, tempDimensionStart, tempDimensionEnd, walls, openings, dimensions, beds, wardrobes, stairs, wallThickness, openingWidth, bedSize, wardrobeWidth, wardrobeHeight, stairWidth, stairHeight, getCanvasPoint, findWallAtPoint, findWallEndpoint, findOpeningAtPoint, findBedAtPoint, findWardrobeAtPoint, findStairAtPoint, onSelectElement, setWalls, setOpenings, setDimensions, setBeds, setWardrobes, setStairs, findDimensionSnapPoint, findNearestWallFace, saveToHistory]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanningRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      const deltaX = currentX - panStartRef.current.x;
      const deltaY = currentY - panStartRef.current.y;
      
      setPanOffset(prevOffset => ({
        x: prevOffset.x + deltaX,
        y: prevOffset.y + deltaY
      }));
      
      panStartRef.current = { x: currentX, y: currentY };
      return;
    }
    
    let point = snapToGrid(getCanvasPoint(e));
    
    if (currentTool === 'wall' && tempWallStart) {
      point = alignToAxis(tempWallStart, point);
    }
    
    setMousePos(point);
    
    if (dragState.type && dragState.elementId && dragState.startPoint) {
      if (dragState.type === 'wall-start' || dragState.type === 'wall-end') {
        const movedWall = walls.find(w => w.id === dragState.elementId);
        if (movedWall) {
          const endpoint = dragState.type === 'wall-start' ? 'start' : 'end';
          const oldPoint = movedWall[endpoint];
          const delta = { x: point.x - oldPoint.x, y: point.y - oldPoint.y };
          
          setWalls(prevWalls => prevWalls.map(wall => {
            if (wall.id === dragState.elementId) {
              return {
                ...wall,
                [endpoint]: point
              };
            }
            
            const isConnectedToStart = distance(wall.start, oldPoint) < 5;
            const isConnectedToEnd = distance(wall.end, oldPoint) < 5;
            
            if (isConnectedToStart || isConnectedToEnd) {
              return {
                ...wall,
                start: isConnectedToStart ? { x: wall.start.x + delta.x, y: wall.start.y + delta.y } : wall.start,
                end: isConnectedToEnd ? { x: wall.end.x + delta.x, y: wall.end.y + delta.y } : wall.end
              };
            }
            
            return wall;
          }));
        }
      } else if (dragState.type === 'opening-move') {
        let nearestWall = findWallAtPoint(point);
        if (!nearestWall) {
          let minDist = Infinity;
          for (const wall of walls) {
            const dist = distanceToLine(point, wall.start, wall.end);
            if (dist < minDist) {
              minDist = dist;
              nearestWall = wall;
            }
          }
        }
        
        setOpenings(prevOpenings => prevOpenings.map(opening => {
          if (opening.id === dragState.elementId && nearestWall) {
            const wallLen = getWallLength(nearestWall);
            const distToStart = distance(point, nearestWall.start);
            const position = distToStart / wallLen;
            return {
              ...opening,
              wallId: nearestWall.id,
              position: Math.max(0, Math.min(1, position))
            };
          }
          return opening;
        }));
      } else if (dragState.type === 'wall-move') {
        const delta = {
          x: point.x - dragState.startPoint.x,
          y: point.y - dragState.startPoint.y
        };
        
        const movedWall = walls.find(w => w.id === dragState.elementId);
        if (movedWall) {
          const oldStart = movedWall.start;
          const oldEnd = movedWall.end;
          
          setWalls(prevWalls => prevWalls.map(wall => {
            if (wall.id === dragState.elementId) {
              return {
                ...wall,
                start: {
                  x: wall.start.x + delta.x,
                  y: wall.start.y + delta.y
                },
                end: {
                  x: wall.end.x + delta.x,
                  y: wall.end.y + delta.y
                }
              };
            }
            
            const isConnectedToStart = distance(wall.start, oldStart) < 5 || distance(wall.start, oldEnd) < 5;
            const isConnectedToEnd = distance(wall.end, oldStart) < 5 || distance(wall.end, oldEnd) < 5;
            
            if (isConnectedToStart || isConnectedToEnd) {
              return {
                ...wall,
                start: isConnectedToStart ? { x: wall.start.x + delta.x, y: wall.start.y + delta.y } : wall.start,
                end: isConnectedToEnd ? { x: wall.end.x + delta.x, y: wall.end.y + delta.y } : wall.end
              };
            }
            
            return wall;
          }));
        }
        
        setDragState({
          ...dragState,
          startPoint: point
        });
      } else if (dragState.type === 'bed-move') {
        setBeds(prevBeds => prevBeds.map(bed => {
          if (bed.id === dragState.elementId) {
            return {
              ...bed,
              position: point
            };
          }
          return bed;
        }));
      } else if (dragState.type === 'wardrobe-move') {
        setWardrobes(prevWardrobes => prevWardrobes.map(wardrobe => {
          if (wardrobe.id === dragState.elementId) {
            return {
              ...wardrobe,
              position: point
            };
          }
          return wardrobe;
        }));
      } else if (dragState.type === 'stair-move') {
        setStairs(prevStairs => prevStairs.map(stair => {
          if (stair.id === dragState.elementId) {
            return {
              ...stair,
              position: point
            };
          }
          return stair;
        }));
      }
    }
  }, [dragState, walls, openings, beds, wardrobes, stairs, getCanvasPoint, findWallAtPoint, setBeds, setOpenings, setWalls, setWardrobes, setStairs]);

  const handleMouseUp = useCallback(() => {
    if (dragState.type && dragState.type !== null) {
      saveToHistory();
    }
    setDragState({ type: null, elementId: null, startPoint: null });
    setIsPanning(false);
  }, [dragState.type, saveToHistory]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
    
    const worldX = (mouseX - panOffset.x) / zoom;
    const worldY = (mouseY - panOffset.y) / zoom;
    
    setPanOffset({
      x: mouseX - worldX * newZoom,
      y: mouseY - worldY * newZoom
    });
    
    setZoom(newZoom);
  }, [zoom, panOffset]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Check if user is typing in an input or textarea
    const target = e.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    
    if (e.key === ' ' && !isSpacePressed) {
      e.preventDefault();
      setIsSpacePressed(true);
    } else if (e.key === 'r' || e.key === 'R') {
      if (selectedElementId && !isInputFocused) {
        const selectedBed = beds.find(b => b.id === selectedElementId);
        if (selectedBed) {
          e.preventDefault();
          const rotationDelta = e.shiftKey ? -Math.PI / 2 : Math.PI / 2;
          setBeds(prevBeds => prevBeds.map(b => 
            b.id === selectedElementId 
              ? { ...b, rotation: b.rotation + rotationDelta }
              : b
          ));
          setTimeout(saveToHistory, 0);
        }
        const selectedWardrobe = wardrobes.find(w => w.id === selectedElementId);
        if (selectedWardrobe) {
          e.preventDefault();
          const rotationDelta = e.shiftKey ? -Math.PI / 2 : Math.PI / 2;
          setWardrobes(prevWardrobes => prevWardrobes.map(w => 
            w.id === selectedElementId 
              ? { ...w, rotation: w.rotation + rotationDelta }
              : w
          ));
          setTimeout(saveToHistory, 0);
        }
        const selectedStair = stairs.find(s => s.id === selectedElementId);
        if (selectedStair) {
          e.preventDefault();
          const rotationDelta = e.shiftKey ? -Math.PI / 2 : Math.PI / 2;
          setStairs(prevStairs => prevStairs.map(s => 
            s.id === selectedElementId 
              ? { ...s, rotation: s.rotation + rotationDelta }
              : s
          ));
          setTimeout(saveToHistory, 0);
        }
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      // Only delete objects if not typing in an input field
      if (selectedElementId && !isInputFocused) {
        setWalls(prevWalls => prevWalls.filter(w => w.id !== selectedElementId));
        setOpenings(prevOpenings => prevOpenings.filter(o => o.id !== selectedElementId));
        setDimensions(prevDimensions => prevDimensions.filter(d => d.id !== selectedElementId));
        setBeds(prevBeds => prevBeds.filter(b => b.id !== selectedElementId));
        setWardrobes(prevWardrobes => prevWardrobes.filter(w => w.id !== selectedElementId));
        setStairs(prevStairs => prevStairs.filter(s => s.id !== selectedElementId));
        onSelectElement(null);
        setTimeout(saveToHistory, 0);
      }
    } else if (e.key === 'Escape') {
      setTempWallStart(null);
      setTempRoomStart(null);
      setTempDimensionStart(null);
      setTempDimensionEnd(null);
      onSelectElement(null);
      // Switch to select mode if in another tool mode
      if (currentTool !== 'select') {
        onToolChange('select');
      }
    }
  }, [selectedElementId, walls, openings, dimensions, beds, wardrobes, stairs, isSpacePressed, onSelectElement, setBeds, setWardrobes, setStairs, saveToHistory]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ') {
      setIsSpacePressed(false);
      setIsPanning(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Fill entire canvas with background color first
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(-10000, -10000, 20000, 20000);

    if (backgroundImage) {
      ctx.save();
      ctx.globalAlpha = backgroundImage.opacity;
      ctx.drawImage(backgroundImage.img, 0, 0, backgroundImage.img.width * backgroundImage.scale, backgroundImage.img.height * backgroundImage.scale);
      ctx.restore();
    }

    // Calculate bounds of all objects
    let minX = 0, minY = 0, maxX = canvas.width, maxY = canvas.height;
    
    walls.forEach(wall => {
      minX = Math.min(minX, wall.start.x, wall.end.x);
      minY = Math.min(minY, wall.start.y, wall.end.y);
      maxX = Math.max(maxX, wall.start.x, wall.end.x);
      maxY = Math.max(maxY, wall.start.y, wall.end.y);
    });
    
    beds.forEach(bed => {
      const bedWidth = bed.size === 'queen' ? 180 : 120;
      const bedHeight = 200;
      minX = Math.min(minX, bed.position.x - bedWidth);
      minY = Math.min(minY, bed.position.y - bedHeight);
      maxX = Math.max(maxX, bed.position.x + bedWidth);
      maxY = Math.max(maxY, bed.position.y + bedHeight);
    });
    
    dimensions.forEach(dim => {
      minX = Math.min(minX, dim.start.x, dim.end.x);
      minY = Math.min(minY, dim.start.y, dim.end.y);
      maxX = Math.max(maxX, dim.start.x, dim.end.x);
      maxY = Math.max(maxY, dim.start.y, dim.end.y);
    });
    
    // Add padding
    const padding = 200;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const gridSize = 50;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Draw grid from minX to maxX
    const startX = Math.floor(minX / gridSize) * gridSize;
    const endX = Math.ceil(maxX / gridSize) * gridSize;
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
      ctx.stroke();
    }
    
    // Draw grid from minY to maxY
    const startY = Math.floor(minY / gridSize) * gridSize;
    const endY = Math.ceil(maxY / gridSize) * gridSize;
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(minX, y);
      ctx.lineTo(maxX, y);
      ctx.stroke();
    }

    walls.forEach(wall => {
      const angle = getWallAngle(wall);
      const perpX = Math.cos(angle + Math.PI / 2);
      const perpY = Math.sin(angle + Math.PI / 2);
      const halfThickness = wall.thickness / 2;
      const wallDir = normalizeVector(wall.start, wall.end);

      // Calculate the four corner points of the wall
      let topLeft = { x: wall.start.x + perpX * halfThickness, y: wall.start.y + perpY * halfThickness };
      let topRight = { x: wall.end.x + perpX * halfThickness, y: wall.end.y + perpY * halfThickness };
      let bottomRight = { x: wall.end.x - perpX * halfThickness, y: wall.end.y - perpY * halfThickness };
      let bottomLeft = { x: wall.start.x - perpX * halfThickness, y: wall.start.y - perpY * halfThickness };

      // Find connected walls at start and end points
      const connectedAtStart = walls.filter(w => 
        w.id !== wall.id && (distance(w.start, wall.start) < 5 || distance(w.end, wall.start) < 5)
      );
      const connectedAtEnd = walls.filter(w => 
        w.id !== wall.id && (distance(w.start, wall.end) < 5 || distance(w.end, wall.end) < 5)
      );

      // Extend start point to meet connected wall's outer face
      if (connectedAtStart.length > 0) {
        const connectedWall = connectedAtStart[0];
        const connectedAngle = getWallAngle(connectedWall);
        const connectedHalfThickness = connectedWall.thickness / 2;
        
        // Calculate extension to reach the outer face of connected wall
        const angleDiff = angle - connectedAngle;
        const sinAngle = Math.sin(angleDiff);
        
        if (Math.abs(sinAngle) > 0.1) {
          const extension = (connectedHalfThickness - halfThickness * Math.cos(angleDiff)) / sinAngle;
          topLeft.x -= wallDir.x * extension;
          topLeft.y -= wallDir.y * extension;
          bottomLeft.x -= wallDir.x * extension;
          bottomLeft.y -= wallDir.y * extension;
        }
      }

      // Extend end point to meet connected wall's outer face
      if (connectedAtEnd.length > 0) {
        const connectedWall = connectedAtEnd[0];
        const connectedAngle = getWallAngle(connectedWall);
        const connectedHalfThickness = connectedWall.thickness / 2;
        
        // Calculate extension to reach the outer face of connected wall
        const angleDiff = angle - connectedAngle;
        const sinAngle = Math.sin(angleDiff);
        
        if (Math.abs(sinAngle) > 0.1) {
          const extension = (connectedHalfThickness - halfThickness * Math.cos(angleDiff)) / sinAngle;
          topRight.x += wallDir.x * extension;
          topRight.y += wallDir.y * extension;
          bottomRight.x += wallDir.x * extension;
          bottomRight.y += wallDir.y * extension;
        }
      }

      ctx.fillStyle = wall.id === selectedElementId ? '#3b82f6' : '#4B5563';
      ctx.strokeStyle = wall.id === selectedElementId ? '#2563eb' : '#374151';
      ctx.lineWidth = 2;

      // Set line dash pattern if wall style is dashed
      if (wall.style === 'dashed') {
        ctx.setLineDash([10, 5]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.moveTo(topLeft.x, topLeft.y);
      ctx.lineTo(topRight.x, topRight.y);
      ctx.lineTo(bottomRight.x, bottomRight.y);
      ctx.lineTo(bottomLeft.x, bottomLeft.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Reset line dash
      ctx.setLineDash([]);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(wall.start.x, wall.start.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(wall.end.x, wall.end.y, 6, 0, Math.PI * 2);
      ctx.fill();

    });

    openings.forEach(opening => {
      const wall = walls.find(w => w.id === opening.wallId);
      if (!wall) return;

      const openingPoint = getPointOnWall(wall, opening.position);
      const wallDir = normalizeVector(wall.start, wall.end);
      const openingWidthInPixels = opening.width * scale;
      
      const halfWidth = openingWidthInPixels / 2;
      const halfThickness = wall.thickness / 2;

      if (opening.type === 'door') {
        const swingDir = opening.swingDirection || 1;
        const hingePos = opening.hingePosition || 'left';
        const doorType = opening.doorType || 'single';
        
        ctx.save();
        ctx.translate(openingPoint.x, openingPoint.y);
        ctx.rotate(Math.atan2(wallDir.y, wallDir.x));
        
        // Draw hollow opening like window
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-halfWidth, -halfThickness, openingWidthInPixels, wall.thickness);
        
        ctx.strokeStyle = opening.id === selectedElementId ? '#3b82f6' : '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-halfWidth, -halfThickness, openingWidthInPixels, wall.thickness);
        
        if (doorType === 'double') {
          // Double door: two panels opening from center
          const panelWidth = openingWidthInPixels / 2;
          
          // Draw center line
          ctx.strokeStyle = opening.id === selectedElementId ? '#3b82f6' : '#8b5cf6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -halfThickness);
          ctx.lineTo(0, halfThickness);
          ctx.stroke();
          
          // Draw left panel
          ctx.strokeStyle = opening.id === selectedElementId ? '#3b82f6' : '#a78bfa';
          ctx.lineWidth = 2;
          
          // Left panel ray
          ctx.beginPath();
          ctx.moveTo(-halfWidth, 0);
          const leftRayAngle = swingDir > 0 ? -Math.PI / 4 : Math.PI / 4;
          const leftEndX = -halfWidth + panelWidth * Math.cos(leftRayAngle);
          const leftEndY = panelWidth * Math.sin(leftRayAngle);
          ctx.lineTo(leftEndX, leftEndY);
          ctx.stroke();
          
          // Left panel arc
          ctx.beginPath();
          if (swingDir > 0) {
            ctx.arc(-halfWidth, 0, panelWidth, -Math.PI / 4, 0);
          } else {
            ctx.arc(-halfWidth, 0, panelWidth, 0, Math.PI / 4);
          }
          ctx.stroke();
          
          // Right panel ray
          ctx.beginPath();
          ctx.moveTo(halfWidth, 0);
          const rightRayAngle = swingDir > 0 ? Math.PI - Math.PI / 4 : Math.PI + Math.PI / 4;
          const rightEndX = halfWidth + panelWidth * Math.cos(rightRayAngle);
          const rightEndY = panelWidth * Math.sin(rightRayAngle);
          ctx.lineTo(rightEndX, rightEndY);
          ctx.stroke();
          
          // Right panel arc
          ctx.beginPath();
          if (swingDir > 0) {
            ctx.arc(halfWidth, 0, panelWidth, Math.PI - Math.PI / 4, Math.PI);
          } else {
            ctx.arc(halfWidth, 0, panelWidth, Math.PI, Math.PI + Math.PI / 4);
          }
          ctx.stroke();
        } else {
          // Single door
          // Draw single line in middle
          ctx.strokeStyle = opening.id === selectedElementId ? '#3b82f6' : '#8b5cf6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-halfWidth, 0);
          ctx.lineTo(halfWidth, 0);
          ctx.stroke();
          
          // Determine hinge position (rotation center)
          const hingeX = hingePos === 'left' ? -halfWidth : halfWidth;
          
          // Draw door panel line (ray) at 45 degrees from hinge
          ctx.strokeStyle = opening.id === selectedElementId ? '#3b82f6' : '#a78bfa';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(hingeX, 0);
          
          // Calculate ray angle based on hinge position and swing direction
          let rayAngle;
          if (hingePos === 'left') {
            rayAngle = swingDir > 0 ? -Math.PI / 4 : Math.PI / 4;
          } else {
            rayAngle = swingDir > 0 ? Math.PI - Math.PI / 4 : Math.PI + Math.PI / 4;
          }
          
          const doorEndX = hingeX + openingWidthInPixels * Math.cos(rayAngle);
          const doorEndY = openingWidthInPixels * Math.sin(rayAngle);
          ctx.lineTo(doorEndX, doorEndY);
          ctx.stroke();
          
          // Draw arc connecting the end of ray line to the other endpoint of door
          ctx.beginPath();
          
          if (hingePos === 'left') {
            if (swingDir > 0) {
              ctx.arc(hingeX, 0, openingWidthInPixels, -Math.PI / 4, 0);
            } else {
              ctx.arc(hingeX, 0, openingWidthInPixels, 0, Math.PI / 4);
            }
          } else {
            if (swingDir > 0) {
              ctx.arc(hingeX, 0, openingWidthInPixels, Math.PI - Math.PI / 4, Math.PI);
            } else {
              ctx.arc(hingeX, 0, openingWidthInPixels, Math.PI, Math.PI + Math.PI / 4);
            }
          }
          ctx.stroke();
        }
        
        ctx.restore();
      } else {
        // Window rendering
        ctx.save();
        ctx.translate(openingPoint.x, openingPoint.y);
        ctx.rotate(Math.atan2(wallDir.y, wallDir.x));
        
        // Draw hollow rectangle with white fill (no gap)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-halfWidth, -halfThickness, openingWidthInPixels, wall.thickness);
        
        ctx.strokeStyle = opening.id === selectedElementId ? '#3b82f6' : '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-halfWidth, -halfThickness, openingWidthInPixels, wall.thickness);
        
        // Draw two lines parallel to the wall (horizontal in rotated coordinate system)
        ctx.strokeStyle = opening.id === selectedElementId ? '#3b82f6' : '#000000';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 2; i++) {
          const yPos = -halfThickness + (wall.thickness / 3) * i;
          ctx.beginPath();
          ctx.moveTo(-halfWidth, yPos);
          ctx.lineTo(halfWidth, yPos);
          ctx.stroke();
        }
        
        ctx.restore();
      }
    });

    dimensions.forEach(dim => {
      // Calculate actual dimension points based on attachments
      const getDimensionPoint = (attachment: any, fallbackPoint: Point): Point => {
        if (!attachment) return fallbackPoint;
        
        if (attachment.elementType === 'wall') {
          const wall = walls.find(w => w.id === attachment.elementId);
          if (!wall) return fallbackPoint;
          return attachment.edge === 'start' ? wall.start : wall.end;
        } else if (attachment.elementType === 'opening') {
          const opening = openings.find(o => o.id === attachment.elementId);
          if (!opening) return fallbackPoint;
          const wall = walls.find(w => w.id === opening.wallId);
          if (!wall) return fallbackPoint;
          
          const openingPoint = getPointOnWall(wall, opening.position);
          const wallDir = normalizeVector(wall.start, wall.end);
          const openingWidthInPixels = opening.width * scale;
          const halfWidth = openingWidthInPixels / 2;
          
          if (attachment.edge === 'left') {
            return {
              x: openingPoint.x - wallDir.x * halfWidth,
              y: openingPoint.y - wallDir.y * halfWidth
            };
          } else {
            return {
              x: openingPoint.x + wallDir.x * halfWidth,
              y: openingPoint.y + wallDir.y * halfWidth
            };
          }
        }
        return fallbackPoint;
      };
      
      const actualStart = getDimensionPoint(dim.startAttachment, dim.start);
      const actualEnd = getDimensionPoint(dim.endAttachment, dim.end);
      
      const angle = Math.atan2(actualEnd.y - actualStart.y, actualEnd.x - actualStart.x);
      const perpX = Math.cos(angle + Math.PI / 2);
      const perpY = Math.sin(angle + Math.PI / 2);

      const offsetStart = {
        x: actualStart.x + perpX * dim.offset,
        y: actualStart.y + perpY * dim.offset
      };
      const offsetEnd = {
        x: actualEnd.x + perpX * dim.offset,
        y: actualEnd.y + perpY * dim.offset
      };

      ctx.strokeStyle = dim.id === selectedElementId ? '#3b82f6' : '#6b7280';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(actualStart.x, actualStart.y);
      ctx.lineTo(offsetStart.x, offsetStart.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(actualEnd.x, actualEnd.y);
      ctx.lineTo(offsetEnd.x, offsetEnd.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(offsetStart.x, offsetStart.y);
      ctx.lineTo(offsetEnd.x, offsetEnd.y);
      ctx.stroke();

      const arrowSize = 10;
      ctx.beginPath();
      ctx.moveTo(offsetStart.x, offsetStart.y);
      ctx.lineTo(
        offsetStart.x + Math.cos(angle) * arrowSize - Math.sin(angle) * arrowSize / 2,
        offsetStart.y + Math.sin(angle) * arrowSize + Math.cos(angle) * arrowSize / 2
      );
      ctx.moveTo(offsetStart.x, offsetStart.y);
      ctx.lineTo(
        offsetStart.x + Math.cos(angle) * arrowSize + Math.sin(angle) * arrowSize / 2,
        offsetStart.y + Math.sin(angle) * arrowSize - Math.cos(angle) * arrowSize / 2
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(offsetEnd.x, offsetEnd.y);
      ctx.lineTo(
        offsetEnd.x - Math.cos(angle) * arrowSize - Math.sin(angle) * arrowSize / 2,
        offsetEnd.y - Math.sin(angle) * arrowSize + Math.cos(angle) * arrowSize / 2
      );
      ctx.moveTo(offsetEnd.x, offsetEnd.y);
      ctx.lineTo(
        offsetEnd.x - Math.cos(angle) * arrowSize + Math.sin(angle) * arrowSize / 2,
        offsetEnd.y - Math.sin(angle) * arrowSize - Math.cos(angle) * arrowSize / 2
      );
      ctx.stroke();

      // Draw dimension label
      const dimLength = distance(actualStart, actualEnd);
      const lengthInCm = Math.round(dimLength / scale);
      const midX = (offsetStart.x + offsetEnd.x) / 2;
      const midY = (offsetStart.y + offsetEnd.y) / 2;
      
      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-52, -16, 104, 32);
      
      ctx.fillStyle = dim.id === selectedElementId ? '#3b82f6' : '#374151';
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatLength(lengthInCm, unit), 0, 0);
      
      ctx.restore();

    });

    beds.forEach(bed => {
      // Bed dimensions in cm, converted to pixels using scale
      // Queen: 180cm x 200cm, Single: 120cm x 200cm
      const bedWidth = (bed.size === 'queen' ? 180 : 120) * scale;
      const bedHeight = 200 * scale;
      
      ctx.save();
      ctx.translate(bed.position.x, bed.position.y);
      ctx.rotate(bed.rotation);
      
      ctx.fillStyle = bed.id === selectedElementId ? '#3b82f6' : '#8b5cf6';
      ctx.strokeStyle = bed.id === selectedElementId ? '#2563eb' : '#7c3aed';
      ctx.lineWidth = 3;
      
      ctx.fillRect(-bedWidth / 2, -bedHeight / 2, bedWidth, bedHeight);
      ctx.strokeRect(-bedWidth / 2, -bedHeight / 2, bedWidth, bedHeight);
      
      ctx.fillStyle = bed.id === selectedElementId ? '#60a5fa' : '#a78bfa';
      ctx.fillRect(-bedWidth / 2, -bedHeight / 2 + bedHeight * 0.7, bedWidth, bedHeight * 0.3);
      
      ctx.strokeStyle = bed.id === selectedElementId ? '#2563eb' : '#7c3aed';
      ctx.lineWidth = 2;
      for (let i = 1; i < (bed.size === 'queen' ? 3 : 2); i++) {
        const x = -bedWidth / 2 + (bedWidth / (bed.size === 'queen' ? 3 : 2)) * i;
        ctx.beginPath();
        ctx.moveTo(x, -bedHeight / 2);
        ctx.lineTo(x, bedHeight / 2);
        ctx.stroke();
      }
      
      ctx.restore();
    });

    wardrobes.forEach(wardrobe => {
      // Wardrobe dimensions in cm, converted to pixels using scale
      const wardrobeWidthPx = wardrobe.width * scale;
      const wardrobeHeightPx = wardrobe.height * scale;
      
      ctx.save();
      ctx.translate(wardrobe.position.x, wardrobe.position.y);
      ctx.rotate(wardrobe.rotation);
      
      const isSel = wardrobe.id === selectedElementId;
      if (wardrobe.kind === 'text') {
        if (isSel) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(-wardrobeWidthPx / 2, -wardrobeHeightPx / 2, wardrobeWidthPx, wardrobeHeightPx);
          ctx.setLineDash([]);
        }
        ctx.fillStyle = isSel ? '#2563eb' : '#374151';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(wardrobe.label || '', 0, 0);
      } else {
        ctx.strokeStyle = isSel ? '#3b82f6' : '#6b7280';
        ctx.fillStyle = isSel ? '#dbeafe' : '#f3f4f6';
        ctx.lineWidth = 2;
        ctx.fillRect(-wardrobeWidthPx / 2, -wardrobeHeightPx / 2, wardrobeWidthPx, wardrobeHeightPx);
        ctx.strokeRect(-wardrobeWidthPx / 2, -wardrobeHeightPx / 2, wardrobeWidthPx, wardrobeHeightPx);
        if (!wardrobe.kind || wardrobe.kind === 'wardrobe') {
          ctx.strokeStyle = isSel ? '#3b82f6' : '#9ca3af';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-wardrobeWidthPx / 2, -wardrobeHeightPx / 2);
          ctx.lineTo(wardrobeWidthPx / 2, wardrobeHeightPx / 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(wardrobeWidthPx / 2, -wardrobeHeightPx / 2);
          ctx.lineTo(-wardrobeWidthPx / 2, wardrobeHeightPx / 2);
          ctx.stroke();
        } else if (wardrobe.label) {
          const fs = Math.max(16, Math.min(36, Math.min(wardrobeWidthPx, wardrobeHeightPx) / 2.2, wardrobeWidthPx / (wardrobe.label.length * 0.6)));
          ctx.fillStyle = isSel ? '#2563eb' : '#4b5563';
          ctx.font = `${fs}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(wardrobe.label, 0, 0);
        }
      }
      
      ctx.restore();
    });

    stairs.forEach(stair => {
      // Stair dimensions in cm, converted to pixels using scale
      const stairWidthPx = stair.width * scale;
      const stairHeightPx = stair.height * scale;
      
      ctx.save();
      ctx.translate(stair.position.x, stair.position.y);
      ctx.rotate(stair.rotation);
      
      // Draw rectangle
      ctx.strokeStyle = stair.id === selectedElementId ? '#3b82f6' : '#6b7280';
      ctx.fillStyle = stair.id === selectedElementId ? '#dbeafe' : '#f3f4f6';
      ctx.lineWidth = 2;
      
      ctx.fillRect(-stairWidthPx / 2, -stairHeightPx / 2, stairWidthPx, stairHeightPx);
      ctx.strokeRect(-stairWidthPx / 2, -stairHeightPx / 2, stairWidthPx, stairHeightPx);
      
      // Draw parallel lines to mimic steps
      ctx.strokeStyle = stair.id === selectedElementId ? '#3b82f6' : '#9ca3af';
      ctx.lineWidth = 1.5;
      
      const numSteps = 10;
      const stepSpacing = stairHeightPx / numSteps;
      
      for (let i = 1; i < numSteps; i++) {
        const y = -stairHeightPx / 2 + i * stepSpacing;
        ctx.beginPath();
        ctx.moveTo(-stairWidthPx / 2, y);
        ctx.lineTo(stairWidthPx / 2, y);
        ctx.stroke();
      }
      
      ctx.restore();
    });

    if (tempWallStart) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(tempWallStart.x, tempWallStart.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(tempWallStart.x, tempWallStart.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    if (tempRoomStart) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(tempRoomStart.x, tempRoomStart.y, mousePos.x - tempRoomStart.x, mousePos.y - tempRoomStart.y);
      ctx.setLineDash([]);
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(tempRoomStart.x, tempRoomStart.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    if (tempDimensionStart && !tempDimensionEnd) {
      // First to second click: show line preview
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(tempDimensionStart.x, tempDimensionStart.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (tempDimensionStart && tempDimensionEnd) {
      // Second to third click: show dimension preview with offset
      const angle = Math.atan2(tempDimensionEnd.y - tempDimensionStart.y, tempDimensionEnd.x - tempDimensionStart.x);
      const perpX = Math.cos(angle + Math.PI / 2);
      const perpY = Math.sin(angle + Math.PI / 2);
      
      // Calculate offset based on mouse position
      const midX = (tempDimensionStart.x + tempDimensionEnd.x) / 2;
      const midY = (tempDimensionStart.y + tempDimensionEnd.y) / 2;
      const toMouse = { x: mousePos.x - midX, y: mousePos.y - midY };
      const offsetDistance = toMouse.x * perpX + toMouse.y * perpY;
      
      const offsetStart = {
        x: tempDimensionStart.x + perpX * offsetDistance,
        y: tempDimensionStart.y + perpY * offsetDistance
      };
      const offsetEnd = {
        x: tempDimensionEnd.x + perpX * offsetDistance,
        y: tempDimensionEnd.y + perpY * offsetDistance
      };
      
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      // Draw connector lines
      ctx.beginPath();
      ctx.moveTo(tempDimensionStart.x, tempDimensionStart.y);
      ctx.lineTo(offsetStart.x, offsetStart.y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(tempDimensionEnd.x, tempDimensionEnd.y);
      ctx.lineTo(offsetEnd.x, offsetEnd.y);
      ctx.stroke();
      
      // Draw dimension line
      ctx.beginPath();
      ctx.moveTo(offsetStart.x, offsetStart.y);
      ctx.lineTo(offsetEnd.x, offsetEnd.y);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  }, [walls, openings, dimensions, beds, wardrobes, stairs, tempWallStart, tempRoomStart, unit, backgroundImage, tempDimensionStart, tempDimensionEnd, mousePos, selectedElementId, currentTool, scale, zoom, panOffset]);

  const pinchRef = useRef<{ dist: number; cx: number; cy: number } | null>(null);
  const asMouse = (t: { clientX: number; clientY: number }) =>
    ({ clientX: t.clientX, clientY: t.clientY, button: 0, preventDefault() {} } as unknown as React.MouseEvent<HTMLCanvasElement>);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length >= 2) {
      handleMouseUp();
      pinchRef.current = null;
      return;
    }
    const t = e.touches[0];
    handleMouseMove(asMouse(t));
    handleMouseDown(asMouse(t));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (e.touches.length >= 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const rect = canvas.getBoundingClientRect();
      const k = canvas.width / rect.width;
      const cx = ((a.clientX + b.clientX) / 2 - rect.left) * k;
      const cy = ((a.clientY + b.clientY) / 2 - rect.top) * k;
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const prev = pinchRef.current;
      if (prev && prev.dist > 0) {
        const newZoom = Math.max(0.1, Math.min(5, zoom * (dist / prev.dist)));
        const worldX = (prev.cx - panOffset.x) / zoom;
        const worldY = (prev.cy - panOffset.y) / zoom;
        setPanOffset({ x: cx - worldX * newZoom, y: cy - worldY * newZoom });
        setZoom(newZoom);
      }
      pinchRef.current = { dist, cx, cy };
      return;
    }
    handleMouseMove(asMouse(e.touches[0]));
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.cancelable) e.preventDefault(); // stop emulated mouse events (double placement)
    if (e.touches.length < 2) pinchRef.current = null;
    if (e.touches.length === 0) handleMouseUp();
  };

  return (
    <canvas
      ref={canvasRef}
      width={2400}
      height={1600}
      className="absolute inset-0"
      style={{ 
        width: '100%', 
        height: '100%',
        touchAction: 'none',
        cursor: isPanning ? 'grabbing' : (currentTool === 'select' ? 'default' : 'crosshair')
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    />
  );
}
