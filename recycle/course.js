require('dotenv').config();
const fetch = require('node-fetch');

const CANVAS_API_URL = 'https://canvas.harvard.edu/api/graphql';
const CANVAS_API_KEY = process.env.CANVAS_API_KEY;

module.exports = async function() {
  let query = `
  query CourseAssignmentsAndModules($courseId: ID!) {
    course(id: $courseId) {
      id
      assignmentsConnection {
        edges {
          node {
            id
            name
            dueAt
            htmlUrl
          }
        }
      }
      modulesConnection {
        nodes {
          name
          createdAt
        }
      }
    }
  }
`;

  let variables = {
    courseId: "133143"
  };

  try {
    let response = await fetch(CANVAS_API_URL, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${CANVAS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data = await response.json();
    // console.log(data); // Logging the data for debugging purposes
    console.log( "FETCHED", data) //data.data.course.assignmentsConnection.nodes)
    return data //.data.course.assignmentsConnection.nodes
    // return data.data.course; // Return the course data for your Eleventy site
  } catch (e) {
    console.error(`Could not fetch data: ${e}`);
    return {}; // Return empty object if  an error
  }
};
