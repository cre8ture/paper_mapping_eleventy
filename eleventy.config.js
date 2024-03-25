module.exports = function (eleventyConfig) {
  // Add a JSON filter for debugging purposes
  eleventyConfig.addFilter("log", value => {
    console.log("nerd", value);
    return value;
  });

  // Existing passthrough copy configuration
  eleventyConfig.addPassthroughCopy("src/assets/**");

  // Return your Eleventy configuration object
  return {
    dir: {
      input: "src",
      output: "dist",
    },
  };
};
