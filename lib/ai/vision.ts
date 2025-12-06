import { openai } from '@/lib/openai';
import type { VisionSummary } from '@/types/ai';
import type { Case } from '@/types/cases';

const SYSTEM_PROMPT = `You are a medical-grade computer vision assistant.
Input: a pre-operative clinical photograph of a facial skin defect after tumor excision, plus structured metadata.

Your tasks:
1. Identify the anatomical region of the defect on the face.
2. Estimate defect width and height in millimeters using metadata as context.
3. Estimate depth category: skin only / skin+subcutis / involving muscle / involving mucosa.
4. List nearby critical structures (alar rim, eyelid margin, lip commissure, etc.).
5. Classify whether this is a high-aesthetic-impact zone.
6. CRITICAL: Detect the EXACT location of the defect on the image and provide coordinates.

Output JSON with keys: detected_region, estimated_width_mm, estimated_height_mm, depth_estimation, critical_structures, aesthetic_zone, defect_location.

defect_location format:
{
  "center_x": number (0-1000, normalized image width),
  "center_y": number (0-1000, normalized image height),
  "width": number (0-1000, normalized defect width),
  "height": number (0-1000, normalized defect height),
  "points": [{"x": number, "y": number}, ...] (defect polygon boundary points, normalized 0-1000)
}

IMPORTANT: defect_location coordinates must be EXACTLY aligned with where the defect appears in the image.

Be precise and conservative in your estimates.`;

export async function analyzeVision(
  imageUrl: string,
  caseMetadata: Partial<Case>
): Promise<VisionSummary> {
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key bulunamadı. Lütfen .env.local dosyasında OPENAI_API_KEY değişkenini ayarlayın.');
  }

  console.log('Starting vision analysis with image URL:', imageUrl);
  console.log('OpenAI API key present:', !!process.env.OPENAI_API_KEY);
  
  // Verify image URL is accessible
  try {
    const imageCheck = await fetch(imageUrl, { method: 'HEAD' });
    console.log('Image URL accessibility check:', {
      url: imageUrl,
      status: imageCheck.status,
      ok: imageCheck.ok,
      contentType: imageCheck.headers.get('content-type'),
    });
    
    if (!imageCheck.ok) {
      throw new Error(`Image URL erişilemiyor. Status: ${imageCheck.status}. Lütfen fotoğraf URL'sini kontrol edin.`);
    }
  } catch (imgError: any) {
    console.error('Image URL not accessible:', imgError.message);
    throw new Error(`Fotoğraf URL'si erişilemiyor: ${imgError.message}. Lütfen fotoğrafın yüklü olduğundan emin olun.`);
  }

  try {
      const userPrompt = `Analyze this pre-operative photograph of a facial skin defect.

  Case Metadata:
  - Region: ${caseMetadata.region || 'Not specified'}
  - Width (mm): ${caseMetadata.width_mm || 'Not specified'}
  - Height (mm): ${caseMetadata.height_mm || 'Not specified'}
  - Depth: ${caseMetadata.depth || 'Not specified'}
  - Critical structures mentioned: ${caseMetadata.critical_structures?.join(', ') || 'None'}
  - High aesthetic zone: ${caseMetadata.high_aesthetic_zone ? 'Yes' : 'No/Unknown'}

  CRITICAL TASK: 
  Please identify the EXACT location of the defect/lesion on the image. Provide defect_location with:
  - center_x, center_y: The center coordinates of the defect (normalized 0-1000)
  - width, height: The size of the defect (normalized 0-1000)
  - points: Array of polygon points outlining the defect boundary (normalized 0-1000)
  
  These coordinates will be used for precise surgical planning, so they must be EXACTLY aligned with where the defect appears in the image.

  Please analyze the image and provide a JSON response with your findings including defect_location.`;

    console.log('Calling OpenAI Vision API with image URL:', imageUrl);
    console.log('User prompt:', userPrompt.substring(0, 100) + '...');
    
    // Fetch image and convert to base64 - OpenAI needs direct access to image data
    let imageContent: string;
    try {
      console.log('Step 1: Fetching image from URL to convert to base64...');
      console.log('Image URL:', imageUrl);
      
      const imageResponse = await fetch(imageUrl);
      console.log('Image fetch response:', {
        status: imageResponse.status,
        ok: imageResponse.ok,
        contentType: imageResponse.headers.get('content-type'),
        contentLength: imageResponse.headers.get('content-length'),
      });
      
      if (!imageResponse.ok) {
        throw new Error(`Image fetch failed: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      
      console.log('Step 2: Converting image to base64...');
      const imageBuffer = await imageResponse.arrayBuffer();
      console.log('Image buffer size:', imageBuffer.byteLength, 'bytes');
      
      // Convert ArrayBuffer to base64 (Node.js compatible)
      const base64String = Buffer.from(imageBuffer).toString('base64');
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      
      imageContent = `data:${contentType};base64,${base64String}`;
      console.log('Step 3: Image converted to base64 successfully');
      console.log('Base64 data URI length:', imageContent.length, 'chars');
      console.log('Base64 preview:', imageContent.substring(0, 50) + '...');
    } catch (fetchError: any) {
      console.error('Failed to fetch/convert image:', fetchError.message);
      console.error('Error stack:', fetchError.stack);
      throw new Error(`Fotoğraf indirilemedi veya base64'e çevrilemedi: ${fetchError.message}`);
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            {
              type: 'image_url',
              image_url: {
                url: imageContent, // Use base64 data URI instead of URL
              },
            },
          ],
        },
      ],
      max_tokens: 1500, // Increased for defect location coordinates
      response_format: { type: 'json_object' },
    });

    console.log('OpenAI API response received:', {
      hasChoices: !!response.choices,
      choicesLength: response.choices?.length || 0,
      firstChoice: response.choices?.[0] ? {
        hasMessage: !!response.choices[0].message,
        hasContent: !!response.choices[0].message?.content,
        contentLength: response.choices[0].message?.content?.length || 0,
        contentPreview: response.choices[0].message?.content?.substring(0, 100),
        finishReason: response.choices[0].finish_reason,
      } : null,
    });

    const content = response.choices[0]?.message?.content;
    
    // Log full response structure for debugging
    console.log('Full response structure:', JSON.stringify({
      choices: response.choices?.map((choice: any) => ({
        index: choice.index,
        message: {
          role: choice.message?.role,
          content: choice.message?.content ? `[${choice.message.content.length} chars]` : 'null/empty',
          contentPreview: choice.message?.content?.substring(0, 200),
        },
        finish_reason: choice.finish_reason,
      })),
    }, null, 2));
    
    // Finish reason "stop" is actually success - but content might be empty
    if (!content || content.trim() === '') {
      const fullResponseDebug = JSON.stringify(response, null, 2);
      console.error('No content in response (even though finish_reason might be stop):', {
        finishReason: response.choices[0]?.finish_reason,
        message: response.choices[0]?.message,
        fullResponse: fullResponseDebug.substring(0, 1000),
      });
      
      // Check if image URL is accessible
      try {
        const imageCheck = await fetch(imageUrl, { method: 'HEAD' });
        console.log('Image URL accessibility check:', {
          url: imageUrl,
          status: imageCheck.status,
          accessible: imageCheck.ok,
        });
      } catch (imgError: any) {
        console.error('Image URL not accessible:', imgError.message);
      }
      
      throw new Error(`Vision model yanıt verdi ama içerik boş. Finish reason: ${response.choices[0]?.finish_reason || 'unknown'}. İçerik uzunluğu: ${content?.length || 0}`);
    }
    
    console.log('Content received successfully, length:', content.length);

    console.log('Response content received:', content.substring(0, 200) + '...');
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error(`Vision model yanıtı parse edilemedi: ${parseError.message}`);
    }
    
    console.log('Parsed response:', parsed);
    
      // Validate and normalize the response
      return {
        detected_region: parsed.detected_region || caseMetadata.region || 'Unknown',
        estimated_width_mm: parsed.estimated_width_mm || caseMetadata.width_mm || 0,
        estimated_height_mm: parsed.estimated_height_mm || caseMetadata.height_mm || 0,
        depth_estimation: parsed.depth_estimation || caseMetadata.depth || 'Unknown',
        critical_structures: Array.isArray(parsed.critical_structures) 
          ? parsed.critical_structures 
          : caseMetadata.critical_structures || [],
        aesthetic_zone: parsed.aesthetic_zone ?? caseMetadata.high_aesthetic_zone ?? false,
        defect_location: parsed.defect_location ? {
          center_x: parsed.defect_location.center_x || 0,
          center_y: parsed.defect_location.center_y || 0,
          width: parsed.defect_location.width || 0,
          height: parsed.defect_location.height || 0,
          points: Array.isArray(parsed.defect_location.points) 
            ? parsed.defect_location.points 
            : undefined,
        } : undefined,
      };
  } catch (error: any) {
    console.error('Vision analysis error:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      statusCode: error?.statusCode,
      stack: error?.stack,
      response: error?.response,
    });
    
    // Handle OpenAI API key errors specifically
    const errorMessage = error?.message || '';
    const errorStatus = error?.status || error?.statusCode;
    
    if (errorStatus === 401 || errorMessage.includes('Incorrect API key') || errorMessage.includes('401')) {
      throw new Error(
        'OpenAI API key geçersiz veya eksik. ' +
        'Lütfen Vercel Dashboard\'da OPENAI_API_KEY environment variable\'ını kontrol edin. ' +
        'API key\'inizi https://platform.openai.com/account/api-keys adresinden alabilirsiniz.'
      );
    }
    
    // Handle quota/rate limit errors
    if (errorStatus === 429 || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      throw new Error(
        'OpenAI API quota/rate limit aşıldı. ' +
        'Lütfen https://platform.openai.com/account/billing adresinden quota durumunuzu kontrol edin.'
      );
    }
    
    // Re-throw error instead of returning fallback so orchestrator can handle it properly
    throw new Error(`Görüntü analizi başarısız: ${errorMessage || 'Bilinmeyen hata'}`);
  }
}

