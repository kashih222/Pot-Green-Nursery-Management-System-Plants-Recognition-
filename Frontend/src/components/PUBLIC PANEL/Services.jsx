import React from 'react'
import { FaTruck, FaHeadphones } from "react-icons/fa";
import { PiPottedPlantBold } from "react-icons/pi";
import { GrMoney } from "react-icons/gr";
import { LuLeaf  } from "react-icons/lu";
import { Link } from "react-router";

const Services = () => {
  return (
    <div className='bg-white text-green-900 py-16'>

        <div className='container w-full grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 '>
            
            {/* card1 */}
            <div className='border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
             hover:-translate-y-1 duration-300 space-y-5'>
                <div className='flex items-center gap-5 '>
                    <FaTruck className='text-3xl md:text-4xl xl:text-5xl ' />
                    <p className='md:text-lg font-bold '>Fast <br/>
                    Delivery</p>
                </div>
                <p className='font-Jost'>At Pot Green, we ensure quick and reliable delivery so you can enjoy fresh, healthy plants without any delays. Our efficient logistics guarantee that your plants arrive in perfect condition, ready to brighten your space. Order now and experience hassle-free, fast delivery! 🌱✨</p>
            </div>
              {/* card2 */}
              <div className='border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
               hover:-translate-y-1 duration-300 space-y-5'>
                  <div className='flex items-center gap-5 '>
                      <FaHeadphones className='text-3xl md:text-4xl xl:text-5xl ' />
                      <p className='md:text-lg font-bold '>Great Customer <br/>
                      Service</p>
                  </div>
                  <p className='font-Jost'>At Pot Green, we are committed to providing exceptional customer service. Whether you need plant care advice, order assistance, or product recommendations, our friendly team is always ready to help. Your happiness is our priority—because every plant and every customer matters! 🌿😊</p>
              </div>

                {/* card3 */}
                <div className='border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
               hover:-translate-y-1 duration-300 space-y-5'>
                  <div className='flex items-center gap-5 '>
                      <PiPottedPlantBold  className='text-3xl md:text-4xl xl:text-5xl ' />
                      <p className='md:text-lg font-bold '>Original <br/>
                      Plants</p>
                  </div>
                  <p className='font-Jost'>At Pot Green, we take pride in offering only authentic, high-quality plants sourced from trusted growers. Our plants are carefully nurtured to ensure they thrive in your home or garden. Shop with confidence and bring home the best, naturally! 🌱✨</p>
              </div>

                {/* card4 */}
                <div className='border border-green-900 p-5  cursor-pointer rounded-md hover:shadow-2xl
               hover:-translate-y-1 duration-300 space-y-5'>
                  <div className='flex items-center gap-5 '>
                      <GrMoney className='text-3xl md:text-4xl xl:text-5xl ' />
                      <p className='md:text-lg font-bold '>Affordable <br/>
                      Price</p>
                  </div>
                  <p className='font-Jost'>At Pot Green, we believe that everyone should have access to beautiful, healthy plants without breaking the bank. Our wide range of plants comes at budget-friendly prices, ensuring you get the best quality at the best value. Start your green journey today—affordably! 🌱✨</p>
              </div>



        </div>
        <div className='flex justify-center w-full mt-10'>
           <Link to="/services">
           <button className='btn btn-outline flex  '>
           Know More
            <LuLeaf />
            </button>
           </Link>
        </div>
    </div>
  )
}

export default Services
