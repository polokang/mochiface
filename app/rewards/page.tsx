'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Gift, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function RewardsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [credits, setCredits] = useState<number | null>(null)
  const [taskInProgress, setTaskInProgress] = useState(false)
  const [taskCompleted, setTaskCompleted] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      fetchCredits()
    }
  }, [user])

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits/me')
      if (response.ok) {
        const data = await response.json()
        setCredits(data.points)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    }
  }

  const startRewardTask = async () => {
    setTaskInProgress(true)
    setError('')
    setSuccess('')

    try {
      // 生成奖励任务证明
      const response = await fetch('/api/rewards/generate-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskType: 'video_watch'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // 模拟观看视频任务（实际项目中这里会播放真实的视频）
        setTimeout(() => {
          completeRewardTask(data.proof)
        }, 10000) // 10秒后完成任务
      } else {
        setError(data.error || 'Failed to start task')
        setTaskInProgress(false)
      }
    } catch (error) {
      setError('Failed to start task, please try again')
      setTaskInProgress(false)
    }
  }

  const completeRewardTask = async (proof: string) => {
    try {
      const response = await fetch('/api/credits/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proof }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Congratulations! You earned 1 credit')
        setTaskCompleted(true)
        setTaskInProgress(false)
        fetchCredits() // Refresh credits
      } else {
        setError(data.error || 'Task completion failed')
        setTaskInProgress(false)
      }
    } catch (error) {
      setError('Task completion failed, please try again')
      setTaskInProgress(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Get Credits
            </h1>
            <p className="text-gray-600">
              Complete tasks to earn credits for generating more stylized avatars
            </p>
          </div>

          {/* 当前积分 */}
          {credits !== null && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Current Credits</h3>
                  <p className="text-4xl font-bold text-blue-600">{credits}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 奖励任务 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="mr-2 h-5 w-5" />
                Watch Video to Earn Credits
              </CardTitle>
              <CardDescription>
                Watch a short introduction video and earn 1 credit upon completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    MochiFace Feature Introduction
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Learn how to use MochiFace to generate unique stylized avatars
                  </p>
                  <p className="text-sm text-gray-500">
                    Estimated viewing time: 30 seconds
                  </p>
                </div>

                {taskInProgress && (
                  <div className="flex items-center justify-center space-x-2 text-blue-600 bg-blue-50 p-4 rounded-lg">
                    <Clock className="h-5 w-5 animate-spin" />
                    <span>Playing video, please wait...</span>
                  </div>
                )}

                {taskCompleted && (
                  <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span>Task completed! Credits have been awarded</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span>{success}</span>
                  </div>
                )}

                <Button
                  onClick={startRewardTask}
                  disabled={taskInProgress || taskCompleted}
                  className="w-full"
                >
                  {taskInProgress ? 'Task in progress...' : taskCompleted ? 'Task completed' : 'Start watching video'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 其他获取积分的方式 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Other Ways to Get Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">New User Registration</h4>
                    <p className="text-sm text-gray-600">Get 3 credits upon registration</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Gift className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Complete Reward Tasks</h4>
                    <p className="text-sm text-gray-600">Watch videos to earn 1 credit</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 返回按钮 */}
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Back to My Works
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
