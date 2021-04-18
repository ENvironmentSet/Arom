import React, { useEffect } from 'react';
import { Text, useApp } from 'ink';

import { createPage } from './createPage';

export const Exit = createPage(function Exit() {
  const { exit } = useApp();

  useEffect(exit, []);

  return <Text italic>안녕히 가세요!</Text>;
}, 'Exit');
