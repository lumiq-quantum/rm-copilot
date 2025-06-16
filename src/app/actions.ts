// @ts-nocheck
// Disabling TypeScript check for this file due to Genkit flow interactions potentially not being fully typed in this context.
'use server';

import {AIMessageContent, Message } from '@/types';
import { customerSummary } from '@/ai/flows/customer-summary';
import { generateCharts } from '@/ai/flows/generate-charts';
import { sqlReasoning } from '@/ai/flows/sql-reasoning';

function createBotMessage(content: AIMessageContent): Message {
  return {
    id: `bot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    sender: 'bot',
    content,
    timestamp: new Date().toISOString(),
  };
}

export async function processUserMessage(
  _conversationId: string, // Not used in this mock, but good for future state
  _userId: string, // Not used in this mock
  userInput: string
): Promise<Message> {
  const lowerInput = userInput.toLowerCase();

  try {
    if (lowerInput.includes('chart') || lowerInput.includes('visualize') || lowerInput.includes('plot')) {
      // Simulate fetching customer data and converting to data URI
      const csvData = "category,value\nSales,120\nMarketing,80\nDevelopment,150\nSupport,60";
      const base64Csv = Buffer.from(csvData).toString('base64');
      const customerDataUri = `data:text/csv;base64,${base64Csv}`;
      
      const chartResponse = await generateCharts({
        customerData: customerDataUri,
        question: userInput,
      });
      
      return createBotMessage({
        text: chartResponse.reasoning,
        chart: chartResponse.chart?.url ? { url: chartResponse.chart.url, altText: chartResponse.chart.altText } : undefined,
      });

    } else if (lowerInput.includes('sql') || lowerInput.includes('database') || lowerInput.includes('query detail')) {
      // Simulate SQL query generation and execution
      const mockSqlQuery = `SELECT * FROM customers WHERE name LIKE '%${userInput.split(' ').pop()}%' LIMIT 1;`;
      const mockDatabaseSchema = `
        CREATE TABLE customers (
          id INTEGER PRIMARY KEY,
          name TEXT,
          email TEXT,
          total_spend REAL
        );
        CREATE TABLE transactions (
          id INTEGER PRIMARY KEY,
          customer_id INTEGER,
          amount REAL,
          date TEXT,
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        );
      `;
      const mockQueryResult = JSON.stringify([{ id: 1, name: 'John Doe', email: 'john.doe@example.com', total_spend: 1250.75 }]);
      
      const sqlResponse = await sqlReasoning({
        question: userInput,
        sqlQuery: mockSqlQuery,
        databaseSchema: mockDatabaseSchema,
        queryResult: mockQueryResult,
      });

      return createBotMessage({
        text: sqlResponse.answer,
        sqlInfo: {
          query: sqlResponse.sqlQuery,
          reasoning: sqlResponse.reasoning,
        },
      });

    } else if (lowerInput.includes('summary for customer') || lowerInput.includes('tell me about customer')) {
      const customerIdMatch = lowerInput.match(/customer\s+(\w+)/);
      const customerId = customerIdMatch ? customerIdMatch[1] : 'unknown';

      const summaryResponse = await customerSummary({ customerId });
      return createBotMessage({ text: summaryResponse.summary });
    
    } else {
      // Generic response or use a default flow
      // For simplicity, let's use a modified customerSummary or a generic text response
      if (lowerInput.startsWith("who is") || lowerInput.startsWith("what is")) {
         return createBotMessage({ text: `I'm sorry, I can only provide information about customers. For general queries, please consult other resources.` });
      }
      const summaryResponse = await customerSummary({ customerId: 'generic_customer_id_for_general_query' });
      let responseText = `Regarding your query: "${userInput}", here's a general customer insight: ${summaryResponse.summary}`;
      if (summaryResponse.summary.length < 20) { // if summary is too short/generic
        responseText = `I can help with specific customer inquiries, charts, or SQL explanations. For example, try "Show me a chart of transactions" or "What is the SQL query for customer balance?" Your query: "${userInput}".`;
      }
      return createBotMessage({ text: responseText });
    }
  } catch (error) {
    console.error('AI flow error:', error);
    let errorMessage = 'An error occurred while processing your request.';
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    return createBotMessage({ text: `I apologize, but I encountered an issue. ${errorMessage}` });
  }
}
