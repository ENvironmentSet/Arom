import * as Hangul from 'hangul-js';

export class Letter {
  constructor(cho, jung, ...jong) { // 한글 겹받침 분해, 합성 지원
    this.cho = cho;
    this.jung = jung;
    this.jong = jong;
    this.phonemes = [cho, jung, jong].filter(Boolean).flat(1);
  }

  updateCho(value) {
    return new Letter(value, this.jung, ...this.jong);
  }

  updateJung(value) {
    return new Letter(this.cho, value, ...this.jong);
  }

  updateJong(value) {
    if (typeof value === 'function') value = value([...this.jong]);
    return new Letter(this.cho, this.jung, ...value);
  }

  toString() {
    return Hangul.assemble(this.phonemes); //@FIXME: 겹받침 지원.
  }

  isInComplete() { //@TODO: morpheme tostring에서 incomplete한 letter 처리 추가
    return Boolean(this.jung);
  }
}
