import React from 'react';
import ReactDOM from 'react-dom/client';

// Self-hosted fonts — no CDN latency
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';

import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    React.createElement(React.StrictMode, null,
        React.createElement(App, null)
    )
);
