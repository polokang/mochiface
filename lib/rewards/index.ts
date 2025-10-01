export interface RewardProvider {
  generateProof(userId: string, taskType: string): Promise<string>
  verifyProof(proof: string, userId: string): Promise<boolean>
}

export interface RewardTask {
  id: string
  type: string
  name: string
  description: string
  points: number
  duration?: number // Task duration (seconds)
}
