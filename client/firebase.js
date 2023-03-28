// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHxCqgj6gU29xnbd8dy_T-P7Ps-ITScL4",
  authDomain: "muhammedtarikucar777.firebaseapp.com",
  projectId: "muhammedtarikucar777",
  storageBucket: "muhammedtarikucar777.appspot.com",
  messagingSenderId: "473429973669",
  appId: "1:473429973669:web:a58ecfff16b530afb3cb4c",
  measurementId: "G-K31901X12J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app 