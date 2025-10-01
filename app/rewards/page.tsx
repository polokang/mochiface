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
        setError(data.error || '启动任务失败')
        setTaskInProgress(false)
      }
    } catch (error) {
      setError('启动任务失败，请重试')
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
        setSuccess('恭喜！你获得了 1 积分')
        setTaskCompleted(true)
        setTaskInProgress(false)
        fetchCredits() // 刷新积分
      } else {
        setError(data.error || '任务完成失败')
        setTaskInProgress(false)
      }
    } catch (error) {
      setError('任务完成失败，请重试')
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
              获取积分
            </h1>
            <p className="text-gray-600">
              完成任务获得积分，用于生成更多风格化头像
            </p>
          </div>

          {/* 当前积分 */}
          {credits !== null && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">当前积分</h3>
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
                观看视频获得积分
              </CardTitle>
              <CardDescription>
                观看一段简短的介绍视频，完成后可获得 1 积分
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    MochiFace 功能介绍
                  </h3>
                  <p className="text-gray-600 mb-4">
                    了解如何使用 MochiFace 生成独特的风格化头像
                  </p>
                  <p className="text-sm text-gray-500">
                    预计观看时间: 30 秒
                  </p>
                </div>

                {taskInProgress && (
                  <div className="flex items-center justify-center space-x-2 text-blue-600 bg-blue-50 p-4 rounded-lg">
                    <Clock className="h-5 w-5 animate-spin" />
                    <span>正在播放视频，请稍候...</span>
                  </div>
                )}

                {taskCompleted && (
                  <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span>任务完成！积分已发放</span>
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
                  {taskInProgress ? '任务进行中...' : taskCompleted ? '任务已完成' : '开始观看视频'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 其他获取积分的方式 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>其他获取积分的方式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">新用户注册</h4>
                    <p className="text-sm text-gray-600">注册即送 3 积分</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Gift className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">完成奖励任务</h4>
                    <p className="text-sm text-gray-600">观看视频获得 1 积分</p>
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
              返回我的作品
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
