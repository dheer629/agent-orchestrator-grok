/**
 * Centralized model management and fetching
 */

import { fetchModelsForProvider as fetchProviderModels } from './providers';

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  costPer1k: number;
  speed: "fast" | "medium" | "slow";
  quality: "high" | "medium" | "low";
  description?: string;
}

// Static model definitions with real-world data
const STATIC_MODELS: Model[] = [
  // OpenRouter models
  {
    id: 'openrouter/anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'openrouter',
    contextLength: 200000,
    costPer1k: 0.015,
    speed: 'slow',
    quality: 'high',
    description: 'Most capable model for complex reasoning'
  },
  {
    id: 'openrouter/anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet', 
    provider: 'openrouter',
    contextLength: 200000,
    costPer1k: 0.003,
    speed: 'medium',
    quality: 'high',
    description: 'Balanced performance and cost'
  },
  {
    id: 'openrouter/openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    contextLength: 128000,
    costPer1k: 0.005,
    speed: 'medium',
    quality: 'high',
    description: 'Latest OpenAI model with vision'
  },
  {
    id: 'openrouter/meta-llama/llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'openrouter',
    contextLength: 8192,
    costPer1k: 0.0009,
    speed: 'fast',
    quality: 'medium',
    description: 'Fast open-source model'
  },
  
  // OpenAI direct models
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextLength: 128000,
    costPer1k: 0.005,
    speed: 'medium',
    quality: 'high',
    description: 'Latest OpenAI flagship model'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    contextLength: 128000,
    costPer1k: 0.00015,
    speed: 'fast',
    quality: 'medium',
    description: 'Affordable intelligence'
  },
  
  // Anthropic direct models
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    contextLength: 200000,
    costPer1k: 0.015,
    speed: 'slow',
    quality: 'high',
    description: 'Most capable Anthropic model'
  },
  {
    id: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    contextLength: 200000,
    costPer1k: 0.003,
    speed: 'medium',
    quality: 'high',
    description: 'Balanced Claude model'
  },
  
  // DeepSeek models
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    contextLength: 32768,
    costPer1k: 0.00014,
    speed: 'fast',
    quality: 'medium',
    description: 'Affordable conversational AI'
  },
  {
    id: 'deepseek/deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    contextLength: 16384,
    costPer1k: 0.00014,
    speed: 'fast',
    quality: 'medium',
    description: 'Specialized coding model'
  },
  
  // Cohere models
  {
    id: 'cohere/command-r-plus',
    name: 'Command R+',
    provider: 'cohere',
    contextLength: 128000,
    costPer1k: 0.003,
    speed: 'medium',
    quality: 'high',
    description: 'Advanced reasoning and retrieval'
  },
  {
    id: 'cohere/command-r',
    name: 'Command R',
    provider: 'cohere',
    contextLength: 128000,
    costPer1k: 0.0005,
    speed: 'fast',
    quality: 'medium',
    description: 'Efficient command model'
  },
  
  // Groq models
  {
    id: 'groq/llama-3-8b',
    name: 'Llama 3 8B',
    provider: 'groq',
    contextLength: 8192,
    costPer1k: 0.0001,
    speed: 'fast',
    quality: 'medium',
    description: 'Ultra-fast inference'
  },
  {
    id: 'groq/mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    contextLength: 32768,
    costPer1k: 0.0003,
    speed: 'fast',
    quality: 'high',
    description: 'Fast mixture of experts'
  },
  
  // Hugging Face models
  {
    id: 'huggingface/mistral-7b',
    name: 'Mistral 7B',
    provider: 'huggingface',
    contextLength: 32768,
    costPer1k: 0.0002,
    speed: 'fast',
    quality: 'medium',
    description: 'Open-source efficiency'
  }
];

class ModelManager {
  private models: Model[] = STATIC_MODELS;
  private fetchPromises: Map<string, Promise<string[]>> = new Map();

  /**
   * Get all available models
   */
  getModels(): Model[] {
    return [...this.models];
  }

  /**
   * Get models for a specific provider
   */
  getModelsByProvider(provider: string): Model[] {
    return this.models.filter(model => model.provider === provider);
  }

  /**
   * Get model by ID
   */
  getModelById(id: string): Model | undefined {
    return this.models.find(model => model.id === id);
  }

  /**
   * Fetch available models from API and update internal list
   */
  async fetchModelsForProvider(provider: string, apiKey?: string): Promise<string[]> {
    // Avoid duplicate requests
    const cacheKey = `${provider}:${apiKey || 'default'}`;
    if (this.fetchPromises.has(cacheKey)) {
      return this.fetchPromises.get(cacheKey)!;
    }

    const fetchPromise = this.doFetchModels(provider, apiKey);
    this.fetchPromises.set(cacheKey, fetchPromise);

    try {
      const models = await fetchPromise;
      this.updateModelsFromApi(provider, models);
      return models;
    } finally {
      this.fetchPromises.delete(cacheKey);
    }
  }

  private async doFetchModels(provider: string, apiKey?: string): Promise<string[]> {
    try {
      if (apiKey) {
        const models = await fetchProviderModels(provider, apiKey);
        return models;
      }
      // Return static models as fallback when no API key
      return this.getModelsByProvider(provider).map(m => m.name);
    } catch (error) {
      console.warn(`Failed to fetch models for ${provider}:`, error);
      // Return static models as fallback
      return this.getModelsByProvider(provider).map(m => m.name);
    }
  }

  /**
   * Update models from API response
   */
  private updateModelsFromApi(provider: string, apiModels: string[]): void {
    // For now, we keep static models but this could be extended
    // to create dynamic models from API responses
    console.log(`Available models for ${provider}:`, apiModels);
  }

  /**
   * Add a custom model
   */
  addModel(model: Model): void {
    const existingIndex = this.models.findIndex(m => m.id === model.id);
    if (existingIndex >= 0) {
      this.models[existingIndex] = model;
    } else {
      this.models.push(model);
    }
  }

  /**
   * Remove a model
   */
  removeModel(id: string): void {
    this.models = this.models.filter(m => m.id !== id);
  }
}

// Create singleton instance
export const modelManager = new ModelManager();

// Helper functions
export function getModelsByProvider(provider: string): Model[] {
  return modelManager.getModelsByProvider(provider);
}

export function getModelById(id: string): Model | undefined {
  return modelManager.getModelById(id);
}

export async function fetchModelsForProvider(provider: string, apiKey?: string): Promise<string[]> {
  return modelManager.fetchModelsForProvider(provider, apiKey);
}
