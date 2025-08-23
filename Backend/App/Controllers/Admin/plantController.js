const Plant = require('../../Models/Admin/plantUpload');

// Get all plants grouped by category
exports.getPlantsByCategory = async (req, res) => {
  try {
    const plants = await Plant.find({}).sort({ category: 1, plantName: 1 });
    
    // Group plants by category
    const plantsByCategory = plants.reduce((acc, plant) => {
      const category = plant.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: plant._id,
        name: plant.plantName,
        price: plant.price,
        stock: plant.stockQuantity,
        description: plant.description,
        image: plant.plantImage
      });
      return acc;
    }, {});

    // Convert to array format expected by frontend
    const categories = Object.keys(plantsByCategory).map((category, index) => ({
      id: index + 1,
      name: category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      path: category,
      products: plantsByCategory[category]
    }));

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plants by category',
      error: error.message
    });
  }
};

// Get plants by specific category
exports.getPlantsBySpecificCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const plants = await Plant.find({ category }).sort({ plantName: 1 });
    
    const formattedPlants = plants.map(plant => ({
      id: plant._id,
      name: plant.plantName,
      price: plant.price,
      stock: plant.stockQuantity,
      description: plant.description,
      image: plant.plantImage
    }));

    res.status(200).json({
      success: true,
      category: category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      products: formattedPlants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plants for category',
      error: error.message
    });
  }
}; 