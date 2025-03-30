const axios = require('axios')
const fs = require('fs').promises

const API_KEY = 'AIzaSyBCx3LuvuFtGBKykfmSyntlgNMgNDPJNHA'
const CX_NUMBER = 'a06e123839fef420b'

const QUERIES = [
  '"Hiring" "Bangalore" internship OR SDE OR HR OR "team lead" -intitle:"profiles" -inurl:"dir/" site:IN.linkedin.com/in OR site:IN.linkedin.com/pub',
]

const MAX_RESULTS = 50
const RESULTS_PER_PAGE = 10

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
      break
    }
  }
  return results
}

function parseLead(title) {
  title = title.replace(/\| LinkedIn/g, '').trim()
  const nameMatch = title.match(/^([^-|]+?)\s*-/)
  const name = nameMatch ? nameMatch[1].trim() : title.split(' - ')[0].trim()
  const companyMatch = title.match(/-\s*(.*?)\s*(\||$)/)
  const company = companyMatch ? companyMatch[1].trim() : 'Unknown'
  return {name, company}
}

function splitName(fullName) {
  const parts = fullName.split(' ')
  const firstName = parts[0] || ''
  const lastName = parts.slice(1).join(' ') || ''
  return {firstName, lastName}
}

function generateMessage(firstName) {
  return `Dear ${firstName}, I came across your profile and was truly impressed by your experience. I would love to connect and learn from your insights. Looking forward to staying in touch!`
}

function determinePosition(company) {
  if (company.includes('HR')) {
    return 'Human Resources'
  } else if (company.match(/SDE|Software Engineer|Developer|Team Lead/i)) {
    return company.match(/SDE|Software Engineer|Developer|Team Lead/i)[0]
  }
  return 'Unknown'
}

function determineIndustry(company) {
  if (company.match(/Tech|IT|Software|Development/i)) {
    return 'Technology'
  }
  return 'IT'
}

async function processLeads() {
  try {
    const filePath = './results.json'
    const data = await fs.readFile(filePath, 'utf8')
    const leads = JSON.parse(data)

    const structuredLeads = leads.map(({title, link}) => {
      const {name, company} = parseLead(title)
      const {firstName, lastName} = splitName(name)

      return {
        Name: name,
        Company: company,
        Position: determinePosition(company),
        Email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
        Industry: determineIndustry(company),
        Location: 'Bangalore',
        Status: 'Pending',
        Message: generateMessage(firstName),
        'LinkedIn Profile': link.trim(),
      }
    })

    await fs.writeFile(
      './parsed_data.json',
      JSON.stringify(structuredLeads, null, 2),
    )
    console.log('✅ Parsed data saved as parsed_data.json')
  } catch (error) {
    console.error('Error processing data:', error)
  }
}

processLeads()
