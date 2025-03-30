const fs = require('fs').promises

// Function to parse title into name and company
function parseLead(title) {
  // Remove unnecessary parts like "| LinkedIn"
  title = title.replace(/\| LinkedIn/g, '').trim()

  // Extract Name (before the first "-")
  const nameMatch = title.match(/^([^-|]+?)\s*-/)
  const name = nameMatch ? nameMatch[1].trim() : title.split(' - ')[0].trim()

  // Extract Company (last part after the last "-")
  const companyMatch = title.match(/-\s*(.*?)\s*(\||$)/)
  const company = companyMatch ? companyMatch[1].trim() : 'Unknown'

  return {name, company}
}

// Function to split name into first and last names
function splitName(fullName) {
  const parts = fullName.split(' ')
  const firstName = parts[0] || ''
  const lastName = parts.slice(1).join(' ') || ''
  return {firstName, lastName}
}

// Function to generate a custom message
function generateMessage(firstName) {
  return `Hi ${firstName}, I came across your profile and was impressed by your experience. I’d love to connect and learn from your insights. Looking forward to staying in touch!, test Lemlist.`
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
        'First Name': firstName,
        'Last Name': lastName,
        'Email address': '',
        'Phone number': '',
        Company: company,
        'LinkedIn profile': link.trim(),
        Message: generateMessage(firstName),
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
