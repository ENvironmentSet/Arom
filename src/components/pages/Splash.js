import React, { useEffect } from 'react';
import { useHistory } from 'react-router';

import BigText from 'ink-big-text';
import { Main } from './Main';

import { createPage } from './createPage';

export const Splash = createPage(({ duration }) => {
  const history = useHistory();

  useEffect(() => {
    const timeoutId = setTimeout(() => history.push(Main.path), duration);

    return () => clearTimeout(timeoutId);
  }, []);

  return <BigText text='AROM' />;
}, 'Splash', '*');
