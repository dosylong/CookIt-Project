import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ColorModeScript } from '@chakra-ui/react';
import customTheme from './theme';

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={customTheme.config.initialColorMode} />
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
