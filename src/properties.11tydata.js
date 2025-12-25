module.exports = {
  eleventyComputed: {
    // Generate a JSON file for properties
    properties: (data) => {
      // Access the properties data loaded from `_data/properties.json`
      const properties = data.properties;

      // This will make the properties data available at `/properties.json`
      return JSON.stringify(properties, null, 2);
    },
  },
  // Define the output path for the JSON file
  permalink: '/properties.json',
};
