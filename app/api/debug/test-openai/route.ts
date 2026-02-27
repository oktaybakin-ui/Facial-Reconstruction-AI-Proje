import { NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY environment variable not found',
        keyPresent: false,
      }, { status: 500 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const keyInfo = {
      present: true,
      length: apiKey.length,
      startsWith: apiKey.substring(0, 10),
      endsWith: apiKey.substring(apiKey.length - 10),
    };

    // Try to create OpenAI client
    let client;
    try {
      client = getOpenAIClient();
    } catch (clientError: unknown) {
      const clientErrorMessage = clientError instanceof Error ? clientError.message : String(clientError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create OpenAI client',
        details: clientErrorMessage,
        keyInfo,
      }, { status: 500 });
    }

    // Try to make a simple API call (chat completion with minimal request)
    let apiTest;
    try {
      // Use a very simple test request
      apiTest = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say "test"' }],
        max_tokens: 5,
      });
      
      return NextResponse.json({
        success: true,
        message: 'OpenAI API key is working!',
        keyInfo,
        testResult: {
          response: apiTest.choices[0]?.message?.content || 'No response',
          model: apiTest.model,
        },
      });
    } catch (apiError: unknown) {
      // Parse error details
      const apiErr = apiError as Record<string, unknown>;
      const errorDetails = {
        message: apiErr.message ?? String(apiError),
        status: apiErr.status,
        code: apiErr.code,
        type: apiErr.type,
      };

      // Check for specific error types
      let errorType = 'unknown';
      if (apiErr.status === 401) {
        errorType = 'invalid_key';
      } else if (apiErr.status === 429) {
        errorType = 'rate_limit';
      } else if (apiErr.status === 500) {
        errorType = 'server_error';
      }

      return NextResponse.json({
        success: false,
        error: 'OpenAI API call failed',
        errorType,
        errorDetails,
        keyInfo,
        suggestions: {
          invalid_key: [
            'Check if API key is correct',
            'Verify key is not expired',
            'Create a new API key at https://platform.openai.com/api-keys',
            'Make sure key has proper permissions',
          ],
          rate_limit: [
            'Wait a few minutes and try again',
            'Check your usage limits at https://platform.openai.com/account/rate-limits',
            'Upgrade your plan if needed',
          ],
          server_error: [
            'OpenAI servers may be experiencing issues',
            'Try again in a few minutes',
            'Check OpenAI status page',
          ],
        }[errorType] || ['Check error details above'],
      }, { status: 500 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
    }, { status: 500 });
  }
}

