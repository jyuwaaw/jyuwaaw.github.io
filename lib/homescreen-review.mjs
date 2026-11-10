export const MAX_SCREENSHOTS = 5;
// Includes the JPEG data URL prefix and base64 expansion.
export const IMAGE_URL_BUDGET = 2 * 1024 * 1024;

export const scoreDimensions = [
  { key: 'aesthetics', label: '审美', criterion: '配色、留白、视觉层次和文字可读性' },
  { key: 'function', label: '功能', criterion: '可见的 App、组件和快捷入口如何配合完成具体任务，不按数量给分' },
  { key: 'efficiency', label: '效率', criterion: '一个可见任务的入口是否好找，Dock、分组和跨页位置是否减少查找步骤，不猜使用频率或实际速度' },
];
