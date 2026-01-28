import { Helmet } from 'react-helmet-async';
import PlantCatalog from '../Plantspage/Plantcatalog';




const Plants = () => {


 
  return (
    <div className='container mt-6'>
      <Helmet>
            <title> Plants | Pot Green Nursery</title>
        </Helmet>
      <PlantCatalog/>
    </div>
  )
}

export default Plants
