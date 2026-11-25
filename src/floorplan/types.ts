export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number;
  connectedStart?: string[];
  connectedEnd?: string[];
  style?: 'solid' | 'dashed';
}

export interface Opening {
  id: string;
  wallId: string;
  position: number;
  width: number;
  type: 'door' | 'window';
  swingDirection?: 1 | -1;
  hingePosition?: 'left' | 'right';
  doorType?: 'single' | 'double';
}

export interface DimensionAttachment {
  elementId: string;
  elementType: 'wall' | 'opening';
  edge: 'start' | 'end' | 'left' | 'right';
}

export interface Dimension {
  id: string;
  start: Point;
  end: Point;
  offset: number;
  startAttachment?: DimensionAttachment;
  endAttachment?: DimensionAttachment;
}

export interface Bed {
  id: string;
  position: Point;
  rotation: number;
  size: 'queen' | 'single';
}

export interface Wardrobe {
  id: string;
  /** furniture kind (undefined/'wardrobe' = classic wardrobe); 'text' = text label */
  kind?: string;
  label?: string;
  position: Point;
  width: number;
  height: number;
  rotation: number;
}

export interface Stair {
  id: string;
  position: Point;
  width: number;
  height: number;
  rotation: number;
}

export type Tool = 'select' | 'wall' | 'door' | 'window' | 'dimension' | 'bed' | 'wardrobe' | 'stair' | 'room';

export interface DragState {
  type: 'wall-start' | 'wall-end' | 'wall-move' | 'opening-move' | 'opening-resize' | 'bed-move' | 'bed-rotate' | 'wardrobe-move' | 'wardrobe-rotate' | 'stair-move' | 'stair-rotate' | null;
  elementId: string | null;
  startPoint: Point | null;
  handle?: 'left' | 'right';
}
