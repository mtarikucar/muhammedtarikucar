import Home from './pages/Home'
import Blog from './pages/Blog';
import Portfolio from './pages/Portfolio'

import React from 'react'
import { Routes, Route, Link, NavLink } from "react-router-dom";

function App() {
  return (
    <>
     <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/Blog" element={<Blog />}/>

            
            <Route path="/Portfolio" element={<Portfolio />}/>



          </Routes>
    </>
  )
}

export default App