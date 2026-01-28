import { Link } from "react-router";
import { LuLeaf, LuFlower  } from "react-icons/lu";
import plant1 from "../../assets/img/plant-1.png"
import plant2 from "../../assets/img/plant-2.png"
import leaf3 from "../../assets/img/leaf-3.png"


const AboutUs = () => {
  return (
    <div>
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
                             Make your <span className="text-yellow-500">organic</span>  <br/>
                             garden
                        </h3>
                        <p className='text-slate-200 font-Abel '>
                        Creating an organic garden is a rewarding way to grow fresh, chemical-free plants while promoting a healthier environment. By using natural compost, eco-friendly pest control, and sustainable watering methods, you can cultivate a thriving garden rich in nutrients. Whether you’re growing vegetables, herbs, or flowers, an organic approach ensures better soil health, biodiversity, and a greener future. Start your journey towards a self-sustaining, toxin-free garden with Pot Green today! 🌍✨
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
                                Come with us <br/>
                                <span className="text-yellow-500">grow up </span> 
                                your plant
                         </h3>
                         <p className='text-slate-200 font-Abel '>
                         Join Pot Green in creating a greener world! Whether you're a seasoned gardener or just starting, we provide the best plants, expert guidance, and smart tools to help your plants thrive. Let’s grow together and nurture nature—one plant at a time! 🌱💚
                         </p>
                     </div>
                 </div>
             </div>

             <div className='flex justify-center w-full'>
                <Link to="/about">
                <button className='btn btn-outline flex  '>
                Know More
                <LuLeaf />
                </button>
                </Link>
             </div>
            

        </div>
       
      </section>
    </div>
  )
}

export default AboutUs
