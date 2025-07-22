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
   * Start a new orchestration task (frontend simulation)
   */
  async startOrchestration(query: string, apiKeys: Record<string, string>): Promise<{ taskId: string }> {
    // Generate a unique task ID for simulation
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the task for simulation
    this.simulatedTasks.set(taskId, {
      query,
      apiKeys,
      startTime: new Date().toISOString(),
      status: 'initializing',
      agents: this.getDefaultAgents().map(agent => ({
        agentId: agent.id,
        status: 'queued' as const,
        progress: 0
      }))
    });

    return { taskId };
  }

  private simulatedTasks = new Map<string, any>();
  
  private getDefaultAgents() {
    return [
      { id: 'researcher', name: 'Research Agent' },
      { id: 'analyzer', name: 'Analysis Agent' },
      { id: 'synthesizer', name: 'Synthesis Agent' },
      { id: 'validator', name: 'Validation Agent' }
    ];
  }

  /**
   * Get the current status of an orchestration task (simulation)
   */
  async getOrchestrationStatus(taskId: string): Promise<OrchestrationStatus> {
    const task = this.simulatedTasks.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Simulate progress
    const elapsedTime = Date.now() - new Date(task.startTime).getTime();
    const progressStep = Math.min(elapsedTime / 100, 100); // Faster progression

    task.agents.forEach((agent: any, index: number) => {
      const agentDelay = index * 1000; // Stagger agent starts
      if (elapsedTime > agentDelay) {
        const agentProgress = Math.min((elapsedTime - agentDelay) / 50, 100);
        agent.progress = agentProgress;
        
        if (agentProgress < 30) {
          agent.status = 'initializing';
        } else if (agentProgress < 100) {
          agent.status = 'processing';
        } else {
          agent.status = 'completed';
          agent.output = `${this.getDefaultAgents()[index]?.name} completed analysis for: "${task.query}"`;
        }
      }
    });

    const allCompleted = task.agents.every((a: any) => a.status === 'completed');
    
    return {
      isRunning: !allCompleted,
      startTime: task.startTime,
      elapsedTime: Math.floor(elapsedTime / 1000),
      agents: task.agents,
      error: undefined
    };
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
   * Validate API keys using real provider APIs
   */
  async validateApiKey(provider: string, apiKey: string): Promise<{ isValid: boolean; models?: string[] }> {
    // Import dynamically to avoid circular dependencies
    const { validateApiKey } = await import('./providers');
    return validateApiKey(provider, apiKey);
  }

  /**
   * Get available models for a provider using real API
   */
  async getAvailableModels(provider: string, apiKey: string): Promise<string[]> {
    // Import dynamically to avoid circular dependencies
    const { fetchModelsForProvider } = await import('./providers');
    return fetchModelsForProvider(provider, apiKey);
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