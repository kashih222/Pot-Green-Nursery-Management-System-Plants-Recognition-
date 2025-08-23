import React from 'react'
import { LuLeaf, LuFlower } from "react-icons/lu";
import { FaWhatsapp, FaMapMarkerAlt, FaInstagram, FaLeaf } from "react-icons/fa";
import { PiPottedPlantBold } from "react-icons/pi";
import { Link } from "react-router";

const Home = () => {
  return (
    <div>
      <section id='home' className='relative sm:mt-8'>
        <div className='container '>
          {/* blobs */}
          <div className='w-64 h-64 bg-green-700 rounded-full blur-3xl -z-10 
            opacity-40 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 '>
          </div>

          {/* blobs 2*/}
          <div className='w-64 h-64 bg-green-700 rounded-full blur-3xl -z-10 
            opacity-40 absolute right-0 bottom-0  '>
          </div>

          <div className='flex flex-col items-center gap-5 lg:flex-row'>
            {/* content */}
            <div className='w-full space-y-5 lg:w-1/2 '>
              <h1>
                <span className="text-yellow-500">Plants</span> make a <br />
                positive
                <span className="text-yellow-500"> impact</span> on <br />
                your environment
              </h1>

              <p className='text-slate-200 font-Abel'>Plants are essential for a healthier and greener world. They purify the air, reduce pollution, and create a refreshing atmosphere. By growing more plants, you contribute to a sustainable environment, improve biodiversity, and enhance well-being. Start your green journey with Pot Green and make a positive difference today! 🌱✨
              </p>

              <div className=' flex flex-col gap-2 sm:flex-row md:gap-4 lg:pt-5 xl:pt-10 '>
                <Link to="/plants">
                  <button className='btn flex '>
                    <span>Shop Now  </span>
                    <LuLeaf />
                  </button>
                </Link>

                <Link to="/about">
                  <button className='btn btn-outline flex  '>
                    <span>Know More</span>
                    <LuLeaf />
                  </button>
                </Link>
              </div>

              <div className='flex items-center gap-5 text-lg lg:pt-10'>
                <a
                  href="https://www.instagram.com/pot_green_nursery/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram className="text-slate-200 hover:text-yellow-500 duration-300 cursor-pointer" />
                </a>

                <a
                  href="https://wa.me/923009103776 "
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp className="text-slate-200 hover:text-yellow-500 duration-300 cursor-pointer" />
                </a>

                <a
                  href="https://www.google.com/maps/place/Pot+Green+Nursery+Farm%D9%BE%D8%A7%D9%B9+%DA%AF%D8%B1%DB%8C%D9%86+%D9%86%D8%B1%D8%B3%D8%B1%DB%8C%E2%80%AD/@31.4717049,74.4282099,17z/data=!3m1!4b1!4m6!3m5!1s0x3919097fe94c25db:0x8b30cc9a34ac9a02!8m2!3d31.4717049!4d74.4282099!16s%2Fg%2F11ll9sxmsj?entry=ttu&g_ep=EgoyMDI1MDgxNy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaMapMarkerAlt className="text-slate-200 hover:text-yellow-500 duration-300 cursor-pointer" />
                </a>
              </div>
            </div>
            {/* Images */}
            <div className='w-full relative sm:mt-10 lg:w-[40%] '>
              <img src="src/assets/img/home.png" alt="Home" />
              {/* flower */}
              <div className='absolute -top-10 right-0 opacity-30 animate-movingY '>
                <LuFlower className='text-6xl text-yellow-500' />
              </div>
              {/* leaf */}
              <div className='absolute bottom-0 left-0 opacity-30 xl:bottom-12 animate-rotating'>
                <FaLeaf className='text-6xl text-yellow-500' />
              </div>
              {/* pot */}
              <div className='absolute -top-8 -left-5 opacity-30 hidden lg:block animate-scalingUp'>
                <PiPottedPlantBold className='text-6xl text-yellow-500' />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
