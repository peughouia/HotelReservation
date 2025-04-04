import React from 'react'
import { Link } from 'react-router-dom'
import explorer from '../assets/home.png'
import { useAuth } from '../context/AuthContext'
import favorite from '../assets/favorite.png'
import connexion from '../assets/users.png'
import logouticon from '../assets/logout.png'

export default function Floatbottombar() {
    const token = localStorage.getItem("accessToken")
    const { user, logout } = useAuth()
  return (
        <div  
        className="justify-around border flex w-5/6 fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-85  px-6 py-2 rounded-full shadow-lg">
        <button className="flex flex-col items-center  p-1">
          <img src={explorer} className="w-6 h-6" alt="Logo" />
          <span className="text-sm">Explorer</span>
        </button>
        <button className="flex flex-col items-center p-1">
            <img src={favorite} className="w-6 h-6" alt="Logo" />
          <span className="text-sm">Favories</span>
        </button>
        {token? (
            
            <div className='flex space-x-5'>

            <Link to="/moncompte"  className="flex flex-col items-center p-1">
            <img src={connexion} className="w-6 h-6" alt="Logo" />
            <span className="text-sm">Compte</span>
            </Link>


            <button onClick={logout} className="lg:hidden xl:hidden flex flex-col items-center p-1">
            <img src={logouticon} className="w-6 h-6" alt="Logo" />
            <span className="text-sm">logout</span>
            </button>

            
            </div>

            
        ):(
            <Link to={"/Connexion"} className="flex flex-col items-center p-1">
            <img src={connexion} className="w-6 h-6" alt="Logo" />
            <span className="text-sm">Connexion</span>
        </Link>
        )}
        
      </div>
  )
}
