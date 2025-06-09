import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import store from "./store/index";
import { persistor } from "./store/index";

import "./index.css";
import "./i18n"; // Initialize i18n
import App from "./App";

const queryClient = new QueryClient();

import { ThemeProvider } from "@material-tailwind/react";
import { materialTailwindTheme } from "./theme";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <Router>
      <Provider store={store}>
        <ThemeProvider value={materialTailwindTheme}>
          <PersistGate loading={null} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </PersistGate>
        </ThemeProvider>
      </Provider>
    </Router>
  </>
);
