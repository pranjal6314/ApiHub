import { cosineSimilarity } from '@/helpers/cosine-sim'
import { withMethods } from '@/lib/api-middlewares/with-methods'
import { db } from '@/lib/db'
import { openai } from '@/lib/openai'
import { NextApiRequest, NextApiResponse } from 'next'
import { string, z } from 'zod'
const reqSchema = z.object({
  num: z.number().max(1000),
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body as unknown

  const apiKey = req.headers.authorization

  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { num } = reqSchema.parse(body)
    const validApiKey = await db.apiKey.findFirst({
      where: {
        key: apiKey,
        enabled: true,
      },
    })


    if (!validApiKey) {
      return res.status(401).json({ error: 'Unauthorized' })
    }


    const start = new Date()
   


    
   

  
 
  

    const generateTable = (num: number): number[] => {
        const table: number[] = [];
        for (let i = 1; i <= 10; i++) {
          table.push(num * i);
        }
        return table;
      };
    const table = generateTable(num);
// console.log("similarity: ", similarity)
    const duration = new Date().getTime() - start.getTime()
    // Persist request
 const dataset=   await db.apiRequest.create({
      data: {
        duration,
        method: req.method as string,
        path: req.url as string,
        status: 200,
        apiKeyId: validApiKey.id,
        usedApiKey: validApiKey.key,
      },
    })
    return res.status(200).json({ success: true, table })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues })
    }

    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withMethods(['POST'], handler)