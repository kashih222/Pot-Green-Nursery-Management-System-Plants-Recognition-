import { IoIosStar, IoIosStarHalf, IoIosStarOutline } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { LuLeaf, LuFlower  } from "react-icons/lu";
import { Link } from "react-router";

const Popular = () => {
  return (
    <div>
      <section id='popular' className='bg-green-900'>
            <div className='flex flex-col items-center gap-3 text-center mb-40 ' >
                <h2 className='tittle'>Your Choice Plant</h2>
                <p className='max-w-2xl '>Follow instruction for more</p>
            </div>

            <div className='container w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-36 '>
                {/* card_1 */}
                <div className=' popular__card bg-green-950 p-10 pt-24 rounded-md relative  '>
                    <img src="src/assets/img/cart-1.png" alt="popular_img" className='w-56 absolute -top-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2'/>

                    <p>Nephrolepis exaltata</p>
                    <h3>Boston Fern</h3>

                    <div className='flex text-yellow-500 text-xs py-3'>
                        <IoIosStar />
                        <IoIosStar />
                        <IoIosStarHalf />
                        <IoIosStarOutline className='text-gray-400'/>
                        <IoIosStarOutline className='text-gray-400'/>
                    </div>

                    <div className='flex items-center justify-between '>
                        <p className='text-xl'>Rs 2,580/-</p>
                        
                    </div>
                </div>

                {/* card_2 */}
                <div className=' popular__card bg-green-950 p-10 pt-24 rounded-md relative '>
                     <img src="src/assets/img/cart-2.png" alt="popular_img" className='w-56 absolute -top-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2'/>
                     <p>Ficus elastica</p>
                     <h3>Rubber Plant</h3>
                     <div className='flex text-yellow-500 text-xs py-3'>
                         <IoIosStar />
                         <IoIosStar />
                         <IoIosStarHalf />
                         <IoIosStarOutline className='text-gray-400'/>
                         <IoIosStarOutline className='text-gray-400'/>
                     </div>
                     <div className='flex items-center justify-between '>
                         <p className='text-xl'>Rs 6,000/-</p>
                         
                     </div>
                 </div>

                 {/* card_3 */}
                 <div className=' popular__card bg-green-950 p-10 pt-24 rounded-md relative '>
                     <img src="src/assets/img/cart-3.png" alt="popular_img" className='w-56 absolute -top-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2'/>
                     <p>Spathiphyllum wallisii</p>
                     <h3>Peace Lily</h3>
                     <div className='flex text-yellow-500 text-xs py-3'>
                         <IoIosStar />
                         <IoIosStar />
                         <IoIosStarHalf />
                         <IoIosStarOutline className='text-gray-400'/>
                         <IoIosStarOutline className='text-gray-400'/>
                     </div>
                     <div className='flex items-center justify-between '>
                         <p className='text-xl'>Rs 2,500/-</p>
                         
                     </div>
                 </div>

                   {/* card_4 */}
                 <div className=' popular__card bg-green-950 p-10 pt-24 rounded-md relative '>
                     <img src="src/assets/img/cart-4.png" alt="popular_img" className='w-56 absolute -top-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2'/>
                     <p>Adenium obesum</p>
                     <h3>Desert Rose</h3>
                     <div className='flex text-yellow-500 text-xs py-3'>
                         <IoIosStar />
                         <IoIosStar />
                         <IoIosStarHalf />
                         <IoIosStarOutline className='text-gray-400'/>
                         <IoIosStarOutline className='text-gray-400'/>
                     </div>
                     <div className='flex items-center justify-between '>
                         <p className='text-xl'>Rs 1,500/-</p>
                         
                     </div>
                 </div>
                 
            </div>
            <div className='mt-10 flex justify-center items-center'>
                <Link to="/plants">
                <button className='btn flex '>
                    <span>Shop Now  </span>
                    <LuLeaf />
                </button>
                </Link>
            </div>
      </section>
    </div>
  )
}

export default Popular
