import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { ConfirmDialogProvider } from './context/ConfirmDialogContext';
// import { ChakraProvider } from '@chakra-ui/react';
// import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
  <React.Fragment>
   <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    />
 
   <React.StrictMode>

    <BrowserRouter>
    {/* <ChakraProvider> */}
    <ThemeProvider>
      
    <ConfirmDialogProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    </ConfirmDialogProvider>
    </ThemeProvider>
    {/* </ChakraProvider> */}
    </BrowserRouter>
   </React.StrictMode>
  </React.Fragment>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
