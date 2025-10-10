import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ImageIcon, Sparkles, Download, Gift } from 'lucide-react'
import { IMAGE_STYLES } from '@/lib/image-gen'
import Image from 'next/image'

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

        {/* Features Section - 展示四种风格 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose MochiFace?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {IMAGE_STYLES.slice(0, 4).map((style) => (
              <Card key={style.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative h-56 w-full bg-gray-100">
                  <Image
                    src={style.thumbnail}
                    alt={style.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    priority={false}
                  />
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-semibold">{style.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 leading-relaxed">
                    {style.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
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