import { Wall, Opening, Dimension, Bed, Wardrobe, Stair } from '../types';

export interface FloorPlanData {
  version: string;
  walls: Wall[];
  openings: Opening[];
  dimensions: Dimension[];
  beds: Bed[];
  wardrobes: Wardrobe[];
  stairs: Stair[];
  metadata: {
    createdAt: string;
    modifiedAt: string;
    name?: string;
  };
}

export function saveFloorPlan(
  walls: Wall[],
  openings: Opening[],
  dimensions: Dimension[],
  beds: Bed[],
  wardrobes: Wardrobe[],
  stairs: Stair[],
  fileName: string = 'floorplan'
): void {
  const data: FloorPlanData = {
    version: '1.0',
    walls,
    openings,
    dimensions,
    beds,
    wardrobes,
    stairs,
    metadata: {
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      name: fileName,
    },
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function loadFloorPlan(
  file: File,
  onSuccess: (data: FloorPlanData) => void,
  onError: (error: string) => void
): void {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const data: FloorPlanData = JSON.parse(content);
      
      if (!data.version || !data.walls || !data.openings || !data.dimensions) {
        throw new Error('Invalid floor plan file format');
      }
      
      if (!data.beds) {
        data.beds = [];
      }
      
      if (!data.wardrobes) {
        data.wardrobes = [];
      }
      
      if (!data.stairs) {
        data.stairs = [];
      }
      
      onSuccess(data);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to parse file');
    }
  };
  
  reader.onerror = () => {
    onError('Failed to read file');
  };
  
  reader.readAsText(file);
}

export function exportFloorPlanAsText(
  walls: Wall[],
  openings: Opening[],
  dimensions: Dimension[],
  beds: Bed[],
  wardrobes: Wardrobe[],
  stairs: Stair[]
): string {
  const data: FloorPlanData = {
    version: '1.0',
    walls,
    openings,
    dimensions,
    beds,
    wardrobes,
    stairs,
    metadata: {
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
  };
  
  return JSON.stringify(data, null, 2);
}
