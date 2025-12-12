import { CiPaperplane } from "react-icons/ci";
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt, FaLeaf } from "react-icons/fa";
import { Link } from "react-router";

const Footer = () => {
    return (
        <div>
            <section id='footer' className='bg-yellow-100 text-green-950 pt-20 pb-10 md:pt-28 relative border-t-2 border-yellow-500'>
                {/* newsleter */}


                {/* social-icons */}
                <div className='container mt-16 mb-10'>
                    <div className='border-b border-green-500 relative'>
                        <div className='absolute top-0 transform -translate-y-1/2 left-0 right-0 max-w-36 mx-auto'>
                            <div className='bg-yellow-100 text-lg text-center space-x-2 flex items-center justify-center'>
                                <a
                                    href="https://www.instagram.com/pot_green_nursery/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaInstagram className="text-green-950 hover:text-yellow-500 duration-300 cursor-pointer" />
                                </a>

                                <a
                                    href="https://wa.me/923009103776"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaWhatsapp className="text-green-950 hover:text-yellow-500 duration-300 cursor-pointer" />
                                </a>

                                <a
                                    href="https://www.google.com/maps/place/Pot+Green+Nursery+Farm%D9%BE%D8%A7%D9%B9+%DA%AF%D8%B1%DB%8C%D9%86+%D9%86%D8%B1%D8%B3%D8%B1%DB%8C%E2%80%AD/@31.4717049,74.4282099,17z/data=!3m1!4b1!4m6!3m5!1s0x3919097fe94c25db:0x8b30cc9a34ac9a02!8m2!3d31.4717049!4d74.4282099!16s%2Fg%2F11ll9sxmsj?entry=ttu&g_ep=EgoyMDI1MDgxNy4wIKXMDSoASAFQAw%3D%3D"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaMapMarkerAlt className="text-green-950 hover:text-yellow-500 duration-300 cursor-pointer" />
                                </a>

                            </div>
                        </div>
                    </div>
                </div>
                {/* content */}
                <div className='container grid grid-col1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 text-center md:text-start '>
                    {/* item-1 */}
                    <div>
                        <div className='text-7xl text-green-700 text-center inline-block '>
                            <FaLeaf />
                            <p className='font-Jost text-xl sm:text-2xl '>Plants.</p>

                        </div>
                    </div>
                    {/* item-2 */}
                    <div>
                        <p className='mb-5 font-bold text-xl '>Quick Links</p>
                        <div className=' flex flex-col gap-1 '>
                            <Link to="/plants">Plants</Link>
                            <Link to="/plants">Flowers</Link>
                            <Link to="/services">Gardening</Link>
                            <a to="/services">Shipping</a>
                            <a to="/services">Seeds</a>
                        </div>
                    </div>

                    {/* item-3 */}
                    <div>
                        <p className='mb-5 font-bold text-xl '>Quick Links</p>
                        <div className=' flex flex-col gap-1 '>
                            <Link to="/services">Popular Services</Link>
                            <a to="/services">Tree Planting</a>
                            <Link to="/services">Grass Cutting</Link>
                            <Link to="/services">Weeds Control</Link>
                            <Link to="/">Project</Link>
                        </div>
                    </div>

                    {/* item-4 */}
                    <div>
                        <p className='mb-5 font-bold text-xl '>Contact Us</p>
                        <div className=' flex flex-col gap-1 '>
                            <a href="tel:+923117747393">+923009103776</a>
                            <a href="mailto:2021i0346@gmail.com">greenpotnursery@gmail.com</a>

                            <p>Pot Green Nursery Farm <br /> (پاٹ گرین نرسری )</p>
                        </div>
                    </div>

                    {/* floral-image */}
                    <div className='absolute bottom-0 left-0 opacity-20 pointer-events-none '>
                        <img src="src/assets/img/floral-1.png" alt="Footer_image" className='w-full lg:w-1/2 ' />
                    </div>


                </div>
                {/* copyright */}
                <div className='container w-full '>
                    <p className='text-center mt-10 opacity-60 '>Copyright &copy; 2024 Pot Green Nursery . All rights reserved.</p>
                    <p className='text-center opacity-60 '>Developed by Muhammad Kashaf,Ammar Shoukat,Sheharyar Shah</p>
                </div>

            </section>
        </div>
    )
}

export default Footer
