'use server';

import { getOpenAIClient } from '@/lib/openai';
import { withRetry } from './retry';
import type { VisionSummary, AnatomicalLandmarks } from '@/types/ai';
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
7. CRITICAL: Detect key facial anatomical landmark positions on the image for surgical planning.

Output JSON with keys: detected_region, estimated_width_mm, estimated_height_mm, depth_estimation, critical_structures, aesthetic_zone, defect_location, anatomical_landmarks.

defect_location format:
{
  "center_x": number (0-1000, normalized image width),
  "center_y": number (0-1000, normalized image height),
  "width": number (0-1000, normalized defect width),
  "height": number (0-1000, normalized defect height),
  "points": [{"x": number, "y": number}, ...] (defect polygon boundary points, normalized 0-1000)
}

anatomical_landmarks format (all coordinates normalized 0-1000):
{
  "leftEye": {"x": number, "y": number},
  "rightEye": {"x": number, "y": number},
  "noseTip": {"x": number, "y": number},
  "noseBase": {"x": number, "y": number},
  "leftMouthCorner": {"x": number, "y": number},
  "rightMouthCorner": {"x": number, "y": number},
  "chin": {"x": number, "y": number},
  "foreheadCenter": {"x": number, "y": number},
  "leftEyebrow": {"x": number, "y": number},
  "rightEyebrow": {"x": number, "y": number},
  "nasolabialFoldLeft": {"x": number, "y": number},
  "nasolabialFoldRight": {"x": number, "y": number},
  "facialMidline": {"topX": number, "bottomX": number},
  "eyeLine": {"y": number},
  "mouthLine": {"y": number}
}

IMPORTANT: Both defect_location and anatomical_landmarks coordinates must be EXACTLY aligned with the actual positions in the image. These are used for precise surgical flap planning.

Be precise and conservative in your estimates.`;

export async function analyzeVision(
  imageUrl: string,
  caseMetadata: Partial<Case>
): Promise<VisionSummary> {
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key bulunamadı. Lütfen .env.local dosyasında OPENAI_API_KEY değişkenini ayarlayın.');
  }

  // Verify image URL is accessible
  try {
    const imageCheck = await fetch(imageUrl, { method: 'HEAD' });
    if (!imageCheck.ok) {
      throw new Error(`Image URL erişilemiyor. Status: ${imageCheck.status}. Lütfen fotoğraf URL'sini kontrol edin.`);
    }
  } catch (imgError: unknown) {
    console.error('Image URL not accessible:', imgError instanceof Error ? imgError.message : String(imgError));
    throw new Error(`Fotoğraf URL'si erişilemiyor: ${imgError instanceof Error ? imgError.message : String(imgError)}. Lütfen fotoğrafın yüklü olduğundan emin olun.`);
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

    // Fetch image and convert to base64 - OpenAI needs direct access to image data
    let imageContent: string;
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Image fetch failed: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      
      // Convert ArrayBuffer to base64 (Node.js compatible)
      const base64String = Buffer.from(imageBuffer).toString('base64');
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      
      imageContent = `data:${contentType};base64,${base64String}`;
    } catch (fetchError: unknown) {
      console.error('Failed to fetch/convert image:', fetchError instanceof Error ? fetchError.message : String(fetchError));
      throw new Error(`Fotoğraf indirilemedi veya base64'e çevrilemedi: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
    }
    
    const openai = getOpenAIClient();
    const response = await withRetry(
      () => openai.chat.completions.create({
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
        max_tokens: 2500,
        response_format: { type: 'json_object' },
      }),
      { maxRetries: 2, initialDelayMs: 2000 }
    );

    const content = response.choices[0]?.message?.content;

    // Finish reason "stop" is actually success - but content might be empty
    if (!content || typeof content !== 'string' || content.trim() === '') {
      console.error('No content in vision response:', {
        finishReason: response.choices[0]?.finish_reason,
      });
      throw new Error(`Vision model yanıt verdi ama içerik boş. Finish reason: ${response.choices[0]?.finish_reason || 'unknown'}. İçerik uzunluğu: ${content?.length || 0}`);
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError: unknown) {
      console.error('Vision JSON parse error:', parseError);
      throw new Error(`Vision model yanıtı parse edilemedi: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
    
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
        anatomical_landmarks: parseAnatomicalLandmarks(parsed.anatomical_landmarks),
      };
  } catch (error: unknown) {
    console.error('Vision analysis error:', error);
    const errObj = error as Record<string, unknown>;

    // Handle OpenAI API key errors specifically
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStatus = errObj?.status || errObj?.statusCode;

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

// Parse anatomical landmarks from GPT-4o response
function parseAnatomicalLandmarks(raw: Record<string, unknown> | undefined): AnatomicalLandmarks | undefined {
  if (!raw) return undefined;

  const pt = (obj: unknown): { x: number; y: number } => {
    const o = obj as Record<string, number> | undefined;
    return { x: o?.x ?? 0, y: o?.y ?? 0 };
  };

  // Require at minimum leftEye and rightEye
  if (!raw.leftEye || !raw.rightEye) return undefined;

  return {
    leftEye: pt(raw.leftEye),
    rightEye: pt(raw.rightEye),
    noseTip: pt(raw.noseTip),
    noseBase: pt(raw.noseBase),
    leftMouthCorner: pt(raw.leftMouthCorner),
    rightMouthCorner: pt(raw.rightMouthCorner),
    chin: pt(raw.chin),
    foreheadCenter: raw.foreheadCenter ? pt(raw.foreheadCenter) : undefined,
    leftEyebrow: raw.leftEyebrow ? pt(raw.leftEyebrow) : undefined,
    rightEyebrow: raw.rightEyebrow ? pt(raw.rightEyebrow) : undefined,
    nasolabialFoldLeft: raw.nasolabialFoldLeft ? pt(raw.nasolabialFoldLeft) : undefined,
    nasolabialFoldRight: raw.nasolabialFoldRight ? pt(raw.nasolabialFoldRight) : undefined,
    facialMidline: {
      topX: (raw.facialMidline as Record<string, number>)?.topX ?? 500,
      bottomX: (raw.facialMidline as Record<string, number>)?.bottomX ?? 500,
    },
    eyeLine: { y: (raw.eyeLine as Record<string, number>)?.y ?? 400 },
    mouthLine: { y: (raw.mouthLine as Record<string, number>)?.y ?? 650 },
  };
}

// Lightweight landmark extraction for manual annotation path (separate API call)
export async function extractAnatomicalLandmarks(imageUrl: string): Promise<AnatomicalLandmarks | undefined> {
  if (!process.env.OPENAI_API_KEY) return undefined;

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) return undefined;

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64String = Buffer.from(imageBuffer).toString('base64');
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const imageContent = `data:${contentType};base64,${base64String}`;

    const openai = getOpenAIClient();
    const response = await withRetry(
      () => openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a facial anatomy detection system. Detect facial landmark positions on the given photograph. Return ONLY JSON with anatomical_landmarks object. All coordinates normalized 0-1000.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Detect facial landmarks on this image. Return JSON: { "anatomical_landmarks": { "leftEye": {"x","y"}, "rightEye": {"x","y"}, "noseTip": {"x","y"}, "noseBase": {"x","y"}, "leftMouthCorner": {"x","y"}, "rightMouthCorner": {"x","y"}, "chin": {"x","y"}, "foreheadCenter": {"x","y"}, "leftEyebrow": {"x","y"}, "rightEyebrow": {"x","y"}, "nasolabialFoldLeft": {"x","y"}, "nasolabialFoldRight": {"x","y"}, "facialMidline": {"topX","bottomX"}, "eyeLine": {"y"}, "mouthLine": {"y"} } }. All values 0-1000 normalized to image dimensions.',
              },
              { type: 'image_url', image_url: { url: imageContent } },
            ],
          },
        ],
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
      { maxRetries: 1, initialDelayMs: 1000 }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) return undefined;

    const parsed = JSON.parse(content);
    return parseAnatomicalLandmarks(parsed.anatomical_landmarks);
  } catch (error: unknown) {
    console.warn('Anatomical landmark extraction failed:', error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

