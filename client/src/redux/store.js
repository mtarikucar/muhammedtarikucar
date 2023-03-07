import {configureStore} from "@reduxjs/toolkit"
import languageReducer from "./Language/languageSlice"
export const store = configureStore({
    reducer: {
        language: languageReducer
    }
})