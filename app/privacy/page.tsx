'use client'

import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              Last updated: December 2024
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Information Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We collect information you voluntarily provide, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Username and email address provided during registration</li>
                <li>Uploaded image files</li>
                <li>Generation records created when using our services</li>
                <li>Information provided when communicating with our customer service team</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Information Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use the collected information for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing and improving our AI image generation services</li>
                <li>Processing your account and transactions</li>
                <li>Communicating with you about service-related matters</li>
                <li>Analyzing usage patterns to optimize user experience</li>
                <li>Complying with legal and regulatory requirements</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Storage and Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We employ industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Using HTTPS encryption for data transmission</li>
                <li>Regular backup and security system updates</li>
                <li>Restricting employee access permissions</li>
                <li>Using reliable cloud service providers (Supabase)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We do not sell, trade, or transfer your personal information to third parties, except when:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We have your explicit consent</li>
                <li>Required by law or court order</li>
                <li>Protecting our rights, property, or safety</li>
                <li>Working with trusted service providers (such as cloud storage services)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Our service integrates the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Supabase</strong>: For user authentication and data storage</li>
                <li><strong>Google OAuth</strong>: For third-party login</li>
                <li><strong>Google Gemini API</strong>: For AI image generation</li>
                <li><strong>Vercel</strong>: For website hosting</li>
              </ul>
              <p className="text-sm text-gray-600">
                These third-party services have their own privacy policies, and we recommend you review their terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and view information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Restrict or object to certain information processing activities</li>
                <li>Data portability (where technically feasible)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your login status</li>
                <li>Save your preference settings</li>
                <li>Analyze website usage</li>
                <li>Provide personalized experience</li>
              </ul>
              <p className="text-sm text-gray-600">
                You can manage cookie preferences through your browser settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Our service is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13.
                If we discover that we have collected such information, we will delete it immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We may update this privacy policy from time to time. Significant changes will be communicated through website notifications or email.
                Continued use of our service indicates your acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have any questions about this privacy policy or need to exercise your rights, please contact us through:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email</strong>: privacy@mochiface.com</p>
                <p><strong>Website</strong>: www.mochiface.com</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>This privacy policy is effective as of December 2024</p>
          </div>
        </div>
      </main>
    </div>
  )
}
