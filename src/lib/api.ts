/**
 * API client for connecting to the Python OpenRouter orchestrator backend
 */

export interface AgentProgress {
  agentId: string;
  status: 'queued' | 'initializing' | 'processing' | 'completed' | 'failed';
  progress: number;
  output?: string;
  error?: string;
}

export interface OrchestrationResult {
  query: string;
  totalTime: number;
  agentResults: Array<{
    agentId: string;
    agentName: string;
    content: string;
    metadata?: Record<string, any>;
  }>;
  metadata?: Record<string, any>;
}

export interface OrchestrationStatus {
  isRunning: boolean;
  startTime?: string;
  elapsedTime: number;
  agents: AgentProgress[];
  error?: string;
}

class PythonApiClient {
  private baseUrl: string;
  private abortController?: AbortController;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Start a new orchestration task
   */
  async startOrchestration(query: string, apiKeys: Record<string, string>): Promise<{ taskId: string }> {
    this.abortController = new AbortController();
    
    const response = await fetch(`${this.baseUrl}/orchestrate/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        apiKeys,
      }),
      signal: this.abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to start orchestration: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get the current status of an orchestration task
   */
  async getOrchestrationStatus(taskId: string): Promise<OrchestrationStatus> {
    const response = await fetch(`${this.baseUrl}/orchestrate/status/${taskId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get the results of a completed orchestration
   */
  async getOrchestrationResults(taskId: string): Promise<OrchestrationResult> {
    const response = await fetch(`${this.baseUrl}/orchestrate/results/${taskId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get results: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Stop a running orchestration
   */
  async stopOrchestration(taskId: string): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
    }

    const response = await fetch(`${this.baseUrl}/orchestrate/stop/${taskId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to stop orchestration: ${response.statusText}`);
    }
  }

  /**
   * Validate API keys
   */
  async validateApiKey(provider: string, apiKey: string): Promise<{ isValid: boolean; models?: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to validate API key: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // If Python API isn't available, do basic validation
      console.warn('Python API not available, using fallback validation');
      return this.fallbackValidateApiKey(provider, apiKey);
    }
  }

  /**
   * Fallback validation when Python API isn't available
   */
  private fallbackValidateApiKey(provider: string, apiKey: string): { isValid: boolean; models?: string[] } {
    // Basic key format validation
    const isValid = apiKey.length > 10 && 
                   (apiKey.startsWith('sk-') || 
                    apiKey.startsWith('or-') || 
                    apiKey.startsWith('claude-') ||
                    !!apiKey.match(/^[a-zA-Z0-9\-_]+$/));
    
    // Return mock models for each provider
    const modelMap: Record<string, string[]> = {
      openrouter: ['gpt-4o', 'claude-3-sonnet', 'llama-3-70b'],
      openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
      anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      deepseek: ['deepseek-chat', 'deepseek-coder']
    };

    return {
      isValid,
      models: isValid ? (modelMap[provider] || []) : []
    };
  }

  /**
   * Get available models for a provider
   */
  async getAvailableModels(provider: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/models/${provider}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get models: ${response.statusText}`);
    }

    const data = await response.json();
    return data.models || [];
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; version?: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Create singleton instance
export const apiClient = new PythonApiClient();

// Helper function to convert API status to app status
export function mapApiStatusToAppStatus(apiStatus: string): 'idle' | 'running' | 'complete' | 'error' {
  switch (apiStatus) {
    case 'queued':
    case 'initializing':
      return 'idle';
    case 'processing':
      return 'running';
    case 'completed':
      return 'complete';
    case 'failed':
      return 'error';
    default:
      return 'idle';
  }
}