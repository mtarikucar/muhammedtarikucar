import React from 'react'
import Header from "../components/Header"
import Contact from "../components/Contact"
import Footer from "../layouts/Footer"
import Projects from "../components/Projects"
import Skills from "../components/Skills"

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