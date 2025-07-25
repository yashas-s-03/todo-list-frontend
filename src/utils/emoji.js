// src/utils/emoji.js

// Define a mapping of keywords to emojis
// Keywords are case-insensitive and checked for partial matches.
const emojiMap = {
    'gym': '🏋️',
    'workout': '💪',
    'exercise': '🏃',
    'code': '💻',
    'programming': '🖥️',
    'study': '📚',
    'read': '📖',
    'groceries': '🛒',
    'shop': '🛍️',
    'meeting': '🤝',
    'work': '🏢',
    'email': '📧',
    'clean': '🧼',
    'dishes': '🍽️',
    'laundry': '🧺',
    'cook': '🍳',
    'eat': '🍔',
    'doctor': '🩺',
    'appointment': '🗓️',
    'call': '📞',
    'pay bills': '💸',
    'relax': '🧘',
    'movie': '🎬',
    'music': '🎧',
    'travel': '✈️',
    'garden': '🌳',
    'walk': '🚶',
    'run': '🏃',
    'sleep': '😴',
    'birthday': '🎂',
    'party': '🎉',
};

// src/utils/emoji.js

// ... (emojiMap remains the same) ...

export function getEmojiForTask(taskText) {
    // FIX: Add a check for taskText before trying to call .toLowerCase()
    if (!taskText) {
        return '❓'; // Return a default emoji for undefined/null tasks
    }
    const lowerTaskText = taskText.toLowerCase();

    for (const keyword in emojiMap) {
        if (lowerTaskText.includes(keyword)) {
            return emojiMap[keyword];
        }
    }

    return '📝'; // Default 'memo' emoji if no keyword is found
}