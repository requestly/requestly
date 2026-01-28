import React from 'react';
import './pre-imports';
import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { reduxStore } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { HotkeysProvider } from 'react-hotkeys-hook';

import './init';
import './assets/less/index.less';
import './styles/custom/custom.scss';

import PageError from 'components/misc/PageError';
import { CONSTANTS as GLOBAL_CONSTANTS } from '@requestly/requestly-core';
import { getAppFlavour } from 'utils/AppUtils';
import App from './App';
import SessionBearApp from 'src-SessionBear/App';
import { appendRadixRootDiv } from 'features/apiClientV2/utils/radixRootDiv';

const persistor = persistStore(reduxStore);
const container = document.getElementById('root');
const root = createRoot(container);
const appFlavour = getAppFlavour();

// Initialize Radix portal container for BrowserStack Design System
appendRadixRootDiv();

/* Google translate replaces textNodes from the DOM  with <font> tag
  Beacuse of this, React throws error when re-rednering the component
  This is a workaround to fix the issue


  It overrides the removeChild and insertBefore methods of Node.prototype if the child's parentNode is not the same as the current node. This patch swallows the error and return the child node.

  This is a workaround to fix the issue
*/

if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

root.render(
  <Provider store={reduxStore}>
    <PersistGate loading={null} persistor={persistor}>
      <Sentry.ErrorBoundary
        fallback={({ error, componentStack, resetError }) => (
          <PageError
            error={error}
            componentStack={componentStack}
            resetError={resetError}
          />
        )}
        showDialog
        beforeCapture={(scope) => {
          scope.setTag('errorType', 'app');
        }}
      >
        <HotkeysProvider>
          {appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR ? (
            <SessionBearApp />
          ) : (
            <App />
          )}
        </HotkeysProvider>
      </Sentry.ErrorBoundary>
    </PersistGate>
  </Provider>
);
