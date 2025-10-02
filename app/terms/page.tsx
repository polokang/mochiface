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
              Terms of Service
            </h1>
            <p className="text-gray-600">
              Last updated: December 2024
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                MochiFace is an AI-powered image generation platform that provides users with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI-driven image stylization services</li>
                <li>Multiple artistic style options</li>
                <li>User account management and credit system</li>
                <li>Image upload, processing, and download functionality</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>2.1 Account Registration</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must provide true, accurate, and complete information</li>
                <li>You are responsible for maintaining the accuracy of account information</li>
                <li>One user can only register one account</li>
                <li>You must be at least 13 years old to use our service</li>
              </ul>
              
              <p><strong>2.2 Account Security</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are responsible for protecting account passwords and login information</li>
                <li>You are responsible for all activities under your account</li>
                <li>Unauthorized use should be reported to us immediately</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Usage Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>3.1 Permitted Use</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Personal, non-commercial image generation</li>
                <li>Compliance with all applicable laws and regulations</li>
                <li>Respect for others' intellectual property rights</li>
              </ul>
              
              <p><strong>3.2 Prohibited Use</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Uploading illegal, harmful, threatening, defamatory, or harassing content</li>
                <li>Uploading materials that infringe on others' intellectual property</li>
                <li>Attempting to hack, reverse engineer, or interfere with the service</li>
                <li>Using automated tools or bots</li>
                <li>Generating illegal, harmful, or inappropriate content</li>
                <li>Unauthorized commercial use</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Credit System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>4.1 Credit Acquisition</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>New users receive 3 free credits upon registration</li>
                <li>Complete reward tasks to earn additional credits</li>
                <li>Credits are non-transferable and non-sellable</li>
              </ul>
              
              <p><strong>4.2 Credit Usage</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Each image generation consumes 1 credit</li>
                <li>Generation service unavailable when credits are insufficient</li>
                <li>Credits are non-refundable</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>5.1 User Content</strong></p>
              <p>
                You retain all rights to uploaded images. By uploading content, you grant us necessary licenses to provide services and generate new content.
              </p>
              
              <p><strong>5.2 Generated Content</strong></p>
              <p>
                For content generated using our AI service, you have usage rights, subject to the following restrictions:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Personal, non-commercial use only</li>
                <li>Not for illegal or harmful purposes</li>
                <li>Cannot claim as original work</li>
              </ul>
              
              <p><strong>5.3 Platform Rights</strong></p>
              <p>
                Our service, software, trademarks, and all related content are protected by intellectual property laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We strive to maintain high service availability but do not guarantee:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Service will not be interrupted or error-free</li>
                <li>All features will always be available</li>
                <li>Generated results will meet specific requirements</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or terminate the service at any time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To the maximum extent permitted by law, our service is provided "as is" without any express or implied warranties, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Accuracy, reliability, or completeness of the service</li>
                <li>Quality or suitability of generated content</li>
                <li>Service will be uninterrupted or error-free</li>
                <li>Absence of viruses or other harmful components</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                In no event shall we be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data loss, or business interruption</li>
                <li>Damages caused by user-generated or used content</li>
                <li>Issues with third-party services</li>
              </ul>
              <p className="mt-4">
                Our total liability shall not exceed the amount you paid to us in the past 12 months.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>9.1 User Termination</strong></p>
              <p>You may stop using our service and delete your account at any time.</p>
              
              <p><strong>9.2 Our Termination</strong></p>
              <p>We may suspend or terminate your account in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violation of these Terms of Service</li>
                <li>Long-term inactivity</li>
                <li>Legal requirements</li>
                <li>Other reasonable reasons</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Disputes arising from these Terms of Service shall be resolved through friendly negotiation. 
                If negotiation fails, disputes shall be submitted to the competent court in our jurisdiction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Terms Modification</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We reserve the right to modify these Terms of Service at any time. Significant changes will be communicated through website notifications or email.
                Continued use of the service indicates your acceptance of the modified terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have any questions about these Terms of Service, please contact us through:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email</strong>: legal@mochiface.com</p>
                <p><strong>Website</strong>: www.mochiface.com</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>These Terms of Service are effective as of December 2024</p>
          </div>
        </div>
      </main>
    </div>
  )
}
