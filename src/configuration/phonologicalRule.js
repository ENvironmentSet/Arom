import { Enum } from '../datatype/Enum';
import { Word } from '../korean/word';
import { Morphemes } from '../korean/morpheme';
import { Letter } from '../korean/letter';

export const phonologicalRule = new Enum(
  /**[
    '두음 법칙',
    {
      condition: () => {},
      replacer: () => {},
      relatedMorphemeNumber: 0,
    }
  ],**/ // not yet
  [
    '격음화',
    {
      condition: (morphemeA, morphemeB, word) => {},
      replacer: (morphemeA, morphemeB, word) => {},
      related: {
        with: 'letters',
        number: 2,
      },
    }
  ],
  [
    'ㄴ 첨가',
    {
      condition: () => {},
      replacer: () => {},
      related: {
        with: 'morphemes',
        number: 2,
      },
    }
  ],
  [
    '평 파열음화',
    {
      condition: () => {},
      replacer: () => {},
      related: {
        with: 'letters',
        number: 1,
      },
    }
  ],
  [
    '경음화', // only rule 1, 4
    {
      condition: () => {},
      replacer: () => {},
      related: {
        with: 'letters',
        number: 2,
      },
    }
  ],
  [
    '자음군 단순화',
    {
      condition: () => {},
      replacer: () => {},
      related: {
        with: 'letters',
        number: 1,
      },
    }
  ],
  [
    '비음화',
    {
      condition: () => {},
      replacer: () => {},
      related: {
        with: 'letters',
        number: 2,
      },
    }
  ],
  [
    '유음화',
    {
      condition: (lf, lb) => {
        const lfJong = lf.jong[0];
        const lbCho = lb.cho;

        return lfJong === 'ㄹ' || lbCho === 'ㄹ'; // 초성 종성 같은 모양 다른 코드
      },
      replacer: (lf, lb, word) => {
        const before = word.toString();
        const lfJong = lf.jong[0];
        const lbCho = lb.cho;

        if (lfJong === 'ㄹ') {
          word.replace(lb, lb.updateCho('ㄹ'));

          return {
            result: word,
            applicationRecord: new PhonologicalRuleApplicationRecord(before, word.toString(), `${lbCho} -> ㄹ`, `유음 'ㄹ' 뒤 '${lbCho}'`)
          }
        }
        else {
          word.replace(lf, lf.updateJong(jong => (jong.pop(), [...jong, 'ㄹ'])));

          return {
            result: word,
            applicationRecord: new PhonologicalRuleApplicationRecord(before, word.toString(), `${lfJong} -> ㄹ`, `유음 'ㄹ' 앞 '${lfJong}'`)
          }
        }
      },
      related: {
        with: 'letters',
        number: 2,
      },
    }
  ],
  [
    '구개음화',
    {
      condition: () => {},
      replacer: () => {},
      related: {
        with: 'morphemes',
        number: 2,
      },
    }
  ],
  /**[
    '모음 탈락', // not yet, 용언 지원할 때 같이.
    {
      condition: () => {},
      replacer: () => {},
      related: {
        with: '',
        number: 0,
      },
    }
  ],**/
  [
    '반모음 첨가',
    {
      condition: () => {}, // Boolean
      replacer: () => {}, // result(obj), apRec(strs)
      related: {
        with: 'morphemes',
        number: 2,
      },
    }
  ]
);

class PhonologicalRuleApplicationRecord {
  constructor(before, after, changed, reason = '') { // reason for later
    this.before = before;
    this.after = after;
    this.changed = changed;
    this.reason = reason;
  }
}
//@FIXME: 쪼개는 단위를 글자 / 형태소 로 다양화 해야 함.
export function canPhonologicalRuleApply(word, phonologicalRule) { // 가능한 [things(morp | letter)] 반환
  const { with: thingsToPick, number: NumberToPick } = phonologicalRule.related;

  for (let scope = 0; scope + NumberToPick <= word[thingsToPick].length; scope += 1) {
    const pickedThings = word[thingsToPick].slice(scope, scope + NumberToPick);

    if (phonologicalRule.condition(...pickedThings, word)) return pickedThings;
  }

  return null;
}

export function applyPhonologicalRule(possibleThings, word, phonologicalRule) {
  return phonologicalRule.replacer(...possibleThings, word);
} // apply, -> result, applicationRecord

export function tryPhonologicalRule(word, phonologicalRule) {
  const possibleThings = canPhonologicalRuleApply(word, phonologicalRule);

  if (possibleThings !== null) return applyPhonologicalRule(possibleThings, word, phonologicalRule);
  else return { result: word, applicationRecord: [] }; //@FIXME: terrible idea 2
} // result, applicationRecord
