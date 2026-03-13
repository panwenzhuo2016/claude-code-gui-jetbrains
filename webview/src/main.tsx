import 'reflect-metadata';
import { initLogForwarder } from './api/logging';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 가능한 한 빨리 초기화하여 초기 로그도 캡처
initLogForwarder();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
