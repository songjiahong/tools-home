import { Unit, formatLength } from './units';
import { Wall, Opening, Dimension, Bed, Wardrobe, Stair } from '../types';

export function generateFloorPlanSVG(
  walls: Wall[],
  openings: Opening[],
  dimensions: Dimension[],
  beds: Bed[],
  wardrobes: Wardrobe[],
  stairs: Stair[],
  unit: Unit = 'cm'
): string {
  const scale = 2; // cm to pixels conversion

  // Calculate bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  // Check all walls
  walls.forEach(wall => {
    const halfThickness = wall.thickness / 2;
    minX = Math.min(minX, wall.start.x - halfThickness, wall.end.x - halfThickness);
    minY = Math.min(minY, wall.start.y - halfThickness, wall.end.y - halfThickness);
    maxX = Math.max(maxX, wall.start.x + halfThickness, wall.end.x + halfThickness);
    maxY = Math.max(maxY, wall.start.y + halfThickness, wall.end.y + halfThickness);
  });

  // Check all beds
  beds.forEach(bed => {
    const bedWidth = (bed.size === 'queen' ? 180 : 120) * scale;
    const bedHeight = 200 * scale;
    const maxDim = Math.max(bedWidth, bedHeight);
    minX = Math.min(minX, bed.position.x - maxDim);
    minY = Math.min(minY, bed.position.y - maxDim);
    maxX = Math.max(maxX, bed.position.x + maxDim);
    maxY = Math.max(maxY, bed.position.y + maxDim);
  });

  // Check all wardrobes
  wardrobes.forEach(wardrobe => {
    const w = wardrobe.width * scale;
    const h = wardrobe.height * scale;
    const maxDim = Math.max(w, h);
    minX = Math.min(minX, wardrobe.position.x - maxDim);
    minY = Math.min(minY, wardrobe.position.y - maxDim);
    maxX = Math.max(maxX, wardrobe.position.x + maxDim);
    maxY = Math.max(maxY, wardrobe.position.y + maxDim);
  });

  // Check all stairs
  stairs.forEach(stair => {
    const w = stair.width * scale;
    const h = stair.height * scale;
    const maxDim = Math.max(w, h);
    minX = Math.min(minX, stair.position.x - maxDim);
    minY = Math.min(minY, stair.position.y - maxDim);
    maxX = Math.max(maxX, stair.position.x + maxDim);
    maxY = Math.max(maxY, stair.position.y + maxDim);
  });

  // Check all dimensions
  dimensions.forEach(dim => {
    const angle = Math.atan2(dim.end.y - dim.start.y, dim.end.x - dim.start.x);
    const perpX = Math.cos(angle + Math.PI / 2);
    const perpY = Math.sin(angle + Math.PI / 2);
    
    const offsetStartX = dim.start.x + perpX * dim.offset;
    const offsetStartY = dim.start.y + perpY * dim.offset;
    const offsetEndX = dim.end.x + perpX * dim.offset;
    const offsetEndY = dim.end.y + perpY * dim.offset;
    
    minX = Math.min(minX, dim.start.x, dim.end.x, offsetStartX, offsetEndX);
    minY = Math.min(minY, dim.start.y, dim.end.y, offsetStartY, offsetEndY);
    maxX = Math.max(maxX, dim.start.x, dim.end.x, offsetStartX, offsetEndX);
    maxY = Math.max(maxY, dim.start.y, dim.end.y, offsetStartY, offsetEndY);
  });

  // Add extra space for dimension labels
  if (dimensions.length > 0) {
    minX -= 30;
    minY -= 30;
    maxX += 30;
    maxY += 30;
  }

  // Add padding
  const padding = 30;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  // Start SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${contentWidth}" height="${contentHeight}" viewBox="${minX} ${minY} ${contentWidth} ${contentHeight}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="${minX}" y="${minY}" width="${contentWidth}" height="${contentHeight}" fill="#ffffff"/>
  
  <!-- Walls -->`;

  // Render walls
  walls.forEach(wall => {
    const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
    const perpX = Math.cos(angle + Math.PI / 2);
    const perpY = Math.sin(angle + Math.PI / 2);
    const halfThickness = wall.thickness / 2;

    const topLeft = { x: wall.start.x + perpX * halfThickness, y: wall.start.y + perpY * halfThickness };
    const topRight = { x: wall.end.x + perpX * halfThickness, y: wall.end.y + perpY * halfThickness };
    const bottomRight = { x: wall.end.x - perpX * halfThickness, y: wall.end.y - perpY * halfThickness };
    const bottomLeft = { x: wall.start.x - perpX * halfThickness, y: wall.start.y - perpY * halfThickness };

    svg += `
  <polygon points="${topLeft.x},${topLeft.y} ${topRight.x},${topRight.y} ${bottomRight.x},${bottomRight.y} ${bottomLeft.x},${bottomLeft.y}" fill="#374151" stroke="#1f2937" stroke-width="1"/>`;

    if (wall.style === 'dashed') {
      const centerX = (wall.start.x + wall.end.x) / 2;
      const centerY = (wall.start.y + wall.end.y) / 2;
      const length = Math.sqrt(Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.y - wall.start.y, 2));
      const angleDeg = (angle * 180) / Math.PI;
      
      svg += `
  <line x1="${-length/2}" y1="0" x2="${length/2}" y2="0" stroke="#ffffff" stroke-width="2" stroke-dasharray="10,5" transform="translate(${centerX},${centerY}) rotate(${angleDeg})"/>`;
    }
  });

  svg += `
  
  <!-- Openings -->`;

  // Render openings
  openings.forEach(opening => {
    const wall = walls.find(w => w.id === opening.wallId);
    if (!wall) return;

    const wallLength = Math.sqrt(Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.y - wall.start.y, 2));
    const openingPoint = {
      x: wall.start.x + (wall.end.x - wall.start.x) * opening.position,
      y: wall.start.y + (wall.end.y - wall.start.y) * opening.position
    };
    
    const wallDirX = (wall.end.x - wall.start.x) / wallLength;
    const wallDirY = (wall.end.y - wall.start.y) / wallLength;
    const openingWidthInPixels = opening.width * scale;
    const halfWidth = openingWidthInPixels / 2;
    const halfThickness = wall.thickness / 2;
    const angleDeg = (Math.atan2(wallDirY, wallDirX) * 180) / Math.PI;

    svg += `
  <g transform="translate(${openingPoint.x},${openingPoint.y}) rotate(${angleDeg})">`;

    if (opening.type === 'door') {
      const swingDir = opening.swingDirection || 1;
      const hingePos = opening.hingePosition || 'left';
      const doorType = opening.doorType || 'single';

      // Hollow opening
      svg += `
    <rect x="${-halfWidth}" y="${-halfThickness}" width="${openingWidthInPixels}" height="${wall.thickness}" fill="#ffffff" stroke="#000000" stroke-width="2"/>`;

      if (doorType === 'double') {
        const panelWidth = openingWidthInPixels / 2;
        
        // Center line
        svg += `
    <line x1="0" y1="${-halfThickness}" x2="0" y2="${halfThickness}" stroke="#8b5cf6" stroke-width="2"/>`;

        // Left panel
        const leftRayAngle = swingDir > 0 ? -Math.PI / 4 : Math.PI / 4;
        const leftEndX = -halfWidth + panelWidth * Math.cos(leftRayAngle);
        const leftEndY = panelWidth * Math.sin(leftRayAngle);
        
        svg += `
    <line x1="${-halfWidth}" y1="0" x2="${leftEndX}" y2="${leftEndY}" stroke="#a78bfa" stroke-width="2"/>`;
        
        // Convert canvas arc to SVG arc for left panel
        if (swingDir > 0) {
          // Canvas: arc from -PI/4 to 0
          const startX = -halfWidth + panelWidth * Math.cos(-Math.PI / 4);
          const startY = panelWidth * Math.sin(-Math.PI / 4);
          const endX = -halfWidth + panelWidth;
          const endY = 0;
          svg += `
    <path d="M ${startX} ${startY} A ${panelWidth} ${panelWidth} 0 0 1 ${endX} ${endY}" fill="none" stroke="#a78bfa" stroke-width="2"/>`;
        } else {
          // Canvas: arc from 0 to PI/4
          const startX = -halfWidth + panelWidth;
          const startY = 0;
          const endX = -halfWidth + panelWidth * Math.cos(Math.PI / 4);
          const endY = panelWidth * Math.sin(Math.PI / 4);
          svg += `
    <path d="M ${startX} ${startY} A ${panelWidth} ${panelWidth} 0 0 1 ${endX} ${endY}" fill="none" stroke="#a78bfa" stroke-width="2"/>`;
        }

        // Right panel
        const rightRayAngle = swingDir > 0 ? Math.PI - Math.PI / 4 : Math.PI + Math.PI / 4;
        const rightEndX = halfWidth + panelWidth * Math.cos(rightRayAngle);
        const rightEndY = panelWidth * Math.sin(rightRayAngle);
        
        svg += `
    <line x1="${halfWidth}" y1="0" x2="${rightEndX}" y2="${rightEndY}" stroke="#a78bfa" stroke-width="2"/>`;
        
        // Convert canvas arc to SVG arc for right panel
        if (swingDir > 0) {
          // Canvas: arc from PI - PI/4 to PI
          const startX = halfWidth + panelWidth * Math.cos(Math.PI - Math.PI / 4);
          const startY = panelWidth * Math.sin(Math.PI - Math.PI / 4);
          const endX = halfWidth - panelWidth;
          const endY = 0;
          svg += `
    <path d="M ${startX} ${startY} A ${panelWidth} ${panelWidth} 0 0 1 ${endX} ${endY}" fill="none" stroke="#a78bfa" stroke-width="2"/>`;
        } else {
          // Canvas: arc from PI to PI + PI/4
          const startX = halfWidth - panelWidth;
          const startY = 0;
          const endX = halfWidth + panelWidth * Math.cos(Math.PI + Math.PI / 4);
          const endY = panelWidth * Math.sin(Math.PI + Math.PI / 4);
          svg += `
    <path d="M ${startX} ${startY} A ${panelWidth} ${panelWidth} 0 0 1 ${endX} ${endY}" fill="none" stroke="#a78bfa" stroke-width="2"/>`;
        }
      } else {
        // Single door
        svg += `
    <line x1="${-halfWidth}" y1="0" x2="${halfWidth}" y2="0" stroke="#8b5cf6" stroke-width="2"/>`;

        const hingeX = hingePos === 'left' ? -halfWidth : halfWidth;
        let rayAngle;
        if (hingePos === 'left') {
          rayAngle = swingDir > 0 ? -Math.PI / 4 : Math.PI / 4;
        } else {
          rayAngle = swingDir > 0 ? Math.PI - Math.PI / 4 : Math.PI + Math.PI / 4;
        }
        
        const doorEndX = hingeX + openingWidthInPixels * Math.cos(rayAngle);
        const doorEndY = openingWidthInPixels * Math.sin(rayAngle);
        
        svg += `
    <line x1="${hingeX}" y1="0" x2="${doorEndX}" y2="${doorEndY}" stroke="#a78bfa" stroke-width="2"/>`;

        // Convert canvas arc to SVG arc
        // Canvas: ctx.arc(hingeX, 0, radius, startAngle, endAngle)
        // SVG: path with A command
        if (hingePos === 'left') {
          if (swingDir > 0) {
            // Canvas: arc from -PI/4 to 0 (counterclockwise by default)
            const startX = hingeX + openingWidthInPixels * Math.cos(-Math.PI / 4);
            const startY = openingWidthInPixels * Math.sin(-Math.PI / 4);
            const endX = hingeX + openingWidthInPixels;
            const endY = 0;
            svg += `
    <path d="M ${startX} ${startY} A ${openingWidthInPixels} ${openingWidthInPixels} 0 0 1 ${endX} ${endY}" fill="none" stroke="#a78bfa" stroke-width="2"/>`;
          } else {
            // Canvas: arc from 0 to PI/4
            const startX = hingeX + openingWidthInPixels;
            const startY = 0;
            const endX = hingeX + openingWidthInPixels * Math.cos(Math.PI / 4);
            const endY = openingWidthInPixels * Math.sin(Math.PI / 4);
            svg += `
    <path d="M ${startX} ${startY} A ${openingWidthInPixels} ${openingWidthInPixels} 0 0 1 ${endX} ${endY}" fill="none" stroke="#a78bfa" stroke-width="2"/>`;
          }
        } else {
          if (swingDir > 0) {
            // Canvas: arc from PI - PI/4 to PI
            const startX = hingeX + openingWidthInPixels * Math.cos(Math.PI - Math.PI / 4);
            const startY = openingWidthInPixels * Math.sin(Math.PI - Math.PI / 4);
            const endX = hingeX - openingWidthInPixels;
            const endY = 0;
            svg += `
    <path d="M ${startX} ${startY} A ${openingWidthInPixels} ${openingWidthInPixels} 0 0 1 ${endX} ${endY}" fill="none" stroke="#a78bfa" stroke-width="2"/>`;
          } else {
            // Canvas: arc from PI to PI + PI/4
            const startX = hingeX - openingWidthInPixels;
            const startY = 0;
            const endX = hingeX + openingWidthInPixels * Math.cos(Math.PI + Math.PI / 4);
            const endY = openingWidthInPixels * Math.sin(Math.PI + Math.PI / 4);
            svg += `
    <path d="M ${startX} ${startY} A ${openingWidthInPixels} ${openingWidthInPixels} 0 0 1 ${endX} ${endY}" fill="none" stroke="#a78bfa" stroke-width="2"/>`;
          }
        }
      }
    } else {
      // Window
      svg += `
    <rect x="${-halfWidth}" y="${-halfThickness}" width="${openingWidthInPixels}" height="${wall.thickness}" fill="#ffffff" stroke="#000000" stroke-width="2"/>`;
      
      for (let i = 1; i <= 2; i++) {
        const yPos = -halfThickness + (wall.thickness / 3) * i;
        svg += `
    <line x1="${-halfWidth}" y1="${yPos}" x2="${halfWidth}" y2="${yPos}" stroke="#000000" stroke-width="1"/>`;
      }
    }

    svg += `
  </g>`;
  });

  svg += `
  
  <!-- Dimensions -->`;

  // Render dimensions
  dimensions.forEach(dim => {
    const getDimensionPoint = (attachment: any, fallbackPoint: { x: number; y: number }) => {
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
        
        const openingPoint = {
          x: wall.start.x + (wall.end.x - wall.start.x) * opening.position,
          y: wall.start.y + (wall.end.y - wall.start.y) * opening.position
        };
        
        const wallLength = Math.sqrt(
          Math.pow(wall.end.x - wall.start.x, 2) + 
          Math.pow(wall.end.y - wall.start.y, 2)
        );
        const wallDirX = (wall.end.x - wall.start.x) / wallLength;
        const wallDirY = (wall.end.y - wall.start.y) / wallLength;
        
        const openingWidthInPixels = opening.width * scale;
        const halfWidth = openingWidthInPixels / 2;
        
        if (attachment.edge === 'left') {
          return {
            x: openingPoint.x - wallDirX * halfWidth,
            y: openingPoint.y - wallDirY * halfWidth
          };
        } else {
          return {
            x: openingPoint.x + wallDirX * halfWidth,
            y: openingPoint.y + wallDirY * halfWidth
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

    // Connector lines
    svg += `
  <line x1="${actualStart.x}" y1="${actualStart.y}" x2="${offsetStart.x}" y2="${offsetStart.y}" stroke="#6b7280" stroke-width="2"/>
  <line x1="${actualEnd.x}" y1="${actualEnd.y}" x2="${offsetEnd.x}" y2="${offsetEnd.y}" stroke="#6b7280" stroke-width="2"/>
  <line x1="${offsetStart.x}" y1="${offsetStart.y}" x2="${offsetEnd.x}" y2="${offsetEnd.y}" stroke="#6b7280" stroke-width="2"/>`;

    // Arrow heads
    const arrowSize = 10;
    const angleDeg = (angle * 180) / Math.PI;
    
    svg += `
  <polyline points="${offsetStart.x},${offsetStart.y} ${offsetStart.x + Math.cos(angle) * arrowSize - Math.sin(angle) * arrowSize / 2},${offsetStart.y + Math.sin(angle) * arrowSize + Math.cos(angle) * arrowSize / 2} ${offsetStart.x},${offsetStart.y} ${offsetStart.x + Math.cos(angle) * arrowSize + Math.sin(angle) * arrowSize / 2},${offsetStart.y + Math.sin(angle) * arrowSize - Math.cos(angle) * arrowSize / 2}" fill="none" stroke="#6b7280" stroke-width="2"/>
  <polyline points="${offsetEnd.x},${offsetEnd.y} ${offsetEnd.x - Math.cos(angle) * arrowSize - Math.sin(angle) * arrowSize / 2},${offsetEnd.y - Math.sin(angle) * arrowSize + Math.cos(angle) * arrowSize / 2} ${offsetEnd.x},${offsetEnd.y} ${offsetEnd.x - Math.cos(angle) * arrowSize + Math.sin(angle) * arrowSize / 2},${offsetEnd.y - Math.sin(angle) * arrowSize - Math.cos(angle) * arrowSize / 2}" fill="none" stroke="#6b7280" stroke-width="2"/>`;

    // Label
    const dimLength = Math.sqrt(
      Math.pow(actualEnd.x - actualStart.x, 2) + 
      Math.pow(actualEnd.y - actualStart.y, 2)
    );
    const lengthCm = Math.round(dimLength / scale);
    const midX = (offsetStart.x + offsetEnd.x) / 2;
    const midY = (offsetStart.y + offsetEnd.y) / 2;
    
    svg += `
  <g transform="translate(${midX},${midY}) rotate(${angleDeg})">
    <rect x="-52" y="-16" width="104" height="32" fill="#ffffff"/>
    <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="22" fill="#374151">${formatLength(lengthCm, unit)}</text>
  </g>`;
  });

  svg += `
  
  <!-- Beds -->`;

  // Render beds
  beds.forEach(bed => {
    const bedWidth = (bed.size === 'queen' ? 180 : 120) * scale;
    const bedHeight = 200 * scale;
    const angleDeg = (bed.rotation * 180) / Math.PI;

    svg += `
  <g transform="translate(${bed.position.x},${bed.position.y}) rotate(${angleDeg})">
    <rect x="${-bedWidth / 2}" y="${-bedHeight / 2}" width="${bedWidth}" height="${bedHeight}" fill="#8b5cf6" stroke="#7c3aed" stroke-width="3"/>
    <rect x="${-bedWidth / 2}" y="${-bedHeight / 2 + bedHeight * 0.7}" width="${bedWidth}" height="${bedHeight * 0.3}" fill="#a78bfa"/>`;

    for (let i = 1; i < (bed.size === 'queen' ? 3 : 2); i++) {
      const x = -bedWidth / 2 + (bedWidth / (bed.size === 'queen' ? 3 : 2)) * i;
      svg += `
    <line x1="${x}" y1="${-bedHeight / 2}" x2="${x}" y2="${bedHeight / 2}" stroke="#7c3aed" stroke-width="2"/>`;
    }

    svg += `
  </g>`;
  });

  svg += `
  
  <!-- Wardrobes -->`;

  // Render wardrobes
  wardrobes.forEach(wardrobe => {
    const wardrobeWidthPx = wardrobe.width * scale;
    const wardrobeHeightPx = wardrobe.height * scale;
    const angleDeg = (wardrobe.rotation * 180) / Math.PI;

    const esc = (x: string) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (wardrobe.kind === 'text') {
      svg += `
  <g transform="translate(${wardrobe.position.x},${wardrobe.position.y}) rotate(${angleDeg})">
    <text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="36" font-weight="bold" fill="#374151">${esc(wardrobe.label || '')}</text>
  </g>`;
    } else if (!wardrobe.kind || wardrobe.kind === 'wardrobe') {
      svg += `
  <g transform="translate(${wardrobe.position.x},${wardrobe.position.y}) rotate(${angleDeg})">
    <rect x="${-wardrobeWidthPx / 2}" y="${-wardrobeHeightPx / 2}" width="${wardrobeWidthPx}" height="${wardrobeHeightPx}" fill="#f3f4f6" stroke="#6b7280" stroke-width="2"/>
    <line x1="${-wardrobeWidthPx / 2}" y1="${-wardrobeHeightPx / 2}" x2="${wardrobeWidthPx / 2}" y2="${wardrobeHeightPx / 2}" stroke="#9ca3af" stroke-width="1.5"/>
    <line x1="${wardrobeWidthPx / 2}" y1="${-wardrobeHeightPx / 2}" x2="${-wardrobeWidthPx / 2}" y2="${wardrobeHeightPx / 2}" stroke="#9ca3af" stroke-width="1.5"/>
  </g>`;
    } else {
      const fs = Math.max(16, Math.min(36, Math.min(wardrobeWidthPx, wardrobeHeightPx) / 2.2, wardrobeWidthPx / (Math.max(1, (wardrobe.label || '').length) * 0.6)));
      svg += `
  <g transform="translate(${wardrobe.position.x},${wardrobe.position.y}) rotate(${angleDeg})">
    <rect x="${-wardrobeWidthPx / 2}" y="${-wardrobeHeightPx / 2}" width="${wardrobeWidthPx}" height="${wardrobeHeightPx}" fill="#f3f4f6" stroke="#6b7280" stroke-width="2"/>
    <text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="${fs}" fill="#4b5563">${esc(wardrobe.label || '')}</text>
  </g>`;
    }
  });

  svg += `
  
  <!-- Stairs -->`;

  // Render stairs
  stairs.forEach(stair => {
    const stairWidthPx = stair.width * scale;
    const stairHeightPx = stair.height * scale;
    const angleDeg = (stair.rotation * 180) / Math.PI;
    const numSteps = 10;
    const stepSpacing = stairHeightPx / numSteps;

    svg += `
  <g transform="translate(${stair.position.x},${stair.position.y}) rotate(${angleDeg})">
    <rect x="${-stairWidthPx / 2}" y="${-stairHeightPx / 2}" width="${stairWidthPx}" height="${stairHeightPx}" fill="#f3f4f6" stroke="#6b7280" stroke-width="2"/>`;

    for (let i = 1; i < numSteps; i++) {
      const y = -stairHeightPx / 2 + i * stepSpacing;
      svg += `
    <line x1="${-stairWidthPx / 2}" y1="${y}" x2="${stairWidthPx / 2}" y2="${y}" stroke="#9ca3af" stroke-width="1.5"/>`;
    }

    svg += `
  </g>`;
  });

  svg += `
</svg>`;

  return svg;
}
