import React from 'react'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'ldrs/ring'
import 'react-toastify/dist/ReactToastify.css';
import { reuleaux } from 'ldrs'
import { dotWave } from 'ldrs'
import { jellyTriangle } from 'ldrs'
import { mirage } from 'ldrs'
mirage.register()
jellyTriangle.register()
dotWave.register()
reuleaux.register()


export default function Container() {
  return (
    <div className='h-full bg-gray-100 w-screen'> 
        <ToastContainer/>
        <Outlet/>
    </div> 
  )
}



// <l-jelly-triangle
//   size="30"
//   speed="1.75" 
//   color="black" 
// ></l-jelly-triangle>
