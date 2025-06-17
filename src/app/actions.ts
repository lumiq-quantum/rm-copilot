
// @ts-nocheck
// Disabling TypeScript check for this file due to diverse API interaction needs.
'use server';

import type { AIMessageContent, Message } from '@/types';

// Helper to format messages for the API (currently not used by the text-to-sql API)
function formatMessagesForApi(messages: Message[]): Array<{ role: 'user' | 'assistant'; content: Array<{ text: string }> }> {
  return messages
    .map(msg => {
      let apiRole: 'user' | 'assistant';
      let textContent: string | undefined;

      if (msg.sender === 'user') {
        apiRole = 'user';
        textContent = msg.content as string;
      } else { // bot
        apiRole = 'assistant';
        if (typeof msg.content === 'string') {
            textContent = msg.content; 
        } else if (msg.content && typeof msg.content === 'object' && 'text' in msg.content) {
            textContent = (msg.content as AIMessageContent).text;
        }
      }

      if (textContent && !msg.id.startsWith('msg-init-')) {
        return {
          role: apiRole,
          content: [{ text: textContent }],
        };
      }
      return null;
    })
    .filter(msg => msg !== null) as Array<{ role: 'user' | 'assistant'; content: Array<{ text: string }> }>;
}


function createBotMessage(responseData: any): Message {
  const content: AIMessageContent = {};

  if (responseData && typeof responseData.answer === 'string') {
    content.text = responseData.answer;
  } else {
    content.text = 'Received an unexpected response format or no text answer from the BankerAI API.';
  }

  if (responseData.sql_query && typeof responseData.sql_query === 'string') {
    content.sqlInfo = { query: responseData.sql_query };
  }

  if (responseData.dataframe && typeof responseData.dataframe === 'string') { // Expecting dataframe as a JSON string
    try {
      const parsedData = JSON.parse(responseData.dataframe);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        content.tableData = parsedData;
      } else if (parsedData && typeof parsedData === 'object' && Object.keys(parsedData).length > 0) { 
         content.tableData = [parsedData];
      }
    } catch (e) {
      console.error("Failed to parse dataframe:", e);
      content.text = (content.text || "") + "\n\nError: Could not display data table due to parsing error.";
    }
  }
  
  return {
    id: `bot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    sender: 'bot',
    content: content,
    timestamp: new Date().toISOString(),
  };
}

export async function processUserMessage(
  userInput: string
): Promise<Message> {
  const apiUrl = 'http://127.0.0.1:8080/text-to-sql'; // Updated API URL

  const requestBody = {
    query: userInput, // Simplified request body
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json', // Updated headers
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error:', response.status, errorBody);
      return createBotMessage({ answer: `Error from BankerAI API: ${response.status} - ${errorBody || 'Failed to get response'}`});
    }

    const responseData = await response.json();
    
    // Assuming the new API returns `answer`, `sql_query`, `dataframe` as per the example response.
    // createBotMessage is designed to handle these fields.
    return createBotMessage(responseData);

  } catch (error) {
    console.error('Network or other error calling bot API:', error);
    let errorMessage = 'An error occurred while contacting the BankerAI service.';
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    return createBotMessage({ answer: errorMessage });
  }
}
