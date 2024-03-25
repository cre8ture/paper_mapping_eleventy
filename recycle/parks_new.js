

require("dotenv").config();
const EleventyFetch = require("@11ty/eleventy-fetch");

const apiKey = process.env.NPS_API_KEY;
const parksBaseUrl = "https://developer.nps.gov/api/v1/parks";
const placesBaseUrl = "https://developer.nps.gov/api/v1/places";

// fetch places for a specific park
async function fetchPlacesForPark(parkCode) {
  const params = new URLSearchParams({
    parkCode: parkCode,
    limit: 20 // Limit 20 places
  });

  const options = {
    duration: "1d", // Cache  response for 1 day
    type: "json",
    fetchOptions: {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
      },
    },
  };

  const response = await EleventyFetch(`${placesBaseUrl}?${params}`, options);
  return response.data;
}

module.exports = async function () {
  let allParks = [];
  let start = 0;
  const limit = 100; // API allows fetching 100 parks at a time

  try {
    while (true) {
      let params = new URLSearchParams({ start: start.toString(), limit: limit.toString() });
      let options = {
        duration: "1d",
        type: "json",
        fetchOptions: {
          method: "GET",
          headers: {
            "X-Api-Key": apiKey,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
          },
        },
      };

      let data = await EleventyFetch(`${parksBaseUrl}?${params}`, options);

      if (!data || data.data.length === 0) {
        break;
      }

      allParks = allParks.concat(data.data);
      start += limit;

      if (start >= 1000) {
        console.warn('Approaching the rate limit, stopping further requests.');
        break;
      }
    }

    for (let park of allParks) {
      let places = await fetchPlacesForPark(park.parkCode);
      park.places = places; // Attach places to each park
      // console.log("Fetched places for park:", park.parkCode, park.places[0])
    }
  } catch (error) {
    console.error("Error fetching parks and places:", error);
    return []; // Return an empty arr
  }


  return allParks;
};
