import {React, useState} from "react";
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from "react-router-dom";
import ConnexionImage from '../../assets/connection.png';
import { useAuth } from "../../context/AuthContext";

export default function Connexion() {


    const navigate = useNavigate();
    const location = useLocation();

    



    const {loginMutation} = useAuth();   
    const [formData, setFormData] = useState({
        email:"",
        password:""
    });

    const handleChange = (e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }

    

    const handleSubmit = (e) => {
      e.preventDefault();
      if (loginMutation.isPending) return;

      loginMutation.mutate(formData);
    };


  return (
    <div className="min-h-screen w-full px-2 lg:py-2 text-xl flex items-center justify-center lg:bg-gray-100 bg-white">
      <div className='flex flex-col w-full text-center bg-white rounded-3xl shadow-lg lg:bg-white lg:shadow-xl md:flex md.items-center md.justify-center xl:w-3/4'>
        <div className='text-orange-500 font-bold text-2xl mt-4'>
            <h1>Connectez vous !!</h1>
        </div>
        <form onSubmit={handleSubmit}>
        <div className='lg:flex md:flex'>
          <div className='mx-auto lg:mx-0 lg:my-auto lg:w-1/2 lg:pt-8 p-3  md:w-2/3'>

            <div className='p-2 mb-2'>
              <input type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='Entrez votre email'
                className='input md:input-sm lg:input-sm w-full max-w-xs bg-gray-100'
              />
            </div>

            <div className='p-2 mb-2'>
              <input type='password'
                      name='password'
                      value={formData.password}
                      onChange={handleChange}
                      placeholder='Entrez votre mot de passe'
                      className='input md:input-sm lg:input-sm w-full max-w-xs bg-gray-100'
              />
              <div className="flex justify-end mr-6 p-3">
                <span className="text-sm font-bold text-red-400 hover:text-red-600"><Link to="/motdepasseoublier">mot de passe oublié?</Link></span>
              </div>
            </div>
            <div className='grid justify-items-center'>
                <button 
                  type='submit'
                  disabled={loginMutation.isPending}
                  className='btn px-8 py-2 text-lg btn-success hover:bg-green-700 text-white rounded-lg'>
                    {loginMutation.isPending ? "Connexion..." : "Se connecter"}
                </button>
            </div>
            <div className='text-sm w-full my-4'>
              <span>je n'ai pas de compte! </span>
              <span className='font-bold text-blue-400 hover:text-blue-700'><Link to="/Inscription">Creer un compte</Link></span>
            </div>
          </div>
          <div className='hidden lg:block lg:w-1/2'>
            <img src={ConnexionImage} alt="" className=" h-full" />
          </div>
        </div>
        </form>
      </div>
    </div>
  )
  
}

