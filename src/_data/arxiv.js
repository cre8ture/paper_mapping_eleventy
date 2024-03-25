// require("dotenv").config();
// const EleventyFetch = require("@11ty/eleventy-fetch");
// const xml2js = require("xml2js"); // Import the xml2js module

// const arxivBaseUrl = "http://export.arxiv.org/api/query";

// async function fetchPapersByTopic(topic) {
//   const params = new URLSearchParams({
//     search_query: `all:${topic}`,
//     start: 0,
//     max_results: 10
//   });

//   const options = {
//     duration: "1d",
//     type: "text", // Change type to 'text' to get the raw XML response as text
//     fetchOptions: {
//       method: "GET"
//     },
//   };

//   const response = await EleventyFetch(`${arxivBaseUrl}?${params}`, options);

//   // Parse the XML response to JSON
//   const parser = new xml2js.Parser({ explicitArray: false });
//   const json = await parser.parseStringPromise(response);

//   // Now 'json' contains the response data as a JavaScript object
//   // You can process this object as needed, e.g., to extract paper details
//   return json; // Return the parsed JSON
// }

// module.exports = async function () {
//     const topic = "machine learning"; // Hardcoded for demonstration
//     let papers = await fetchPapersByTopic(topic);
    
//     console.log("i am papers", papers)
//     // Assuming you've parsed the XML and have your papers in a JSON array
//     // Add a URL-friendly slug to each paper
//     papers = papers.map(paper => {
//       paper.slug = paper.id.replace(/\//g, "-"); // Creating a slug by replacing '/' with '-'
//       return paper;
//     });
    
//     return papers;
//   };


// src/_data/arxiv.js
const EleventyFetch = require("@11ty/eleventy-fetch");
const xml2js = require('xml2js'); // make sure to npm install xml2js

async function fetchPapersByTopic(topic) {
  const params = new URLSearchParams({
    search_query: `all:${topic}`,
    start: 0,
    max_results: 10 // Limit to 10 results for demonstration
  });

  const options = {
    duration: "1d", // Cache response for 1 day
    type: "text", // Get the raw text of the response since it's XML
    fetchOptions: {
      method: "GET"
      // No API key needed for arXiv
    },
  };

  const url = `http://export.arxiv.org/api/query?${params}`;
  const responseText = await EleventyFetch(url, options);
  
  // Parse the XML response
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(responseText);
  
  // Extract the 'entry' array which contains the papers
  const entries = result.feed.entry;
  if (!Array.isArray(entries)) {
    // If there's only one paper, it won't be an array, so we make it one for consistency
    return [entries];
  }
  return entries.map(entry => {

    console.log("entry", entry)
    // You can now return the structure you want, for example:
    return {
      title: entry.title,
      summary: entry.summary,
      authors: entry.author, // This might be an array or an object, so you may need to handle that
      id: entry.id,
      slug: entry.id.split('/').pop() // Generate a slug from the arXiv ID
    };
  });
}

module.exports = fetchPapersByTopic;
