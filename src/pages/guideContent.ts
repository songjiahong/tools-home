import { Lang } from '../i18n/translations'

export interface GuideSection {
  h: string
  p?: string[]
  ol?: string[]
  ul?: string[]
}
export interface Guide {
  slug: string
  linkKey: 'guide.draw.link' | 'guide.measure.link'
  ogImage: string
  content: Record<Lang, { title: string; desc: string; h1: string; intro: string; sections: GuideSection[]; cta: string }>
}

export const guides: Guide[] = [
  {
    slug: 'how-to-draw-a-floor-plan',
    linkKey: 'guide.draw.link',
    ogImage: '/og/floor-plan.jpg',
    content: {
      en: {
        title: 'How to Draw a Floor Plan Online – Step-by-Step Guide',
        desc: 'Learn how to draw a floor plan online in minutes: collect measurements, draw walls, add doors, windows and furniture, then export. Free tool, no sign-up.',
        h1: 'How to Draw a Floor Plan Online (Step by Step)',
        intro: 'A floor plan is a top-down drawing of a space showing walls, doors, windows and furniture to scale. You can draw one in a few minutes in your browser. Here is the process we recommend.',
        sections: [
          { h: 'Before you start', p: ['Gather the measurements you have: the length of each wall, the position and width of doors and windows, and the size of the furniture you want to place. If you are redesigning a typical apartment or house, you can also start from a template and change it.'] },
          { h: 'Steps', ol: [
            'Choose a starting point: open a template (studio, 1-bedroom, 2-bedroom, bedroom, office or house) or begin with a blank canvas.',
            'Draw the outer walls with the Room tool: click two opposite corners. The tool creates four connected walls and labels the area.',
            'Add interior walls with the Wall tool. Points snap to existing wall ends and midpoints, and walls align horizontally or vertically.',
            'Place doors and windows: pick the Door or Window tool and click on a wall. Select an item to change its width, swing direction and hinge side.',
            'Add furniture such as a bed, sofa, table, kitchen counter or bathroom fixtures from the Furniture tool, then drag to move and press R to rotate.',
            'Add dimension lines and text labels (for example room names) so the plan is easy to read.',
            'Export the plan as a PNG or SVG image, save it as a file to continue later, or copy a share link.',
          ] },
          { h: 'Tips for accurate drawings', ul: [
            'Common door widths are around 80–90 cm for interior doors and 90–100 cm for entrance doors, but always use your own measurements.',
            'Use the unit selector to work in centimetres, metres or feet and inches.',
            'Use Undo (Ctrl+Z) freely. Your drawing is also autosaved in this browser.',
            'Have a sketch or an old plan? Use Trace to place it behind the grid and draw over it.',
          ] },
        ],
        cta: 'Open the free floor plan maker',
      },
      zh: {
        title: '如何在线绘制平面图 – 分步指南',
        desc: '几分钟学会在线绘制平面图：收集尺寸、画墙体、添加门窗和家具，然后导出。免费工具，无需注册。',
        h1: '如何在线绘制平面图（分步指南）',
        intro: '平面图（户型图）是从上往下看的、按比例绘制的空间图纸，显示墙体、门窗和家具。您可以直接在浏览器中几分钟画出一张。以下是我们推荐的流程。',
        sections: [
          { h: '开始之前', p: ['先收集已有的尺寸：每面墙的长度，门窗的位置和宽度，以及要摆放的家具大小。如果只是改造常见的公寓或住宅，也可以从模板开始再修改。'] },
          { h: '步骤', ol: [
            '选择起点：打开模板（单间、一居室、两居室、卧室、办公室或住宅），或从空白画布开始。',
            '用“房间”工具画外墙：点击两个对角，工具会生成四面相连的墙并标注面积。',
            '用“墙”工具添加内墙。端点会吸附到已有墙的端点和中点，并自动水平或垂直对齐。',
            '放置门窗：选择“门”或“窗”工具，在墙上点击。选中后可调整宽度、开启方向和合页位置。',
            '在“家具”工具中添加床、沙发、桌子、橱柜或卫浴设备，拖动移动，按 R 旋转。',
            '添加尺寸线和文字标注（如房间名称），让图纸更易读。',
            '导出为 PNG 或 SVG 图片，保存为文件以便继续编辑，或复制分享链接。',
          ] },
          { h: '提高准确度的小技巧', ul: [
            '室内门宽常见约 80–90 厘米，入户门约 90–100 厘米，但请以您自己的实测为准。',
            '用单位选择器在厘米、米和英尺/英寸之间切换。',
            '放心使用撤销（Ctrl+Z）。图纸也会自动保存在此浏览器中。',
            '有手绘草图或旧图纸？用“描摹”把它放在网格下方，直接描画。',
          ] },
        ],
        cta: '打开免费平面图工具',
      },
    },
  },
  {
    slug: 'measure-a-room-for-a-floor-plan',
    linkKey: 'guide.measure.link',
    ogImage: '/og/floor-plan.jpg',
    content: {
      en: {
        title: 'How to Measure a Room and Draw a Floor Plan Online',
        desc: 'How to measure a room accurately, check it for square, and turn the measurements into a floor plan online. Includes how to measure over an existing plan image.',
        h1: 'How to Measure a Room and Draw It as a Floor Plan',
        intro: 'Good floor plans start with good measurements. This guide shows how to measure a room with a tape measure or laser meter and how to measure over an existing plan online.',
        sections: [
          { h: 'What you need', ul: ['A tape measure or laser distance meter', 'Paper and a pencil for a rough sketch', 'A helper for long walls (optional)'] },
          { h: 'Measure the room', ol: [
            'Sketch the room roughly on paper, including doors and windows.',
            'Measure each wall from corner to corner along the floor, and write the number on the sketch. Measure twice.',
            'Measure both diagonals of a rectangular room. If they are equal, the room is square; if not, note the difference and draw the actual shape.',
            'For each door and window, note the distance from the nearest corner and the opening width.',
            'Measure fixed items you want on the plan, such as built-in wardrobes, counters and bathroom fixtures.',
            'Note the wall thickness if you can (for example at a door opening). Interior walls are commonly around 10 cm and exterior walls thicker, but it varies.',
          ] },
          { h: 'Enter the measurements', ol: [
            'Open the floor plan maker and set the unit you measured in (cm, m or ft/in).',
            'Draw the room with the Room tool, then select a wall and type its exact length in the Properties panel.',
            'Add doors and windows and set their widths.',
            'Use the Dimension tool to add measurement lines between any two points, so the plan shows its sizes.',
          ] },
          { h: 'Measure over an existing floor plan image', p: ['If you have a photo or scan of a plan, upload it with Trace. Draw a Dimension line along a wall whose real length you know, then adjust the image size until the line shows that length. You can then trace the walls and read other distances directly with the Dimension tool. The image is only a guide: it is not saved or exported.'] },
        ],
        cta: 'Open the free floor plan maker',
      },
      zh: {
        title: '如何测量房间并在线绘制平面图',
        desc: '如何准确测量房间、检查是否方正，并把测量结果画成在线平面图，还包括如何在现有平面图图片上测量。',
        h1: '如何测量房间并绘制平面图',
        intro: '好的平面图始于准确的测量。本指南介绍如何用卷尺或激光测距仪测量房间，以及如何在线对现有平面图进行测量。',
        sections: [
          { h: '所需工具', ul: ['卷尺或激光测距仪', '纸和铅笔，用于画草图', '长墙面可找人帮忙（可选）'] },
          { h: '测量房间', ol: [
            '在纸上粗略画出房间，包括门和窗。',
            '沿地面从墙角到墙角测量每面墙，把数字写在草图上，并测量两次。',
            '测量矩形房间的两条对角线。两条相等说明房间方正；不相等则记下差值，按实际形状绘制。',
            '对每个门窗，记录它距最近墙角的距离和洞口宽度。',
            '测量要画进图纸的固定物件，如嵌入式衣柜、橱柜和卫浴设备。',
            '如有可能，记下墙体厚度（例如在门洞处）。室内墙常见约 10 厘米，外墙更厚，但各处不同。',
          ] },
          { h: '录入测量数据', ol: [
            '打开平面图工具，选择您测量所用的单位（厘米、米或英尺/英寸）。',
            '用“房间”工具画出房间，然后选中一面墙，在属性面板输入精确长度。',
            '添加门窗并设置宽度。',
            '用“尺寸”工具在任意两点之间添加测量线，让图纸显示尺寸。',
          ] },
          { h: '在现有平面图图片上测量', p: ['如果您有平面图的照片或扫描件，用“描摹”上传。沿一面已知实际长度的墙画一条尺寸线，调整图片大小直到尺寸线显示该长度。之后就可以描画墙体，并用“尺寸”工具直接读取其他距离。图片仅作参考，不会被保存或导出。'] },
        ],
        cta: '打开免费平面图工具',
      },
    },
  },
]
