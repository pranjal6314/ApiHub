import { withMethods } from '@/lib/api-middlewares/with-methods'
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path';
import { db } from '@/lib/db'
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body as unknown

  const apiKey = req.headers.authorization
  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized - first get API key' });
  }
  try {
    const validApiKey = await db.apiKey.findFirst({
      where: {
        key: apiKey,
        enabled: true,
      },
    })

    if (!validApiKey) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get the absolute file path
    const filePath = path.join(process.cwd(), 'src/data/hospital.json');

    // Read the realstate.json file
    const jsonData = await fs.readFile(filePath, 'utf-8');
    
    // Attempt to parse JSON data
    let hospitalData;
    try {
        hospitalData = JSON.parse(jsonData);
    } catch (error) {
    //   console.error('Error parsing JSON:', error);
      return res.status(500).json({ error: 'Error parsing JSON' });
    }

    // You can modify the realEstateData if needed before returning it

    await db.apiRequest.create({
      data: {
        duration: 0,
        method: req.method as string,
        path: req.url as string,
        status: 200,
        apiKeyId: validApiKey.id,
        usedApiKey: validApiKey.key,
      },
    })
    return res.status(200).json({ success: true, data: hospitalData })
  } catch (error) {
    // console.error('Internal server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withMethods(['GET'], handler)
