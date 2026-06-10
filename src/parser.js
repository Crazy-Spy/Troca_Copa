/**
 * Parser for World Cup 2026 Stickers
 */

function parseStickersText(text) {
    const result = {
        repetidas: [],
        faltantes: []
    };

    if (!text) return result;

    // Normalize text: remove emojis, convert to uppercase
    let normalizedText = text.toUpperCase().replace(/[\u{1F300}-\u{1F9FF}]/gu, '');

    // We will try to split the text into "Repetidas" and "Faltantes" sections.
    // Different apps use different keywords.
    const repetidasKeywords = ['REPETIDAS', 'TENHO'];
    const faltantesKeywords = ['FALTANTES', 'FALTANDO', 'I NEED', 'PRECISO DESSAS', 'PRECISO'];

    let lines = text.split('\n');
    let currentSection = null;

    // A map to store parsed stickers for each section to avoid duplicates
    let repetidasSet = new Set();
    let faltantesSet = new Set();

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].toUpperCase();

        // Check if line indicates a section change
        let isRepetidasHeader = repetidasKeywords.some(kw => line.includes(kw));
        let isFaltantesHeader = faltantesKeywords.some(kw => line.includes(kw));

        if (isRepetidasHeader && !isFaltantesHeader) {
            currentSection = 'repetidas';
            continue;
        } else if (isFaltantesHeader && !isRepetidasHeader) {
            currentSection = 'faltantes';
            continue;
        }

        // Parse the line for stickers if we are in a section
        // Example formats:
        // MEX 🇲🇽: 1, 4, 13, 20
        // FWC: 13(1x)
        // BRA18
        // UZB4, UZB10
        // CC: 14(1x)
        // Coleção Coca-Cola · pg. 111 \n CC7, CC8
        // 🏆 FWC: 13

        // Remove emojis and extra spaces from the line
        let cleanLine = line.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/·.*/, '').trim();

        // Extract teams and numbers
        // Regex matches:
        // 1. A team code (3 letters or CC) followed by an optional colon and numbers
        // 2. A team code directly followed by a number (e.g. BRA18)

        // Let's try to find patterns like "TEAM: num, num, num"
        let listPattern = /([A-Z]{2,3})\s*:?\s*([\d,\s\(\)xX]+)/g;
        let match;

        let foundStickers = false;

        // Reset regex state
        listPattern.lastIndex = 0;

        // Let's first parse standard list format "TEAM : 1, 2, 3"
        if (cleanLine.includes(':')) {
            let parts = cleanLine.split(':');
            let teamPart = parts[0].replace(/[^A-Z]/g, '');
            let numbersPart = parts[1];

            if (teamPart.length >= 2 && teamPart.length <= 3) {
                 extractNumbers(numbersPart).forEach(num => {
                     addSticker(teamPart, num, currentSection, repetidasSet, faltantesSet);
                 });
                 foundStickers = true;
            }
        }

        // If not standard list format, try to match individual stickers like "BRA18" or "UZB4, UZB10"
        if (!foundStickers) {
            // Match any 2-3 uppercase letters followed immediately by 1-2 digits
            let singlePattern = /([A-Z]{2,3})\s*(\d{1,2})/g;
            let singleMatch;
            while ((singleMatch = singlePattern.exec(cleanLine)) !== null) {
                let team = singleMatch[1];
                let num = parseInt(singleMatch[2], 10);
                addSticker(team, num, currentSection, repetidasSet, faltantesSet);
            }
        }
    }

    result.repetidas = Array.from(repetidasSet).sort();
    result.faltantes = Array.from(faltantesSet).sort();

    return result;
}

function extractNumbers(text) {
    let numbers = [];
    // Split by comma or space
    let parts = text.split(/[\s,]+/);
    for (let part of parts) {
        // Extract just the digits, ignore (3x) or similar
        let match = part.match(/^(\d+)/);
        if (match) {
            numbers.push(parseInt(match[1], 10));
        }
    }
    return numbers;
}

function addSticker(team, num, section, repetidasSet, faltantesSet) {
    // Basic validation
    if (!team || isNaN(num)) return;

    // Validate team codes (usually 3 letters, or CC)
    if (team.length !== 3 && team !== 'CC') {
        // Some FWC might come out weird, let's just accept 2 or 3 letters for now
        if (team.length < 2 || team.length > 3) return;
    }

    // Format strictly as TEAM-NUM
    let stickerStr = `${team}-${num}`;

    if (section === 'repetidas') {
        repetidasSet.add(stickerStr);
    } else if (section === 'faltantes') {
        faltantesSet.add(stickerStr);
    }
}

// Make it available globally
if (typeof window !== 'undefined') {
    window.parseStickersText = parseStickersText;
} else if (typeof module !== 'undefined') {
    module.exports = { parseStickersText };
}
