
import { Routes, Route } from 'react-router-dom';
import './App.css'
import { Header } from './components/header/Header';
import Home from './components/Home/home';
import Register from './components/auth/register/Register';

import LoginForm from './components/auth/login/LoginForms';
import Layout from '@/components/layout'
import RequiredAuth from '@/components/RequiredAuth'
import Recommended from './components/recommended/Recommended';
import Review from './components/review/Review';
import StreamMovie from './components/stream/StreamMovie';

function App() {


  return (
    <div className='max-w-full'>
      <Header />
      <div className='max-w-[90%] mx-auto flex flex-col gap-2'>
      <Routes>
      <Route path="/" element={<Layout/>}>
         <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<LoginForm />} />
          <Route element={<RequiredAuth/>}>
          <Route path='/recommended' element={<Recommended/>}></Route>
          <Route path='/updatereview/:imdb_id' element={<Review/>}></Route>
          <Route path="/stream/:yt_id" element={<StreamMovie/>} ></Route>
          <Route path='/movie/:imdb_id'></Route>

          </Route>
          </Route>
      </Routes>
  </div>
   </div>
  )
}

export default App
