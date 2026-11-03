import {media} from './media-manifest.js';
export {media};
export const stories=[
 {key:'kitchen',eyebrow:'KITCHEN · 有序厨房',title:'把日常烟火，装进温柔的秩序。',copy:'原木橱柜、浅色台面与白色家电相互呼应。从冰箱取出食材，在料理台准备晚餐，再把清洁收尾交给洗碗区。让备餐、烹饪与收拾，在同一空间里顺畅衔接。',points:['白色家电，融入原木厨房','取材、备餐与清洁动线','让台面留给烹饪灵感'],alt:'原木厨房中的白色四门冰箱、洗碗机、蒸烤设备与料理台'},
 {key:'laundry',eyebrow:'LAUNDRY · 从容洗护',title:'让洗护归位，把空间留给生活。',copy:'窗边的自然光，叠好的毛巾，与上下叠放的洗护设备，共同组成一处整洁的家务角。将洗护与收纳集中规划，让忙碌的日常，也拥有清楚的边界与从容的节奏。',points:['上下布局，整合洗护区域','篮筐与层架，分类收纳','自然采光，日常也舒心'],alt:'原木洗衣房中上下叠放的白色滚筒洗护设备与收纳篮'},
 {key:'living',eyebrow:'LIVING · 全屋和谐',title:'家电融入家，舒适自在发生。',copy:'客厅与厨房自然相连，白色家电融入柔和的木色背景。用统一的色调连接洗护、烹饪与起居，让不同功能各就其位，也让一家人的相处空间更显完整。',points:['客餐厨一体，空间自然衔接','白色与木色，视觉更协调','从料理到起居，一屋好生活'],alt:'明亮的原木客餐厅中搭配白色冰箱、空调、烹饪设备与空气设备'}
];
export function storyMarkup(story){const src=media[story.key];return `<article class="lifestyle-story ${src?'has-photo':'awaiting-photo'}"><div class="lifestyle-photo">${src?`<img src="${src}" alt="${story.alt}" loading="lazy">`:''}</div><div class="lifestyle-copy"><p class="eyebrow">${story.eyebrow}</p><h3>${story.title}</h3><p>${story.copy}</p><ul>${story.points.map(p=>`<li>${p}</li>`).join('')}</ul></div></article>`;}
