import { cosineSimilarity } from '@/helpers/cosine-sim'
import { withMethods } from '@/lib/api-middlewares/with-methods'
import { db } from '@/lib/db'
import { openai } from '@/lib/openai'
import { NextApiRequest, NextApiResponse } from 'next'
import { string, z } from 'zod'
import fs from 'fs/promises'
import path from 'path';

const reqSchema = z.object({
  mon: z.string().max(1000),
  date: z.string().max(1000),
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body as unknown

  const apiKey = req.headers.authorization

  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const start = new Date()
    const { mon, date } = reqSchema.parse(body)
    const validApiKey = await db.apiKey.findFirst({
      where: {
        key: apiKey,
        enabled: true,
      },
    })

    if (!validApiKey) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const filePath = path.join(process.cwd(), 'src/data/dates.json');

    // Read the realstate.json file
    const jsonData = await fs.readFile(filePath, 'utf-8');
    let date_data;
    try {
      date_data = JSON.parse(jsonData);
    } catch (error) {
      return res.status(500).json({ error: 'Error parsing JSON' });
    }

    const events = date_data[mon]?.[date] || [];

    const duration = new Date().getTime() - start.getTime()
    // Persist request
    await db.apiRequest.create({
      data: {
        duration,
        method: req.method as string,
        path: req.url as string,
        status: 200,
        apiKeyId: validApiKey.id,
        usedApiKey: validApiKey.key,
      },
    })

    if (events.length === 0) {
      // If events array is empty, return a message indicating no events for the given date
      return res.status(200).json({ success: true,mon,date, data: [], message: 'No events found for the given date' });
    } else {
      return res.status(200).json({ success: true, data: events,date,mon });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues })
    }

    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withMethods(['POST'], handler)
