import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
            <Toaster
                position="top-right"
                containerStyle={{
                    zIndex: 10001,
                }}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'var(--color-bg-elevated)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-4)',
                    },
                    success: {
                        iconTheme: {
                            primary: 'var(--color-success)',
                            secondary: 'var(--color-bg-elevated)',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: 'var(--color-error)',
                            secondary: 'var(--color-bg-elevated)',
                        },
                    },
                }}
            />
        </BrowserRouter>
    </React.StrictMode>
);
