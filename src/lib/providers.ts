/**
 * Real API integrations for all LLM providers
 */

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  defaultHeaders: (apiKey: string) => Record<string, string>;
  validateKey: (apiKey: string) => Promise<{ isValid: boolean; models?: string[] }>;
  fetchModels: (apiKey: string) => Promise<string[]>;
}

// OpenRouter API Integration
const openRouterProvider: ProviderConfig = {
  id: 'openrouter',
  name: 'OpenRouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  defaultHeaders: (apiKey: string) => ({
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'MakeItHeavy Multi-Agent System'
  }),
  validateKey: async (apiKey: string) => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const models = await openRouterProvider.fetchModels(apiKey);
        return { isValid: true, models };
      }
      return { isValid: false };
    } catch (error) {
      console.error('OpenRouter validation error:', error);
      return { isValid: false };
    }
  },
  fetchModels: async (apiKey: string) => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: openRouterProvider.defaultHeaders(apiKey)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.map((model: any) => model.id) || [];
      }
      return [];
    } catch (error) {
      console.error('OpenRouter models fetch error:', error);
      return [];
    }
  }
};

// OpenAI API Integration
const openAIProvider: ProviderConfig = {
  id: 'openai',
  name: 'OpenAI',
  baseUrl: 'https://api.openai.com/v1',
  defaultHeaders: (apiKey: string) => ({
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }),
  validateKey: async (apiKey: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: openAIProvider.defaultHeaders(apiKey)
      });
      
      if (response.ok) {
        const models = await openAIProvider.fetchModels(apiKey);
        return { isValid: true, models };
      }
      return { isValid: false };
    } catch (error) {
      console.error('OpenAI validation error:', error);
      return { isValid: false };
    }
  },
  fetchModels: async (apiKey: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: openAIProvider.defaultHeaders(apiKey)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.map((model: any) => model.id).filter((id: string) => 
          id.includes('gpt') || id.includes('o1') || id.includes('o3')
        ) || [];
      }
      return [];
    } catch (error) {
      console.error('OpenAI models fetch error:', error);
      return [];
    }
  }
};

// Anthropic API Integration
const anthropicProvider: ProviderConfig = {
  id: 'anthropic',
  name: 'Anthropic',
  baseUrl: 'https://api.anthropic.com/v1',
  defaultHeaders: (apiKey: string) => ({
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01'
  }),
  validateKey: async (apiKey: string) => {
    // Anthropic doesn't have a models endpoint, so we'll validate with a test message
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: anthropicProvider.defaultHeaders(apiKey),
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Test' }]
        })
      });
      
      if (response.status === 200 || response.status === 400) {
        // 400 can be due to invalid request format, but key is valid
        const models = await anthropicProvider.fetchModels(apiKey);
        return { isValid: true, models };
      }
      return { isValid: false };
    } catch (error) {
      console.error('Anthropic validation error:', error);
      return { isValid: false };
    }
  },
  fetchModels: async (apiKey: string) => {
    // Return known Anthropic models since they don't have a models endpoint
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229', 
      'claude-3-haiku-20240307',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022'
    ];
  }
};

// Groq API Integration
const groqProvider: ProviderConfig = {
  id: 'groq',
  name: 'Groq',
  baseUrl: 'https://api.groq.com/openai/v1',
  defaultHeaders: (apiKey: string) => ({
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }),
  validateKey: async (apiKey: string) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: groqProvider.defaultHeaders(apiKey)
      });
      
      if (response.ok) {
        const models = await groqProvider.fetchModels(apiKey);
        return { isValid: true, models };
      }
      return { isValid: false };
    } catch (error) {
      console.error('Groq validation error:', error);
      return { isValid: false };
    }
  },
  fetchModels: async (apiKey: string) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: groqProvider.defaultHeaders(apiKey)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.map((model: any) => model.id) || [];
      }
      return [];
    } catch (error) {
      console.error('Groq models fetch error:', error);
      return [];
    }
  }
};

// DeepSeek API Integration
const deepSeekProvider: ProviderConfig = {
  id: 'deepseek',
  name: 'DeepSeek',
  baseUrl: 'https://api.deepseek.com/v1',
  defaultHeaders: (apiKey: string) => ({
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }),
  validateKey: async (apiKey: string) => {
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: deepSeekProvider.defaultHeaders(apiKey)
      });
      
      if (response.ok) {
        const models = await deepSeekProvider.fetchModels(apiKey);
        return { isValid: true, models };
      }
      return { isValid: false };
    } catch (error) {
      console.error('DeepSeek validation error:', error);
      return { isValid: false };
    }
  },
  fetchModels: async (apiKey: string) => {
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: deepSeekProvider.defaultHeaders(apiKey)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.map((model: any) => model.id) || [];
      }
      return [];
    } catch (error) {
      console.error('DeepSeek models fetch error:', error);
      return [];
    }
  }
};

export const providers: Record<string, ProviderConfig> = {
  openrouter: openRouterProvider,
  openai: openAIProvider,
  anthropic: anthropicProvider,
  groq: groqProvider,
  deepseek: deepSeekProvider
};

export async function validateApiKey(provider: string, apiKey: string): Promise<{ isValid: boolean; models?: string[] }> {
  const providerConfig = providers[provider];
  if (!providerConfig) {
    return { isValid: false };
  }
  
  return await providerConfig.validateKey(apiKey);
}

export async function fetchModelsForProvider(provider: string, apiKey: string): Promise<string[]> {
  const providerConfig = providers[provider];
  if (!providerConfig) {
    return [];
  }
  
  return await providerConfig.fetchModels(apiKey);
}