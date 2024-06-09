import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {Amplify} from "aws-amplify";
import awsmobile from "./utils/aws-exports";
import FetchInterceptors from "./utils/interceptor";

new FetchInterceptors();
Amplify.configure(awsmobile);
console.log(awsmobile);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App/>
);