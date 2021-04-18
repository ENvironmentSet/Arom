import React, { useEffect, useState } from 'react';
import {Text, useInput} from 'ink';
import { createPage } from './createPage';
import { useConfigurationState } from '../../configuration/context';
import Spinner from 'ink-spinner';
import { inspectionMode } from '../../configuration/inspectionMode';
import { automationLevel } from '../../configuration/automationLevel';
import {Redirect, useHistory, useParams} from 'react-router';
import SelectInput from 'ink-select-input/build';
import { Tagger } from 'koalanlp/proc';
import { EUNJEON } from 'koalanlp/API';
import axios from 'axios';
import convert from 'xml-js';
import { Letter } from '../../korean/letter';
import { Morphemes } from '../../korean/morpheme';
import { Word } from '../../korean/word';
import * as Hangul from 'hangul-js';
import { tryPhonologicalRule } from '../../configuration/phonologicalRule';

const STD_KR_API_KEY = 'D43D3F7FFBB5BF28789BC3DE196AD322';

async function getCandidateMeanings(word) { // word -> [(wordWithMeaningNumber, meaning)]
  const { data: searchResultXML } = await axios.get('https://stdict.korean.go.kr/api/search.do', {
    params: {
      key: STD_KR_API_KEY,
      q: word
    }
  });
  const searchResult = convert.xml2js(searchResultXML, { compact: true });
  const foundMeanings = [searchResult.channel.item].flat(1); // 못 찾았을 때 처리

  return foundMeanings.map(({ sup_no: { _text: meaningNumber }, sense: { definition: { _cdata: definition } }  }) => ({
    wordWithMeaningNumber: `${word}${meaningNumber}`,
    definition
  }));
}

async function getWordUsageAndType(wordWithMeaningNumber) { // wordWithMeaningNumber -> usage //지금은 그냥 하나만 인위적으로 뽑자. 여러 개 뽑아서 비교는 나중에.
  const { data: advancedSearchResultXML } = await axios.get('https://stdict.korean.go.kr/api/view.do', {
    params: {
      key: STD_KR_API_KEY,
      q: wordWithMeaningNumber
    }
  });
  const advancedSearchResult = convert.xml2js(advancedSearchResultXML, { compact: true }).channel.item.word_info; // add handle for conj // 여러 개 나올 떄 원하는 태그만 봅아내는 코드 작성 필요

  return [advancedSearchResult.pos_info.comm_pattern_info.sense_info.example_info[0].example._cdata.trim(), advancedSearchResult.word_type._text.trim()];
} //나중에는 사용자가 예문 선택 or 작성할 수 있게. 앞에 단어 없는 경우와 연계. / 없는 경우 Handle

async function tagPOStoUsage(wordUsage) { // usage -> tagged usage
  //init moved
  const tagger = new Tagger(EUNJEON);
  const taggedResult = await tagger(wordUsage);

  return taggedResult[0];
}

async function pickWordFromKoalaNLPTagResult(word, taggedWordUsage) { // word, tagged usage -> tagged word
  const wordRegexp = new RegExp(`${word}`);

  for (const wordSegment of taggedWordUsage) {
    if (wordRegexp.test(wordSegment._surface)) {
      let stacked = [];
      let made = '';
      for (const morpheme of wordSegment) { // 접두사 처리?
        if (made + morpheme._surface === word) return stacked.concat(morpheme);
        else {
          stacked.push(morpheme);
          made += morpheme._surface;
        }
      }
    }
  }
}
//what if used word is duplicated? <- nvm

async function koalaNLPDTtoSKDT(taggedWord, wordType) { // tagged word to our dt
  return new Word(
    wordType,
    ...taggedWord.map(morpheme => {
      const letters = morpheme._surface.split('').map( //@TODO: 이중모음에서 반모음 분리?, 겹받침 분리?
        letter => new Letter(...Hangul.disassemble(letter))
      );

      return new Morphemes(morpheme._tag, ...letters);
    })
  );
}

//@TODO: 자동 연음 처리
async function inspectPhonologicalChangeOfWord(analyzedWord, phonologicalProcessPrecedence, applicationRecords = []) { // analyzedWord -> inspectionResult: changelog
  const before = analyzedWord.toString();

  for (const phonologicalProcess of phonologicalProcessPrecedence) {
    const tried = tryPhonologicalRule(analyzedWord, phonologicalProcess);

    if (before !== tried.result.toString())
      return inspectPhonologicalChangeOfWord(tried.result, phonologicalProcessPrecedence, applicationRecords.concat(tried.applicationRecord));
  }

  return { pronunciation: analyzedWord.toString(), applicationRecords };
}

function InspectResult({ inspectionResult, base }) { // inspectionResult -> result table
  const pronunciation = inspectionResult.pronunciation;
  const history = useHistory();

  useInput(() => (console.clear(), history.goBack()));

  return (
    <>
      <Text>분석 완료</Text>
      <Text>메인으로 돌아가려면 아무 키를 누르세요.</Text>
      <Text>{base} -----> {pronunciation}</Text>
      <Text>---------음운 변동 과정----------</Text>
      {
        inspectionResult.applicationRecords.map((({ before, after, changed, reason }, i)=>
          <Text key={i}>{i + 1}. {before}에서 {after}로 변화({changed}). ({reason})</Text>
        ))
      }
    </>
  );
}

function BasicInspection() {
  const { text } = useParams();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const { state: { phonologicalProcessPrecedence } } = useConfigurationState();

  useEffect(() => {
    let canceled = false;
    (async () => {
      const candidateMeanings = await getCandidateMeanings(text);
      const questions = candidateMeanings.map(candidateMeaning => ({
        label: `${candidateMeaning.wordWithMeaningNumber}: ${candidateMeaning.definition}`,
        value: candidateMeaning.wordWithMeaningNumber
      }));

      if(!canceled) setQuestion(questions);
    })();

    return () => canceled = true
  }, []);

  useEffect(() => {
    if (answer !== null) {
      (async () => {
        const selectedWordWithMeaningNumber = answer.value;
        const [wordUsage, wordType] = await getWordUsageAndType(selectedWordWithMeaningNumber);
        const taggedWordUsage = await tagPOStoUsage(wordUsage);
        const taggedWord = await pickWordFromKoalaNLPTagResult(text, taggedWordUsage);
        const analyzedWord = await koalaNLPDTtoSKDT(taggedWord, wordType); // OK
        const inspectionResult = await inspectPhonologicalChangeOfWord(analyzedWord, phonologicalProcessPrecedence);

        setResult(<InspectResult inspectionResult={inspectionResult} base={text} />);
      })()
    }
  }, [answer]);

  if (result === null) {
    return (
      <>
        <Spinner />
        {
          question !== null
          && (<>
                <Text>단어의 의미를 결정해 주세요.</Text>
                <SelectInput items={question} onSelect={answer => (void setQuestion(null), setAnswer(answer))} />
              </>)
        }
      </>
    );
  } else return result;
}

export const Inspection = createPage(() => { //@FIXME: Wrong abstraction
  const {
    state: {
      inspectionMode: currentInspectionMode,
      automationLevel: currentAutomationLevel
    }
  } = useConfigurationState();

  return currentInspectionMode === inspectionMode.basic && currentAutomationLevel === automationLevel.high
  ? <BasicInspection />
  : <Redirect to='main' />;
}, 'Inspection', '/Inspection/:text');
