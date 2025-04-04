import {React, useState } from "react";
import axios from '../../context/api'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import Inscriptionimage from '../../assets/register.png'

export default function Inscription() {

    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        first_name:"",
        password1: "",
        password2: ""
    });

    const handleChange = (e) =>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
      }

      const handleSubmit = async (e) => {
        e.preventDefault();
            if(isLoading){
                return
          }
    
          setIsLoading(true);
    
          try{
              const response = await axios.post(`/register/`, formData)
              toast.success("Vous avez été enregistré!!")
              navigate('/Connexion')
    
          }catch(error){
                //console.log(error.response.data)
                if(error.response && error.response.data){
                  Object.keys(error.response.data).forEach(field => {
                    const err = error.response.data[field]
                    

                    if(err && err.length > 0){
                      if(err[0].includes("email")){
                        toast.error("Cet email est déjà utilisé!!")
                      }else if(err[0].includes("phone")){
                        toast.error("Ce numéro de téléphone est déjà utilisé!!")
                      }else{
                        toast.error(`${err[0]}`)
                      }
                    }
                  })
                }
    
          }finally{
            setIsLoading(false);
          }
    }


  return (
    <div className="min-h-screen w-full px-2 lg:py-2 text-xl flex items-center justify-center lg:bg-gray-100 bg-white">
    <div className='flex flex-col w-full text-center bg-white rounded-3xl shadow-lg lg:bg-white lg:shadow-xl md:flex md.items-center md.justify-center xl:w-3/4'>
      <div className='text-orange-500 font-bold text-2xl mt-4'>
        < h1>Inscrivez vous !!</h1>
      </div>
      <div className="lg:flex">
        <div className='mx-auto lg:mx-0 lg:my-auto lg:w-1/2 lg:pt-8 p-3 md:w-2/3'>
          <div className='py-2 mb-2'>
            <input type='text'
              placeholder='Entrez votre nom'
              name='first_name'
              value={formData.first_name}
              onChange={handleChange}
              className='input md:input-sm lg:input-sm w-full max-w-xs bg-gray-100'
            />
          </div>

          <div className='py-2 mb-2'>
            <input type='text'
              maxLength={9}
              placeholder='Entrez votre telephone'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              className='input md:input-sm lg:input-sm w-full max-w-xs bg-gray-100'
            />
          </div>

          <div className='py-2 mb-2'>
            <input type='email'
              placeholder='Entrez votre email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='input md:input-sm lg:input-sm w-full max-w-xs bg-gray-100'
            />
          </div>

          <div className='py-2 mb-2'>
            <input type='password'
              placeholder='Entrez votre mot de passe'
              name='password1'
              value={formData.password1}
              onChange={handleChange}
              className='input md:input-sm lg:input-sm w-full max-w-xs bg-gray-100'
            />
          </div>

          <div className='py-2 mb-3 w-full'>
            <input type='password'
              placeholder='Confirmez votre mot de passe'
              name='password2'
              value={formData.password2}
              onChange={handleChange}
              className='input md:input-sm lg:input-sm w-full max-w-xs bg-gray-100'
            />
          </div>

          <div className='grid justify-items-center'>
            <button 
              type='submit'
              onClick={handleSubmit}
              disabled={isLoading}
              className='btn px-8 py-2 text-lg btn-success hover:bg-green-700 text-white rounded-lg'>S'inscrire
            </button>
          </div>

          <div className='text-sm w-full my-4'>
            <span>j'ai deja un compte. </span>
            <span className='font-bold text-blue-400 hover:text-blue-600 text-lg'><Link to="/Connexion">se connecter</Link></span>
          </div>
        </div>
        <div className='hidden lg:block lg:w-1/2'>
          <img src={Inscriptionimage} alt="" className="h-full" />
        </div>
      </div>
    </div>
  </div>
  )
}
