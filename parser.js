/**
 * Parser for World Cup 2026 Stickers
 */

function parseStickersText(repetidasText, faltantesText) {
    const result = {
        repetidas: [],
        faltantes: []
    };

    let repetidasSet = new Set();
    let faltantesSet = new Set();

    if (repetidasText) {
        parseLines(repetidasText, 'repetidas', repetidasSet, faltantesSet);
    }

    if (faltantesText) {
        parseLines(faltantesText, 'faltantes', repetidasSet, faltantesSet);
    }

    result.repetidas = Array.from(repetidasSet).sort();
    result.faltantes = Array.from(faltantesSet).sort();

    return result;
}

function parseLines(text, currentSection, repetidasSet, faltantesSet) {
    // Normalize text: remove emojis, convert to uppercase
    let normalizedText = text.toUpperCase().replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    let lines = normalizedText.split('\n');

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Remove extra spaces from the line and page indicators
        let cleanLine = line.replace(/·.*/, '').trim();

        // Extract teams and numbers
        let listPattern = /([A-Z]{2,3})\s*:?\s*([\d,\s\(\)xX]+)/g;
        let foundStickers = false;

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
            let singlePattern = /([A-Z]{2,3})\s*(\d{1,2})/g;
            let singleMatch;
            while ((singleMatch = singlePattern.exec(cleanLine)) !== null) {
                let team = singleMatch[1];
                let num = parseInt(singleMatch[2], 10);
                addSticker(team, num, currentSection, repetidasSet, faltantesSet);
            }
        }
    }
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

    const VALID_TEAMS = [
        'FWC', 'CC', 'MEX', 'RSA', 'KOR', 'CZE', 'CAN', 'BIH', 'QAT', 'SUI',
        'BRA', 'MAR', 'HAI', 'SCO', 'USA', 'PAR', 'AUS', 'TUR', 'GER', 'CUW',
        'CIV', 'ECU', 'NED', 'JPN', 'SWE', 'TUN', 'BEL', 'EGY', 'IRN', 'NZL',
        'ESP', 'CPV', 'KSA', 'URU', 'FRA', 'SEN', 'IRQ', 'NOR', 'ARG', 'ALG',
        'AUT', 'JOR', 'POR', 'COD', 'UZB', 'COL', 'ENG', 'CRO', 'GHA', 'PAN'
    ];

    // Validate team code against strict list
    if (!VALID_TEAMS.includes(team)) return;

    // Strict numerical boundaries to prevent false positives from random text
    if (team === 'FWC') {
        if (num < 0 || num > 19) return;
    } else if (team === 'CC') {
        if (num < 1 || num > 14) return;
    } else {
        if (num < 1 || num > 20) return;
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
