import React, { useState, useMemo, useCallback } from 'react';
import { useHistory } from 'react-router';

import SelectInput, { Item } from 'ink-select-input';
import { Text } from 'ink';
import { Inspection } from './Inspection';
import { Configuration } from './Configuration';
import { Exit } from './Exit';
import TextInput from 'ink-text-input';

import { createPage } from './createPage';

export const Main = createPage(function Main() {
  const history = useHistory();
  const [text, setText] = useState('');
  const pages = useMemo(() => [ //@TODO: Are this need to be abstracted? by enum or something?
    { label: '음운 변동 분석', value: `Inspection/${text}` }, //@FIXME: Wrong inspection path
    { label: '설정', value: Configuration.path },
    { label: '나가기', value: Exit.path },
  ], [text]);
  const transit = useCallback(({ value }) => history.push(value), []);
  //@TODO: Abstract this / decouple Inspection-related code
  const CustomItemComponent = useCallback(({ label, isSelected }) => {
    if (label === '음운 변동 분석' && isSelected) {
      return (
        <>
          <Text>단어나 문장의 음운 변동 분석하기: </Text>
          <TextInput value={text} onChange={setText} />
        </>
      );
    }
    else return <Item label={label} isSelected={isSelected} />;
  }, [text]);

  return (
    <>
      <Text>아롬, 한국어 음운 변동 분석기</Text>
      <Text>원하시는 작업을 선택해 주세요.</Text>
      <SelectInput items={pages} onSelect={transit} itemComponent={CustomItemComponent} />
    </>
  );
}, 'Main');
