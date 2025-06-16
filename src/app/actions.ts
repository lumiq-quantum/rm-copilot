
// @ts-nocheck
// Disabling TypeScript check for this file due to diverse API interaction needs.
'use server';

import type { AIMessageContent, Message } from '@/types';

// Helper to format messages for the API
function formatMessagesForApi(messages: Message[]): Array<{ role: 'user' | 'assistant'; content: Array<{ text: string }> }> {
  return messages
    .map(msg => {
      let apiRole: 'user' | 'assistant';
      let textContent: string | undefined;

      if (msg.sender === 'user') {
        apiRole = 'user';
        // User message content is directly a string
        textContent = msg.content as string;
      } else { // bot
        apiRole = 'assistant';
        // Bot message content is an AIMessageContent object
        // Ensure to handle cases where content might not be in the expected AIMessageContent structure
        if (typeof msg.content === 'string') {
            textContent = msg.content; 
        } else if (msg.content && typeof msg.content === 'object' && 'text' in msg.content) {
            textContent = (msg.content as AIMessageContent).text;
        }
      }

      // Only include messages that have text content
      // and are not the initial placeholder bot message
      if (textContent && !msg.id.startsWith('msg-init-')) {
        return {
          role: apiRole,
          content: [{ text: textContent }],
        };
      }
      return null; // This message will be filtered out
    })
    .filter(msg => msg !== null) as Array<{ role: 'user' | 'assistant'; content: Array<{ text: string }> }>;
}


function createBotMessage(responseData: any): Message {
  const content: AIMessageContent = {};

  if (responseData && typeof responseData.answer === 'string') {
    content.text = responseData.answer;
  } else if (responseData && typeof responseData.response === 'string') { // Fallback for previous structure
    content.text = responseData.response;
  } else {
    content.text = 'Received an unexpected response format from BankerAI.';
  }

  if (responseData.sql_query) {
    content.sqlInfo = { query: responseData.sql_query };
  }

  if (responseData.dataframe) {
    try {
      const parsedData = JSON.parse(responseData.dataframe);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        content.tableData = parsedData;
      } else if (parsedData) { // Handle if dataframe is a single object (though array is expected)
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
  _conversationId: string, 
  _userId: string, 
  userInput: string,
  chatHistory: Message[] // Historical messages before the current userInput
): Promise<Message> {
  const apiUrl = 'https://s7fusrae5g.execute-api.us-east-1.amazonaws.com/prod/invoke';
  const apiKey = '0GC39oZvif6jbX5MHFwSZ6QQ1vy6y1mY5D1kCEgK';

  // Format the historical messages for the API
  const apiMessages = formatMessagesForApi(chatHistory);
  
  const requestBody = {
    user_persona: "admin",
    user_query: userInput, // The current user's direct query
    sql_model_id: "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    chat_model_id: "us.anthropic.claude-3-5-haiku-20241022-v1:0",
    embedding_model_id: "cohere.embed-multilingual-v3",
    approach: "few_shot",
    db_conn_conf: {
        db_type: "redshift",
        host: "data-analyst-workgroup.203918850931.us-east-1.redshift-serverless.amazonaws.com",
        user: "demo",
        password: "Elitebook123",
        database: "student_club",
        port: 5439
    },
    metadata: {
        s3_bucket_name: "data-analyst-v2-bucket-203918850931",
        is_meta: true,
        table_meta: "schema/student_club_tables.xlsx",
        column_meta: "schema/student_club_columns.xlsx",
        metric_meta: "schema/student_club_metrics.xlsx",
        table_access": null
    },
    messages: apiMessages, // History before the current user_query
    session: "new" 
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error:', response.status, errorBody);
      return createBotMessage({ answer: `Error from BankerAI API: ${response.status} - ${errorBody || 'Failed to get response'}`});
    }

    const responseData = await response.json();
    
    // The API response now has "answer", "sql_query", "dataframe" etc.
    if (responseData && (responseData.answer || responseData.response)) {
      return createBotMessage(responseData);
    } else {
      console.error('API Error: Unexpected response format', responseData);
      return createBotMessage({ answer: 'Received an unexpected response format from BankerAI.' });
    }

  } catch (error) {
    console.error('Network or other error calling bot API:', error);
    let errorMessage = 'An error occurred while contacting the BankerAI service.';
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    return createBotMessage({ answer: errorMessage });
  }
}

