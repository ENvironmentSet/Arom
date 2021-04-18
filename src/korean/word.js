import {Morphemes} from './morpheme';

export class Word {
  constructor(type, ...morphemes) {
    this.type = type;
    this.morphemes = morphemes;
    this.pullLettersAndPhonemes();
  }

  pullLettersAndPhonemes() {
    this.letters = this.morphemes.reduce((letters, morpheme) => letters.concat(morpheme.letters), []);
    this.phonemes = this.morphemes.reduce((phonemes, morpheme) => phonemes.concat(morpheme.phonemes), []);
  }

  replace(thing, newThing) {
    if (newThing instanceof Morphemes) {
      if (this.morphemes.includes(thing)) this.morphemes.splice(this.morphemes.indexOf(thing), 1, newThing);
    } else {
      this.morphemes.forEach(morpheme => morpheme.replace(thing, newThing));
    }
    this.pullLettersAndPhonemes();
  }

  toString() {
    return this.morphemes.reduce((built, morpheme) => built + morpheme.toString(), '')
  }
}
