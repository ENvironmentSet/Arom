export class Morphemes {
  constructor(pos, ...letters) {
    this.pos = pos;
    this.letters = letters;
    this.pullPhonemes();
  }

  replace(letter, newLetter) {
    if (this.letters.includes(letter)) this.letters.splice(this.letters.indexOf(letter), 1, newLetter);
    this.pullPhonemes();
  }

  pullPhonemes() {
    this.phonemes = this.letters.reduce((phonemes, letter) => phonemes.concat(letter.phonemes), []);
  }

  toString() {
    return this.letters.reduce((built, letter) => built + letter.toString(), '')
  }
}
