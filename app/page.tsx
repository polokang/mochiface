import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ImageIcon, Sparkles, Download, Gift } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Make Your Avatar
            <span className="text-blue-600"> More Fun</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your avatar, choose your favorite style, and AI will generate unique stylized avatars for you.
            Support for multiple artistic styles to make your avatar stand out from the crowd.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" className="text-lg px-8 py-6">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Generating
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Free Registration
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose MochiFace?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Multiple Styles</CardTitle>
                <CardDescription>
                  Offers cartoon, anime, watercolor, vintage and other artistic styles to meet different preferences
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>High Quality Output</CardTitle>
                <CardDescription>
                  Uses advanced AI technology to generate high-resolution, high-quality stylized avatars
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Credit System</CardTitle>
                <CardDescription>
                  New users get 3 free credits, complete tasks to earn more credits, cost-effective
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How to Use?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Avatar</h3>
              <p className="text-gray-600">
                Choose a clear portrait photo, supports JPG, PNG, WebP formats
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Style</h3>
              <p className="text-gray-600">
                Choose your favorite from various artistic styles and preview the effect
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate & Download</h3>
              <p className="text-gray-600">
                AI automatically generates stylized avatars, download high-definition images when complete
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Register now, get 3 free credits, and start your avatar stylization journey!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                Free Registration
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Already have an account? Login
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}