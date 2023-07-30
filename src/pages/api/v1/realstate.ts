import { withMethods } from '@/lib/api-middlewares/with-methods'
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body as unknown

  const apiKey = req.headers.authorization
  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized - first get API key' });
  }
  try {
    // Get the absolute file path
    const filePath = path.join(process.cwd(), 'src/data/realstate.json');

    // Read the realstate.json file
    const jsonData = await fs.readFile(filePath, 'utf-8');
    
    // Attempt to parse JSON data
    let realEstateData;
    try {
      realEstateData = JSON.parse(jsonData);
    } catch (error) {
    //   console.error('Error parsing JSON:', error);
      return res.status(500).json({ error: 'Error parsing JSON' });
    }

    // You can modify the realEstateData if needed before returning it

    return res.status(200).json({ success: true, data: realEstateData })
  } catch (error) {
    // console.error('Internal server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withMethods(['GET'], handler)
