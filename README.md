# Assignment Graduate Credit for CSCI E-114
In this discussion, I will describe the process of:
- using `eleventy-fetch` 
- processing `xml`
- using pagination in `liquid` files

Using Eleventy Fetch to retrieve data from the arXiv API and process the XML response and pagination involves several steps, integrating asynchronous JavaScript operations, XML parsing, and data transformation. 

### My Project

In my project I applied the three concepts mentioned above to build an application that processes machine-learning papers from axiv (https://arxiv.org/). The API for arxiv is free and the API documentation is located here: (https://info.arxiv.org/help/api/index.html). I then use D3 a data visualization library (https://d3js.org/) and the natural language learning library Compromise to analyze the text (https://www.npmjs.com/package/compromise/v/10.0.1).  (I won't go into detail about D3 and NLP in this writeup)

### Step 1: Setting Up Dependencies

First, ensure you have the necessary packages installed in your project. You will need `@11ty/eleventy-fetch` for fetching the data and `xml2js` for parsing the XML response. If not already installed, you can add them to your project with npm:

```bash
npm install @11ty/eleventy-fetch xml2js
```

### Step 2: Defining the Fetch Function

In your Eleventy project, you're going to define an asynchronous function, `fetchPapersByTopic`, which will:

1. Construct a URL to the arXiv API with the desired query parameters.
2. Use Eleventy Fetch to make a GET request to the API.
3. Parse the XML response into a JSON structure.
4. Transform and return the data

NOTE: *what is XML* 
XML is similar to HTML in its syntax, but unlike HTML, XML allows you to define your own tags. This makes it very flexible and adaptable to a wide range of applications.

- example:
```xml
<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom"
          xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/"
          xmlns:arxiv="http://arxiv.org/schemas/atom">
      <link xmlns="http://www.w3.org/2005/Atom"
       href="http://export.arxiv.org/api/query?search_query=all:electron&amp;id_list=&amp;start=0&amp;max_results=1"
       rel="self" type="application/atom+xml"/>
      <title xmlns="http://www.w3.org/2005/Atom">ArXiv Query:
    search_query=all:electron&amp;id_list=&amp;start=0&amp;max_results=1</title>
```

### Step 3: Constructing the API Request

The arXiv API endpoint URL is constructed with query parameters that specify the search criteria (`search_query`), the starting index (`start`), and the maximum number of results (`max_results`). I used a `URLSearchParams` object to manage these parameters (similar to our previous assignment using Parks data)

```javascript 
const params = new URLSearchParams({
  search_query: `all:${topic}`,
  start: 0,
  max_results: 10 // Limit to 10 results for demonstration
});
```

### Step 4: Fetching the Data

Eleventy Fetch (as we've been using) is used to make the GET request. I specify options to cache the response for a day and to treat the response as text since the arXiv API returns XML:

```javascript
const options = {
  duration: "1d",
  type: "text",
  fetchOptions: {
    method: "GET"
  },
};

const url = `http://export.arxiv.org/api/query?${params}`;
const responseText = await EleventyFetch(url, options);
```

### Step 5: Parsing the XML Response

Once you have the XML response as text, you use `xml2js` to parse it into a JavaScript object. This library can handle various XML structures and convert them into more easily navigable JSON:

```javascript
const parser = new xml2js.Parser({ explicitArray: false });
const result = await parser.parseStringPromise(responseText);
```

### Step 6: Transforming the Data

After parsing, the response is transformed to match your application's data structure needs. I process each entry in the arXiv data, extracting and optionally transforming relevant fields:

```javascript
const entries = result.feed.entry;
if (!Array.isArray(entries)) {
  return [entries]; // Ensure the data is always an array
}

return entries.map(entry => {
  return {
    title: entry.title,
    summary: entry.summary,
    authors: entry.author, // Handle if this is an object or array
    id: entry.id,
    slug: entry.id.split('/').pop() // Generate a slug for URLs
  };
});
```

### Step 7: Exporting the Function

Finally, I export the `fetchPapersByTopic` function to make it accessible to Eleventy. This function can be used in the Eleventy data layer (`_data` directory) to fetch and supply data to my liquid templates:

```javascript
module.exports = fetchPapersByTopic;
```

### Usage in Eleventy

In the page portion of my Eleventy project, I use the exported function in my data files (e.g., `arxiv.js` in the `_data` directory) to fetch papers by a specific topic (in my case I used "machine learning"). The data returned by this function becomes available to my templates, where I iterate over the papers and display their information.

### Next using Pagination

Using Eleventy's `fetch` functionality along with pagination allows for efficient and dynamic generation of static pages based on fetched data, such as academic papers from the arXiv API. This approach involves fetching the data, parsing it using the above process, and then creating individual static pages for each item in the dataset.

### step 8: Preparing Data for Pagination
Eleventy's pagination feature enables us to generate multiple pages from a single template. In my case, pagination creates a unique page for each paper fetched from the arXiv API. 

###  step 9: Setting Up Pagination in Eleventy
I use two templates: one for listing all papers (`papers.liquid`) and another for displaying individual paper details (`paper.liquid` with pagination setup).

- **Listing Template (`papers.liquid`)**: This template attempts to list all papers. I loop through the `arxiv` array and generate a list item for each paper. 


```liquid
---
layout: base2
title: Machine Learning Papers
---

{% assign logged_arxiv = arxiv | log %}


<h1>Machine Learning Papers</h1>


<ul>
{% for paper in arxiv %}
  <li>
    <h2><a href="/papers/{{ paper.slug }}">{{ paper.title }}</a></h2>
    <p>Authors: {{ paper.authors | join: ', ' }}</p>
  </li>
{% endfor %}
</ul>
```

- **Paginated Template**: This template is configured to create a specialized page for each item in the `arxiv` array. It includes: 
  - `data: arxiv` tells Eleventy to use the `arxiv` array for pagination.
  - `size: 1` means each page will correspond to a single item from the array.
  - `alias: paper` allows you to refer to the current item being processed as `paper` within your template.

NOTE: the actual implementation is quite complex because I then use compromise and d3 to do some analysis on the data. Here's a snippet showing the frontmatter:

```liquid
---
pagination:
  data: arxiv
  size: 1
  alias: paper
permalink: "/papers/{{ paper.slug }}/"
---
```

### References 

- https://www.11ty.dev/
- d3, Comrpomise
- https://blanchardjulien.com/posts/compromise/ 
- https://d3js.org/d3-hierarchy/tree 
