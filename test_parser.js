const fs = require('fs');
// Very hacky way to test client side code in Node
const source = fs.readFileSync('src/parser.js', 'utf8');
eval(source);

const text1 = `Repetidas
MEX 🇲🇽: 1, 4, 13, 20
RSA 🇿🇦: 1, 2, 3(3x)
Faltantes
FWC 🏆: 3, 4
MEX 🇲🇽: 2, 6`;

const text2 = `❌ FIGURINHAS FALTANDO (19)
─────────────
🇧🇷 BRA · pg. 24-25
BRA18
🇺🇿 UZB · pg. 94-95
UZB4, UZB10, UZB13
Coleção Coca-Cola · pg. 111
CC7, CC8, CC11, CC13
📦 FIGURINHAS REPETIDAS (101)
─────────────
🇲🇽 MEX · pg. 8-9
MEX12 (x1), MEX20 (x1)
🇿🇦 RSA · pg. 10-11
RSA3 (x2), RSA12 (x1), RSA13 (x1), RSA16 (x1), RSA19 (x4)
RSA20 (x3)`;

const text3 = `Figuritas App - List
Usa Mex Can 26
I need
FWC 🌎: 8
MEX 🇲🇽: 11
RSA 🇿🇦: 18
CC 🥤: 1, 8, 9, 11, 13, 14`;

console.log("TEST 1");
console.log(parseStickersText(text1));
console.log("\nTEST 2");
console.log(parseStickersText(text2));
console.log("\nTEST 3");
console.log(parseStickersText(text3));
