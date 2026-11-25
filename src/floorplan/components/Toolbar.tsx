import { MousePointer2, Minus, DoorOpen, RectangleHorizontal, Ruler, Bed, Box, Layers, Square } from 'lucide-react';
import { Tool } from '../types';
import { useI18n } from '../../i18n/I18nProvider';
import { TKey } from '../../i18n/translations';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export default function Toolbar({ currentTool, onToolChange }: ToolbarProps) {
  const { t } = useI18n();
  const tools: { id: Tool; icon: React.ReactNode; key: TKey }[] = [
    { id: 'select', icon: <MousePointer2 size={20} />, key: 'fp.tool.select' },
    { id: 'wall', icon: <Minus size={20} />, key: 'fp.tool.wall' },
    { id: 'room', icon: <Square size={20} />, key: 'fp.tool.room' },
    { id: 'door', icon: <DoorOpen size={20} />, key: 'fp.tool.door' },
    { id: 'window', icon: <RectangleHorizontal size={20} />, key: 'fp.tool.window' },
    { id: 'dimension', icon: <Ruler size={20} />, key: 'fp.tool.dimension' },
    { id: 'bed', icon: <Bed size={20} />, key: 'fp.tool.bed' },
    { id: 'wardrobe', icon: <Box size={20} />, key: 'fp.tool.furniture' },
    { id: 'stair', icon: <Layers size={20} />, key: 'fp.tool.stair' },
  ];

  return (
    <div className="w-16 sm:w-20 bg-white border-r shadow-sm flex flex-col items-center py-3 gap-2 overflow-y-auto">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`w-12 sm:w-14 h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
            currentTool === tool.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={t(tool.key)}
        >
          {tool.icon}
          <span className="text-xs">{t(tool.key)}</span>
        </button>
      ))}
    </div>
  );
}
