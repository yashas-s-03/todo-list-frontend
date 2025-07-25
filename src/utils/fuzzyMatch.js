// src/utils/fuzzyMatch.js
// A very basic fuzzy matching utility for demonstration.
// For production, consider a library like 'fuse.js' (npm install fuse.js).

export function findBestMatch(input, targets) {
    let bestRating = 0;
    let bestTarget = null;

    // Simple case-insensitive comparison and length-based "rating"
    const lowerInput = input.toLowerCase();

    targets.forEach(target => {
        const lowerTarget = target.toLowerCase();
        let commonChars = 0;
        for (let i = 0; i < Math.min(lowerInput.length, lowerTarget.length); i++) {
            if (lowerInput[i] === lowerTarget[i]) {
                commonChars++;
            }
        }
        // A very basic rating. Real fuzzy match algorithms are much more sophisticated.
        const currentRating = commonChars / Math.max(lowerInput.length, lowerTarget.length);

        if (currentRating > bestRating) {
            bestRating = currentRating;
            bestTarget = target;
        }
    });

    // Return the best match if it meets a minimum threshold
    // You'll want a more sophisticated rating for real-world use.
    return bestTarget ? { target: bestTarget, rating: bestRating } : null;
}

// Example using a simple Levenshtein distance or a dedicated fuzzy search library
// If you install 'fuse.js':
/*
import Fuse from 'fuse.js';

export function findBestMatch(input, targets) {
    const options = {
        keys: [], // No specific keys if targets are just strings
        includeScore: true,
        threshold: 0.6 // Adjust sensitivity (0 is perfect match, 1 is no match)
    };
    const fuse = new Fuse(targets, options);
    const result = fuse.search(input);

    if (result.length > 0) {
        // Fuse.js score is 0 for perfect match, 1 for no match.
        // We want to return a higher rating for better matches, so 1 - score.
        return { target: result[0].item, rating: 1 - result[0].score };
    }
    return null;
}
*/