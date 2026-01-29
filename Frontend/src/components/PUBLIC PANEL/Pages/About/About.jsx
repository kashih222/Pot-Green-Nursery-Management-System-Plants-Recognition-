import plant1 from "../../../../../public/img/plant-1.png"
import plant2 from "../../../../../public/img/plant-2.png"
import leaf3 from "../../../../../public/img/leaf-3.png"
import { Helmet } from "react-helmet-async"
const About = () => {
  return (
    <div className="sm:mt-36 md:mt-10">
        <Helmet>
          <title> About | Pot Green Nursery</title>
        </Helmet>
      <section id='about' className='relative overflow-hidden bg-green-950'>
        <div className='absolute -top-8 -right-12 opacity-50 '>
            <img src={leaf3} alt="leaf3_image" className='w-40 md:w-52 xl:w-64 ' />
        </div>
        <div className='flex flex-col items-center gap-3 text-center mb-10 md:mb-20 font-Jost'>
            <h2 className='tittle'>About Us</h2>
            <p className='max-w-2xl '>Follow instruction for more</p>
        </div>

        <div className='container space-y-10 xl:space-y-0 '>
            {/* item1 */}
            <div className='flex flex-col items-center lg:flex-row gap-5 '>
                {/* image */}
                <div className='w-full lg:w-1/2 '>
                    <img src={plant1} alt="About-image" className='w-full sm:w-2/3 lg:w-full xl:w-2/3 mx-auto ' />
                </div>

                {/* content */}
                <div className='w-full lg:w-1/2 '>
                    <div className='space-y-5 '>
                        <h3>
                             Welcome to <span className="text-yellow-500">Pot Green</span>  <br/>
                             Your Trusted Nursery
                        </h3>
                        <p className='text-slate-200 font-Abel '>
                        At Pot Green, we are passionate about plants and dedicated to making plant care easier, smarter, and more efficient. As a leading digital plant nursery, we offer a wide variety of plants, gardening essentials, and an AI-powered plant recognition system to help customers identify and care for their plants effortlessly.
                        </p>
                    </div>
                </div>
            </div>

             {/* item2 */}
             <div className='flex flex-col items-center gap-5 lg:flex-row-reverse'>
                 {/* image */}
                 <div className='w-full lg:w-1/2 '>
                     <img src={plant2} alt="About-image" className='w-full sm:w-2/3 lg:w-full xl:w-2/3 mx-auto ' />
                 </div>
                 {/* content */}
                 <div className='w-full lg:w-1/2 '>
                     <div className='space-y-5 '>
                         <h3>
                          Who
                                <span className="text-yellow-500"> We Are</span> 
                               
                         </h3>
                         <p className='text-slate-200 font-Abel '>
                         Pot Green is more than just a nursery—it’s a tech-driven platform designed to modernize the way nurseries operate and how people interact with plants. Whether you are a plant enthusiast, a gardener, or a nursery owner, our innovative system provides a seamless experience in managing, identifying, and purchasing plants.
                         </p>
                     </div>
                 </div>
             </div>

            {/* item3 */}
            <div className='flex flex-col items-center lg:flex-row gap-5 '>
                {/* image */}
                <div className='w-full lg:w-1/2 '>
                    <img src={plant1} alt="About-image" className='w-full sm:w-2/3 lg:w-full xl:w-2/3 mx-auto ' />
                </div>

                {/* content */}
                <div className='w-full lg:w-1/2 '>
                    <div className='space-y-5 '>
                        <h3>
                          Our<span className="text-yellow-500"> Mission</span>  <br/>
                             
                        </h3>
                        <p className='text-slate-200 font-Abel '>
                        Our mission is to combine nature with technology to create a smarter, more sustainable way to manage nurseries and provide customers with accurate, AI-powered plant recognition. We aim to make plant care accessible to everyone, from beginners to experienced gardeners.
                        </p>
                    </div>
                </div>
            </div>

            {/* item4 */}
            <div className='flex flex-col items-center gap-5 lg:flex-row-reverse'>
                 {/* image */}
                 <div className='w-full lg:w-1/2 '>
                     <img src={plant2} alt="About-image" className='w-full sm:w-2/3 lg:w-full xl:w-2/3 mx-auto ' />
                 </div>
                 {/* content */}
                 <div className='w-full lg:w-1/2 '>
                     <div className='space-y-5 '>
                         <h3>
                                Why Choose 
                                <span className="text-yellow-500"> Pot Green</span> 
                                ?  
                         </h3>
                         <p className='text-slate-200 font-Abel '>
                             🌿 Technology Meets Nature – We bring innovation into plant management and identification. <br />
                            🌿 Customer-Centric Service – We prioritize quality and convenience for plant lovers and nursery owners. <br />
                            🌿 Sustainability Focused – Encouraging green living through responsible and eco-friendly gardening solutions. <br/>
                            Join us at Pot Green as we nurture a greener future, one plant at a time! 🌱✨
                         </p>
                         <hr className='my-2' />
                     </div>
                 </div>
             </div>



        </div>
      </section>
    </div>
  )
}

export default About
