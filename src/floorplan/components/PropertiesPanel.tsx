import { Wall, Opening, Dimension, Bed, Wardrobe, Stair } from '../types';
import { getWallLength, normalizeVector } from '../utils/geometry';
import { useI18n } from '../../i18n/I18nProvider';

interface PropertiesPanelProps {
  selectedElementId: string | null;
  wallThickness: number;
  openingWidth: number;
  onWallThicknessChange: (value: number) => void;
  onOpeningWidthChange: (value: number) => void;
  walls: Wall[];
  setWalls: (walls: Wall[] | ((prev: Wall[]) => Wall[])) => void;
  openings: Opening[];
  setOpenings: (openings: Opening[] | ((prev: Opening[]) => Opening[])) => void;
  dimensions: Dimension[];
  setDimensions: (dimensions: Dimension[] | ((prev: Dimension[]) => Dimension[])) => void;
  beds: Bed[];
  setBeds: (beds: Bed[] | ((prev: Bed[]) => Bed[])) => void;
  bedSize: 'queen' | 'single';
  onBedSizeChange: (size: 'queen' | 'single') => void;
  wardrobes: Wardrobe[];
  setWardrobes: (wardrobes: Wardrobe[] | ((prev: Wardrobe[]) => Wardrobe[])) => void;
  stairs: Stair[];
  setStairs: (stairs: Stair[] | ((prev: Stair[]) => Stair[])) => void;
  saveToHistory: () => void;
}

export default function PropertiesPanel({
  selectedElementId,
  wallThickness,
  openingWidth,
  onWallThicknessChange,
  onOpeningWidthChange,
  walls,
  setWalls,
  openings,
  setOpenings,
  dimensions,
  setDimensions,
  beds,
  setBeds,
  bedSize,
  onBedSizeChange,
  wardrobes,
  setWardrobes,
  stairs,
  setStairs,
  saveToHistory,
}: PropertiesPanelProps) {
  const { t } = useI18n();
  const selectedWall = walls.find(w => w.id === selectedElementId);
  const selectedOpening = openings.find(o => o.id === selectedElementId);
  const selectedDimension = dimensions.find(d => d.id === selectedElementId);
  const selectedBed = beds.find(b => b.id === selectedElementId);
  const selectedWardrobe = wardrobes.find(w => w.id === selectedElementId);
  const selectedStair = stairs.find(s => s.id === selectedElementId);
  const scale = 2;

  const handleWallLengthChange = (newLengthCm: number) => {
    if (!selectedWall) return;
    
    const newLengthPixels = newLengthCm * scale;
    const dir = normalizeVector(selectedWall.start, selectedWall.end);
    const newEnd = {
      x: selectedWall.start.x + dir.x * newLengthPixels,
      y: selectedWall.start.y + dir.y * newLengthPixels
    };
    
    setWalls(prevWalls => prevWalls.map(w => w.id === selectedWall.id ? { ...w, end: newEnd } : w));
    setTimeout(saveToHistory, 0);
  };

  const handleWallThicknessChangeForSelected = (newThickness: number) => {
    if (!selectedWall) return;
    setWalls(prevWalls => prevWalls.map(w => w.id === selectedWall.id ? { ...w, thickness: newThickness } : w));
    setTimeout(saveToHistory, 0);
  };
  return (
    <div className="w-64 bg-white border-l shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">{t('pp.properties')}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pp.wallThickness')}
          </label>
          <input
            type="number"
            value={wallThickness}
            onChange={(e) => onWallThicknessChange(Number(e.target.value))}
            min="5"
            max="50"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="range"
            value={wallThickness}
            onChange={(e) => onWallThicknessChange(Number(e.target.value))}
            min="5"
            max="50"
            step="1"
            className="w-full mt-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pp.openingWidth')}
          </label>
          <input
            type="number"
            value={openingWidth}
            onChange={(e) => onOpeningWidthChange(Number(e.target.value))}
            min="30"
            max="300"
            step="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="range"
            value={openingWidth}
            onChange={(e) => onOpeningWidthChange(Number(e.target.value))}
            min="30"
            max="300"
            step="5"
            className="w-full mt-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pp.bedSize')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onBedSizeChange('queen')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                bedSize === 'queen'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('pp.queen')}
            </button>
            <button
              onClick={() => onBedSizeChange('single')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                bedSize === 'single'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('pp.single')}
            </button>
          </div>
        </div>

        {selectedWall && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('pp.selectedWall')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.length')}
                </label>
                <input
                  type="number"
                  value={Math.round(getWallLength(selectedWall) / scale)}
                  onChange={(e) => handleWallLengthChange(Number(e.target.value))}
                  min="10"
                  max="2000"
                  step="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.thickness')}
                </label>
                <input
                  type="number"
                  value={selectedWall.thickness}
                  onChange={(e) => handleWallThicknessChangeForSelected(Number(e.target.value))}
                  min="5"
                  max="50"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.wallStyle')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setWalls(prevWalls => prevWalls.map(w =>
                        w.id === selectedWall.id
                          ? { ...w, style: 'solid' }
                          : w
                      ));
                      setTimeout(saveToHistory, 0);
                    }}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      (selectedWall.style || 'solid') === 'solid'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('pp.solid')}
                  </button>
                  <button
                    onClick={() => {
                      setWalls(prevWalls => prevWalls.map(w =>
                        w.id === selectedWall.id
                          ? { ...w, style: 'dashed' }
                          : w
                      ));
                      setTimeout(saveToHistory, 0);
                    }}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedWall.style === 'dashed'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('pp.dashed')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedOpening && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {selectedOpening.type === 'door' ? t('pp.selectedDoor') : t('pp.selectedWindow')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.width')}
                </label>
                <input
                  type="number"
                  value={selectedOpening.width}
                  onChange={(e) => {
                    const newWidth = parseFloat(e.target.value);
                    if (newWidth > 0) {
                      setOpenings(prevOpenings => prevOpenings.map(o => 
                        o.id === selectedOpening.id 
                          ? { ...o, width: newWidth }
                          : o
                      ));
                      setTimeout(saveToHistory, 0);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="300"
                  step="5"
                />
              </div>
              {selectedOpening.type === 'door' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('pp.swingDir')}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setOpenings(prevOpenings => prevOpenings.map(o => 
                            o.id === selectedOpening.id 
                              ? { ...o, swingDirection: 1 as 1 | -1 }
                              : o
                          ));
                          setTimeout(saveToHistory, 0);
                        }}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        {t('pp.swingOut')}
                      </button>
                      <button
                        onClick={() => {
                          setOpenings(prevOpenings => prevOpenings.map(o => 
                            o.id === selectedOpening.id 
                              ? { ...o, swingDirection: -1 as 1 | -1 }
                              : o
                          ));
                          setTimeout(saveToHistory, 0);
                        }}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        {t('pp.swingIn')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('pp.doorType')}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setOpenings(prevOpenings => prevOpenings.map(o => 
                            o.id === selectedOpening.id 
                              ? { ...o, doorType: 'single' as 'single' | 'double' }
                              : o
                          ));
                          setTimeout(saveToHistory, 0);
                        }}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          (selectedOpening.doorType || 'single') === 'single'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t('pp.single')}
                      </button>
                      <button
                        onClick={() => {
                          setOpenings(prevOpenings => prevOpenings.map(o => 
                            o.id === selectedOpening.id 
                              ? { ...o, doorType: 'double' as 'single' | 'double' }
                              : o
                          ));
                          setTimeout(saveToHistory, 0);
                        }}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedOpening.doorType === 'double'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t('pp.double')}
                      </button>
                    </div>
                  </div>
                  {(selectedOpening.doorType || 'single') === 'single' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('pp.hinge')}
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setOpenings(prevOpenings => prevOpenings.map(o => 
                              o.id === selectedOpening.id 
                                ? { ...o, hingePosition: 'left' as 'left' | 'right' }
                                : o
                            ));
                            setTimeout(saveToHistory, 0);
                          }}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          {t('pp.hingeLeft')}
                        </button>
                        <button
                          onClick={() => {
                            setOpenings(prevOpenings => prevOpenings.map(o => 
                              o.id === selectedOpening.id 
                                ? { ...o, hingePosition: 'right' as 'left' | 'right' }
                                : o
                            ));
                            setTimeout(saveToHistory, 0);
                          }}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          {t('pp.hingeRight')}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {selectedDimension && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('pp.selectedDimension')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.length')}
                </label>
                <input
                  type="number"
                  value={Math.round(Math.sqrt(
                    Math.pow(selectedDimension.end.x - selectedDimension.start.x, 2) +
                    Math.pow(selectedDimension.end.y - selectedDimension.start.y, 2)
                  ) / scale)}
                  onChange={(e) => {
                    const newLengthCm = parseFloat(e.target.value);
                    if (newLengthCm > 0) {
                      const newLengthPixels = newLengthCm * scale;
                      const angle = Math.atan2(
                        selectedDimension.end.y - selectedDimension.start.y,
                        selectedDimension.end.x - selectedDimension.start.x
                      );
                      const newEnd = {
                        x: selectedDimension.start.x + Math.cos(angle) * newLengthPixels,
                        y: selectedDimension.start.y + Math.sin(angle) * newLengthPixels
                      };
                      setDimensions(prevDimensions => prevDimensions.map(d =>
                        d.id === selectedDimension.id
                          ? { ...d, end: newEnd }
                          : d
                      ));
                      setTimeout(saveToHistory, 0);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="2000"
                  step="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.dimSide')}
                </label>
                <button
                  onClick={() => {
                    setDimensions(prevDimensions => prevDimensions.map(d =>
                      d.id === selectedDimension.id
                        ? { ...d, offset: -d.offset }
                        : d
                    ));
                    setTimeout(saveToHistory, 0);
                  }}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {t('pp.flip')}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedBed && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('pp.selectedBed')}</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Size: <span className="font-medium capitalize">{selectedBed.size}</span>
              </p>
              <p className="text-sm text-gray-600">
                Dimensions: <span className="font-medium">
                  {selectedBed.size === 'queen' ? '180cm × 200cm' : '120cm × 200cm'}
                </span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.rotation')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setBeds(prevBeds => prevBeds.map(b => 
                        b.id === selectedBed.id 
                          ? { ...b, rotation: b.rotation - Math.PI / 2 }
                          : b
                      ));
                      setTimeout(saveToHistory, 0);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ↺ 90° CCW
                  </button>
                  <button
                    onClick={() => {
                      setBeds(prevBeds => prevBeds.map(b => 
                        b.id === selectedBed.id 
                          ? { ...b, rotation: b.rotation + Math.PI / 2 }
                          : b
                      ));
                      setTimeout(saveToHistory, 0);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ↻ 90° CW
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current: {Math.round((selectedBed.rotation * 180 / Math.PI) % 360)}°
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedWardrobe && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{selectedWardrobe.kind && selectedWardrobe.kind !== 'wardrobe' ? t('pp.selectedFurniture') : t('pp.selectedWardrobe')}</h3>
            <div className="space-y-3">
              {(selectedWardrobe.kind === 'text' || (selectedWardrobe.kind && selectedWardrobe.kind !== 'wardrobe')) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('pp.text')}</label>
                  <input
                    type="text"
                    value={selectedWardrobe.label ?? ''}
                    onChange={(e) => {
                      const label = e.target.value;
                      setWardrobes(prev => prev.map(w => w.id === selectedWardrobe.id ? { ...w, label, ...(w.kind === 'text' ? { width: Math.max(40, label.length * 11) } : {}) } : w));
                    }}
                    onBlur={() => setTimeout(saveToHistory, 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.width')}
                </label>
                <input
                  type="number"
                  value={selectedWardrobe.width}
                  onChange={(e) => {
                    const newWidth = parseFloat(e.target.value);
                    if (newWidth > 0) {
                      setWardrobes(prevWardrobes => prevWardrobes.map(w =>
                        w.id === selectedWardrobe.id
                          ? { ...w, width: newWidth }
                          : w
                      ));
                      setTimeout(saveToHistory, 0);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="500"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.height')}
                </label>
                <input
                  type="number"
                  value={selectedWardrobe.height}
                  onChange={(e) => {
                    const newHeight = parseFloat(e.target.value);
                    if (newHeight > 0) {
                      setWardrobes(prevWardrobes => prevWardrobes.map(w =>
                        w.id === selectedWardrobe.id
                          ? { ...w, height: newHeight }
                          : w
                      ));
                      setTimeout(saveToHistory, 0);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="500"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.rotation')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setWardrobes(prevWardrobes => prevWardrobes.map(w => 
                        w.id === selectedWardrobe.id 
                          ? { ...w, rotation: w.rotation - Math.PI / 2 }
                          : w
                      ));
                      setTimeout(saveToHistory, 0);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ↺ 90° CCW
                  </button>
                  <button
                    onClick={() => {
                      setWardrobes(prevWardrobes => prevWardrobes.map(w => 
                        w.id === selectedWardrobe.id 
                          ? { ...w, rotation: w.rotation + Math.PI / 2 }
                          : w
                      ));
                      setTimeout(saveToHistory, 0);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ↻ 90° CW
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current: {Math.round((selectedWardrobe.rotation * 180 / Math.PI) % 360)}°
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedStair && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('pp.selectedStair')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.width')}
                </label>
                <input
                  type="number"
                  value={selectedStair.width}
                  onChange={(e) => {
                    const newWidth = parseFloat(e.target.value);
                    if (newWidth > 0) {
                      setStairs(prevStairs => prevStairs.map(s =>
                        s.id === selectedStair.id
                          ? { ...s, width: newWidth }
                          : s
                      ));
                      setTimeout(saveToHistory, 0);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="500"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.height')}
                </label>
                <input
                  type="number"
                  value={selectedStair.height}
                  onChange={(e) => {
                    const newHeight = parseFloat(e.target.value);
                    if (newHeight > 0) {
                      setStairs(prevStairs => prevStairs.map(s =>
                        s.id === selectedStair.id
                          ? { ...s, height: newHeight }
                          : s
                      ));
                      setTimeout(saveToHistory, 0);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="500"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pp.rotation')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setStairs(prevStairs => prevStairs.map(s => 
                        s.id === selectedStair.id 
                          ? { ...s, rotation: s.rotation - Math.PI / 2 }
                          : s
                      ));
                      setTimeout(saveToHistory, 0);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ↺ 90° CCW
                  </button>
                  <button
                    onClick={() => {
                      setStairs(prevStairs => prevStairs.map(s => 
                        s.id === selectedStair.id 
                          ? { ...s, rotation: s.rotation + Math.PI / 2 }
                          : s
                      ));
                      setTimeout(saveToHistory, 0);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ↻ 90° CW
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current: {Math.round((selectedStair.rotation * 180 / Math.PI) % 360)}°
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-2">{t('pp.instructions')}</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>{t('pp.i.wall')}</strong> {t('pp.i.wallT')}</li>
            <li>• <strong>{t('pp.i.door')}</strong> {t('pp.i.doorT')}</li>
            <li>• <strong>{t('pp.i.bed')}</strong> {t('pp.i.bedT')}</li>
            <li>• <strong>{t('pp.i.dim')}</strong> {t('pp.i.dimT')}</li>
            <li>• <strong>{t('pp.i.sel')}</strong> {t('pp.i.selT')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
