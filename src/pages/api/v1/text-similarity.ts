import { cosineSimilarity } from '@/helpers/cosine-sim'
import { withMethods } from '@/lib/api-middlewares/with-methods' 
import { db } from '@/lib/db'
import { openai } from '@/lib/openai'
import { NextApiRequest, NextApiResponse } from 'next'
import { string, z } from 'zod'
// const translate = require('google-translate-api');
const translate = require('@iamtraction/google-translate');
const reqSchema = z.object({
  text1: z.string().max(1000),
  text2: z.string().max(1000),
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body as unknown

  const apiKey = req.headers.authorization
  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { text1, text2 } = reqSchema.parse(body)
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
    // const embeddings = await Promise.all(
    //   [text1, text2].map(async (text) => {
       
    //     const res = await openai.createEmbedding({
    //       model: 'text-embedding-ada-002',
    //       input: text,
    //     })

    //     return res.data.data[0].embedding
    //   })
    // )


    interface ComparisonResult {
      text1: string;
      text2: string;
      
      differences: { position: number; text1Char: string; text2Char: string }[];
      similarities: { start: number; end: number; text1Substring: string; text2Substring: string }[];
      dotProduct: number;
      magnitude1: number;
      magnitude2: number;
      similarityPercentage: number;
    }
    // const similarity = cosineSimilarity(embeddings[0], embeddings[1])
  //   const calculateSimilarityPercentage = (text1: string, text2: string) => {
  //     const cleanText1 = text1.toLowerCase().replace(/[^a-z0-9]+/g, '');
  //     const cleanText2 = text2.toLowerCase().replace(/[^a-z0-9]+/g, '');
  //       // Pad the shorter text with spaces to match the length of the longer text
  // const maxLength = Math.max(cleanText1.length, cleanText2.length);
  // const paddedText1 = cleanText1.padEnd(maxLength, ' ');
  // const paddedText2 = cleanText2.padEnd(maxLength, ' ');
   
  //  // Calculate the dot product
  //  const dotProduct = paddedText1.split('').reduce((acc, char, index) => {
  //   return acc + char.charCodeAt(0) * paddedText2.charCodeAt(index);
  // }, 0);

  // // Calculate the magnitudes
  // const magnitude1 = Math.sqrt(paddedText1.split('').reduce((acc, char) => {
  //   return acc + Math.pow(char.charCodeAt(0), 2);
  // }, 0));
  // const magnitude2 = Math.sqrt(paddedText2.split('').reduce((acc, char) => {
  //   return acc + Math.pow(char.charCodeAt(0), 2);
  // }, 0));

  // const similarity = dotProduct / (magnitude1 * magnitude2);
  // const similarityPercentage = Math.round(similarity * 100);
    
  //     return {similarityPercentage,dotProduct,magnitude1,magnitude2};
  //   }
  
  

  const convertToHindi = async (text: string): Promise<string> => {
    try {
      const result = await translate(text, { from: 'en', to: 'fr' });
      console.log(result.text);
      return result.text;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Return the original text if translation fails
    }
  };
 
 
  
  const calculateSimilarityPercentage =  (text1: string, text2: string): ComparisonResult => {
    // Convert texts to lowercase and remove non-alphanumeric characters
    const cleanText1 = text1.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const cleanText2 = text2.toLowerCase().replace(/[^a-z0-9]+/g, '');
   // Convert texts to Hindi
   
    // Pad the shorter text with spaces to match the length of the longer text
    const maxLength = Math.max(cleanText1.length, cleanText2.length);
    const paddedText1 = cleanText1.padEnd(maxLength, ' ');
    const paddedText2 = cleanText2.padEnd(maxLength, ' ');
  
    // Calculate the dot product
    const dotProduct = paddedText1.split('').reduce((acc, char, index) => {
      return acc + char.charCodeAt(0) * paddedText2.charCodeAt(index);
    }, 0);

  
    // Calculate the magnitudes
    const magnitude1 = Math.sqrt(paddedText1.split('').reduce((acc, char) => {
      return acc + Math.pow(char.charCodeAt(0), 2);
    }, 0));
    const magnitude2 = Math.sqrt(paddedText2.split('').reduce((acc, char) => {
      return acc + Math.pow(char.charCodeAt(0), 2);
    }, 0));
  
    const similarity = dotProduct / (magnitude1 * magnitude2);
    const similarityPercentage = Math.round(similarity * 100);
  
    const differences: ComparisonResult['differences'] = [];
    const similarities: ComparisonResult['similarities'] = [];
  
    // Find differences and similarities between the texts
    for (let i = 0; i < maxLength; i++) {
      const text1Char = paddedText1[i];
      const text2Char = paddedText2[i];
  
      if (text1Char !== text2Char) {
        differences.push({ position: i, text1Char, text2Char });
      } else {
        let start = i;
        let end = i;
  
        while (i + 1 < maxLength && paddedText1[i + 1] === paddedText2[i + 1]) {
          end = i + 1;
          i++;
        }
  
        similarities.push({
          start,
          end,
          text1Substring: paddedText1.substring(start, end + 1),
          text2Substring: paddedText2.substring(start, end + 1),
        });
      }
    }
  
    return {
      text1,
      text2,
      differences,
      similarities,
      dotProduct,
      magnitude1,
      magnitude2,
      similarityPercentage,
    };
  };
    const similarity = calculateSimilarityPercentage(text1, text2);
console.log("similarity: ", similarity)
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
    return res.status(200).json({ success: true, similarity })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues })
    }

    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withMethods(['POST'], handler)