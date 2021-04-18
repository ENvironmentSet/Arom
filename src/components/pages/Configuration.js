import React, { useMemo, useCallback } from 'react';
import { Route, Switch, useHistory } from 'react-router';
import { useConfigurationState } from '../../configuration/context';
import { Text, useInput } from 'ink';

import SelectInput from 'ink-select-input/build';

import { createPage } from './createPage';

import { inspectionMode } from '../../configuration/inspectionMode';
import { automationLevel } from '../../configuration/automationLevel';

function InspectionModeConfiguration() {
  const { state: currentInspectionMode, setState: setInspectionMode } =
    useConfigurationState()
      .promap(
        ({ inspectionMode }) => inspectionMode,
        (inspectionMode, config) => ({ ...config, inspectionMode })
      );
  const history = useHistory();
  const configItems = useMemo(() => [
    { label: '기본 분석', value: inspectionMode.basic },
    // { label: '완전 분석', value: inspectionMode.complete }, // not for now
    { label: '보조 분석', value: inspectionMode.assistant },
    { label: '뒤로가기', value: 'prev' } //@FIXME: Terrible Idea.
  ], []);
  const onSelect = useCallback( //@FIXME: Terrible Idea.
    ({ value }) => value === 'prev' ? history.goBack() : setInspectionMode(value),
    []
  );

  return (
    <>
      <Text>분석 모드를 설정하세요</Text>
      <Text>현재 모드는: {currentInspectionMode} 분석 입니다.</Text>
      <SelectInput items={configItems} onSelect={onSelect} />
    </>
  );
}

function AutomationLevelConfiguration() {
  const { state: currentAutomationLevel, setState: setAutomationLevel } =
    useConfigurationState()
      .promap(
        ({ automationLevel }) => automationLevel,
        (automationLevel, config) => ({ ...config, automationLevel })
      );
  const history = useHistory();
  const configItems = useMemo(() => [
    { label: automationLevel.high, value: automationLevel.high },
    // { label: automationLevel.normal, value: automationLevel.normal }, // not for now
    { label: automationLevel.low, value: automationLevel.low },
    { label: '뒤로가기', value: 'prev' } //@FIXME: Terrible Idea.
  ], []);
  const onSelect = useCallback(
    ({ value }) => value === 'prev' ? history.goBack() : setAutomationLevel(value),
    []
  ); //@FIXME: Terrible Idea.

  return (
    <>
      <Text>작업의 자동화 수준을 설정하세요.</Text>
      <Text>현재 자동화 수준: {currentAutomationLevel}</Text>
      <SelectInput items={configItems} onSelect={onSelect} />
    </>
  );
}

function PhonologicalProcessPrecedenceConfiguration() { //@TODO: Add this feature
  const history = useHistory();
  useInput(() => history.goBack());

  return (
    <>
      <Text>아직 지원하지 않는 기능입니다.</Text>
      <Text>아무 키나 눌러 뒤로 돌아가세요.</Text>
    </>
  );
}

export const Configuration = createPage(() => {
  const history = useHistory();
  const configItems = useMemo(() => [
    { label: '분석 모드', value: `${Configuration.path}/inspectionMode` },
    { label: '자동화 정도', value: `${Configuration.path}/automationLevel` },
    { label: '음운 변동 우선 순위', value: `${Configuration.path}/phonologicalProcessPrecedence` },
    { label: '뒤로가기', value: 'prev' } //@FIXME: Terrible Idea.
  ], []);
  const transit = useCallback(({ value }) => value === 'prev' ? history.goBack() : history.push(value), []);

  return (//@TOOD: make everything page?, need consideration about path.
    <Switch>
      <Route path={`${Configuration.path}/inspectionMode`} component={InspectionModeConfiguration} />
      <Route path={`${Configuration.path}/automationLevel`} component={AutomationLevelConfiguration} />
      <Route path={`${Configuration.path}/phonologicalProcessPrecedence`} component={PhonologicalProcessPrecedenceConfiguration} />
      <Route exact path={Configuration.path}>
        <Text>설정할 옵션을 골라 주세요.</Text>
        <SelectInput items={configItems} onSelect={transit} />
      </Route>
    </Switch>
  );
}, 'Configuration');
