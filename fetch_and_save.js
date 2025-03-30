const axios = require('axios')
const fs = require('fs')

// 🔑 Google Custom Search API Credentials
const API_KEY = 'AIzaSyB-GBG8-JfDXLKa75kODy6EOkPgkYUjXqU' // Your API Key
const CX_NUMBER = 'b49e9159f8a134a3f' // Your Custom Search Engine ID

// 🔍 Your Search Query
const QUERIES = [
  '"Hiring" "Bangalore" internship OR SDE OR HR OR "team lead" -intitle:"profiles" -inurl:"dir/" site:IN.linkedin.com/in OR site:IN.linkedin.com/pub"',
]

const MAX_RESULTS = 50 // Total results to fetch
const RESULTS_PER_PAGE = 10 // Google API returns 10 results per request

async function fetchResults(query) {
  let results = []

  for (let start = 1; start <= MAX_RESULTS; start += RESULTS_PER_PAGE) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_NUMBER}&q=${encodeURIComponent(
        query,
      )}&start=${start}`
      const response = await axios.get(url)

      if (response.data.items) {
        results.push(
          ...response.data.items.map(item => ({
            title: item.title || 'No Title',
            link: item.link || 'No Link',
          })),
        )
      } else {
        console.log('No results found for:', query)
        break
      }
    } catch (error) {
      console.error(`❌ Error fetching results for "${query}":`, error.message)
      break // Stop if there's an error
    }
  }

  return results
}

async function main() {
  console.log('Fetching search results...')

  const query = QUERIES[0] // Using only one query
  const results = await fetchResults(query)

  // Remove duplicate links
  const uniqueResults = results.filter(
    (obj, index, self) => index === self.findIndex(o => o.link === obj.link),
  )

  console.log(`✅ Fetched ${uniqueResults.length} unique results.`)

  // Save results to a JSON file
  fs.writeFileSync('results.json', JSON.stringify(uniqueResults, null, 2))
  console.log(`📁 Results saved to results.json`)
}

main()
