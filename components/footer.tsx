import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="MochiFace Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold">MochiFace</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              AI-powered image generation platform that transforms your photos into stunning artistic styles. 
              Create unique avatars and artwork with our advanced AI technology.
            </p>
            <div className="text-sm text-gray-400">
              © 2024 MochiFace. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-gray-300 hover:text-white transition-colors">
                  Generate
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-gray-300 hover:text-white transition-colors">
                  Rewards
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@mochiface.com" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              Built with Next.js, Supabase, and Google Gemini AI
            </div>
            <div className="text-sm text-gray-400">
              Last updated: December 2024
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
