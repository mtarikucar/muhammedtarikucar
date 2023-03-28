import React from 'react'
import Header from "../components/Portfolio/Header"
import Contact from "../components/Portfolio/Contact"
import Footer from "../layouts/Footer"
import Projects from "../components/Portfolio/Projects"
import Skills from "../components/Portfolio/Skills"

function Portfolio() {
  return (
    <>
     <Header/> 
     <Skills/> 
     <Projects/>
     <Contact/>
     <Footer/>
    </>
  )
}

export default Portfolio