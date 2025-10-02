'use client'

import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              服务条款
            </h1>
            <p className="text-gray-600">
              最后更新日期：2024年12月
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. 服务描述</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                MochiFace 是一个基于人工智能的图片生成平台，为用户提供：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI 驱动的图片风格化服务</li>
                <li>多种艺术风格选择</li>
                <li>用户账户管理和积分系统</li>
                <li>图片上传、处理和下载功能</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. 用户账户</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>2.1 账户注册</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>您必须提供真实、准确、完整的信息</li>
                <li>您有责任维护账户信息的准确性</li>
                <li>一个用户只能注册一个账户</li>
                <li>您必须年满13岁才能使用我们的服务</li>
              </ul>
              
              <p><strong>2.2 账户安全</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>您有责任保护账户密码和登录信息</li>
                <li>您对账户下发生的所有活动负责</li>
                <li>发现未授权使用应立即通知我们</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. 使用规则</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>3.1 允许的使用</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>个人非商业用途的图片生成</li>
                <li>遵守所有适用的法律法规</li>
                <li>尊重他人的知识产权</li>
              </ul>
              
              <p><strong>3.2 禁止的使用</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>上传违法、有害、威胁、诽谤、骚扰的内容</li>
                <li>上传侵犯他人知识产权的材料</li>
                <li>尝试破解、逆向工程或干扰服务</li>
                <li>使用自动化工具或机器人</li>
                <li>生成非法、有害或不当内容</li>
                <li>商业用途未经授权使用</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. 积分系统</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>4.1 积分获取</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>新用户注册获得3个免费积分</li>
                <li>完成奖励任务可获得额外积分</li>
                <li>积分不可转让或出售</li>
              </ul>
              
              <p><strong>4.2 积分使用</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>每次图片生成消耗1个积分</li>
                <li>积分不足时无法使用生成服务</li>
                <li>积分不可退款</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. 知识产权</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>5.1 用户内容</strong></p>
              <p>
                您保留对上传图片的所有权利。通过上传内容，您授予我们必要的许可来提供服务和生成新内容。
              </p>
              
              <p><strong>5.2 生成内容</strong></p>
              <p>
                使用我们的AI服务生成的内容，您拥有使用权，但需遵守以下限制：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>仅限个人非商业用途</li>
                <li>不得用于违法或有害目的</li>
                <li>不得声称是原创作品</li>
              </ul>
              
              <p><strong>5.3 平台权利</strong></p>
              <p>
                我们的服务、软件、商标和所有相关内容受知识产权法保护。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. 服务可用性</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                我们努力保持服务的高可用性，但不保证：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>服务不会中断或出错</li>
                <li>所有功能始终可用</li>
                <li>生成结果满足特定要求</li>
              </ul>
              <p>
                我们保留随时修改、暂停或终止服务的权利。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. 免责声明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                在法律允许的最大范围内，我们的服务按"现状"提供，不提供任何明示或暗示的保证，包括但不限于：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>服务的准确性、可靠性或完整性</li>
                <li>生成内容的质量或适用性</li>
                <li>服务不会中断或无错误</li>
                <li>病毒或其他有害组件的缺失</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. 责任限制</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                在任何情况下，我们都不对以下情况承担责任：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>间接、偶然、特殊或后果性损害</li>
                <li>利润损失、数据丢失或业务中断</li>
                <li>用户生成或使用的内容造成的损害</li>
                <li>第三方服务的问题</li>
              </ul>
              <p className="mt-4">
                我们的总责任不超过您在过去12个月内支付给我们的费用。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. 账户终止</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>9.1 用户终止</strong></p>
              <p>您可以随时停止使用我们的服务并删除账户。</p>
              
              <p><strong>9.2 我们终止</strong></p>
              <p>我们可以在以下情况下暂停或终止您的账户：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>违反本服务条款</li>
                <li>长期不活跃</li>
                <li>法律要求</li>
                <li>其他合理原因</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. 争议解决</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                因本服务条款产生的争议应通过友好协商解决。如协商不成，
                应提交至我们所在地有管辖权的人民法院解决。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. 条款修改</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                我们保留随时修改本服务条款的权利。重大修改将通过网站通知或邮件告知。
                继续使用服务即表示您接受修改后的条款。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. 联系我们</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                如果您对本服务条款有任何疑问，请通过以下方式联系我们：
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>邮箱</strong>：legal@mochiface.com</p>
                <p><strong>网站</strong>：www.mochiface.com</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>本服务条款自2024年12月起生效</p>
          </div>
        </div>
      </main>
    </div>
  )
}
