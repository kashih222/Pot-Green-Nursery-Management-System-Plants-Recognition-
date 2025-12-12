import Header from './Header'
import Sidebar from './Sidebar'
import MainPage from '../MainPage'
const DashboardHome = () => {
  return (
    <div className='main container relative '>
       <Header />
       <div className='content-main flex'>
         <div className='sidebar-wraper'>
           <Sidebar />
         </div>
         <div className='content-right xl:ml-[280px] sm:ml-[160px] mt-6'>
            <MainPage/>
         </div>
       </div>
    </div>
  )
}

export default DashboardHome
