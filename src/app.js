import React, { useMemo } from 'react';
import { render } from 'ink';
import { MemoryRouter, Switch, Route } from 'react-router';
import { Provider } from './configuration/context';

import { Main } from './components/pages/Main';
import { Configuration } from './components/pages/Configuration';
import { Inspection } from './components/pages/Inspection';
import { Exit } from './components/pages/Exit';
import { Splash } from './components/pages/Splash';

import { useProfunctorState } from '@staltz/use-profunctor-state';

import { inspectionMode } from './configuration/inspectionMode';
import { automationLevel } from './configuration/automationLevel';
import { phonologicalRule } from './configuration/phonologicalRule';

import { initialize } from 'koalanlp/Util';

function App() {
  const initialConfiguration = useMemo(() => ({
    inspectionMode: inspectionMode.basic,
    automationLevel: automationLevel.high,
    phonologicalProcessPrecedence: [
      //phonologicalRule['두음 법칙'],// not yet
      phonologicalRule['격음화'],
      phonologicalRule['ㄴ 첨가'],
      phonologicalRule['평 파열음화'],
      phonologicalRule['경음화'],
      phonologicalRule['자음군 단순화'],
      phonologicalRule['비음화'],
      phonologicalRule['유음화'],
      phonologicalRule['구개음화'],
      //phonologicalRule['모음 탈락'],
      phonologicalRule['반모음 첨가'],
    ]
  }), []);
  const configurationState = useProfunctorState(initialConfiguration);

  return (//@TODO: Render methods vs children.
    <Provider value={configurationState}>
      <MemoryRouter>
        <Switch>
          <Route path={Main.path} component={Main} />
          <Route path={Configuration.path} component={Configuration} />
          <Route path={Inspection.path} component={Inspection} />
          <Route path={Exit.path} component={Exit} />
          <Route path={Splash.path} render={() => <Splash duration={1500} />} />
        </Switch>
      </MemoryRouter>
    </Provider>
  );
}

initialize({ packages: { EUNJEON: 'LATEST' } }).then(() => (console.clear(), render(<App />)));
