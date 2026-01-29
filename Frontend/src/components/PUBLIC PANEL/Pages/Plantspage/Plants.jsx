import { Helmet } from 'react-helmet-async';
import PlantCatalog from '../Plantspage/Plantcatalog';




const Plants = () => {


 
  return (
    <div className='container sm:mt-24 md:mt-8'>
      <Helmet>
            <title> Plants | Pot Green Nursery</title>
        </Helmet>
      <PlantCatalog/>
    </div>
  )
}

export default Plants
