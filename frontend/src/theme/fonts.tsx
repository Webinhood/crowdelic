import { Global } from '@emotion/react';
import React from 'react';

const Fonts = () => (
  <Global
    styles={`
      @font-face {
        font-family: 'Hubot Sans';
        src: url('/src/theme/fonts/HubotSans-Light.woff2') format('woff2');
        font-weight: 300;
        font-style: normal;
        font-display: swap;
        font-named-instance: 'Light';
      }

      @font-face {
        font-family: 'Hubot Sans';
        src: url('/src/theme/fonts/HubotSans-Regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        font-named-instance: 'Regular';
      }

      @font-face {
        font-family: 'Hubot Sans';
        src: url('/src/theme/fonts/HubotSans-SemiBold.woff2') format('woff2');
        font-weight: 600;
        font-style: normal;
        font-display: swap;
        font-named-instance: 'SemiBold';
      }

      @font-face {
        font-family: 'Hubot Sans';
        src: url('/src/theme/fonts/HubotSans-Bold.woff2') format('woff2');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
        font-named-instance: 'Bold';
      }

      body {
        font-family: 'Hubot Sans', sans-serif;
      }
    `}
  />
);

export default Fonts;
