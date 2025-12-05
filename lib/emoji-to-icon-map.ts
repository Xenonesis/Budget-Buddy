/**
 * Emoji to Professional Icon Mapping
 * Maps emojis used throughout the app to professional Lucide icons
 */

export const emojiToIconMap: Record<string, string> = {
  // Financial emojis
  '💰': 'DollarSign',
  '💵': 'Banknote',
  '💸': 'TrendingDown',
  '💳': 'CreditCard',
  '🏦': 'Landmark',
  '💹': 'TrendingUp',
  '📊': 'BarChart3',
  '📈': 'LineChart',
  '📉': 'TrendingDown',

  // Action emojis
  '✅': 'CheckCircle2',
  '❌': 'XCircle',
  '⚠️': 'AlertTriangle',
  '✔️': 'Check',
  '❗': 'AlertCircle',

  // Category emojis
  '🍔': 'UtensilsCrossed',
  '🚗': 'Car',
  '🛍️': 'ShoppingBag',
  '🎬': 'Film',
  '🏥': 'Heart',
  '💡': 'Lightbulb',
  '🎯': 'Target',
  '⭐': 'Star',

  // Misc emojis
  '🚀': 'Rocket',
  '🎨': 'Palette',
  '📱': 'Smartphone',
  '💻': 'Laptop',
  '🔔': 'Bell',
  '⚙️': 'Settings',
  '📅': 'Calendar',
  '🕐': 'Clock',
  '🔍': 'Search',
  '📝': 'FileText',
  '📋': 'ClipboardList',
  '✨': 'Sparkles',
  '🌟': 'Star',
};

/**
 * Convert emoji to icon name
 */
export function emojiToIcon(emoji: string): string {
  return emojiToIconMap[emoji] || 'Circle';
}

/**
 * Check if string contains emoji
 */
export function containsEmoji(text: string): boolean {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(text);
}

/**
 * Strip emojis from text
 */
export function stripEmojis(text: string): string {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return text.replace(emojiRegex, '').trim();
}
