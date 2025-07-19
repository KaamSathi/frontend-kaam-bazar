"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  location: string
  review: string
  avatar: string
  rating: number
  verified: boolean
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Homeowner",
    company: "Tech Professional",
    location: "Mumbai, Maharashtra",
    review: "Found a reliable plumber through KaamSathi. The worker was professional, completed the job on time, and the quality was excellent. Highly recommend!",
    avatar: "/images/avatars/priya-sharma.png",
    rating: 5,
    verified: true,
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Business Owner",
    company: "Restaurant Owner",
    location: "Delhi, NCR",
    review: "KaamSathi helped me find skilled workers for my restaurant renovation. The platform is easy to use and the workers were reliable. Great service!",
    avatar: "/images/avatars/rajesh-kumar.png",
    rating: 5,
    verified: true,
  },
  {
    id: 3,
    name: "Anita Gupta",
    role: "Homeowner",
    company: "Teacher",
    location: "Bangalore, Karnataka",
    review: "I needed help with house cleaning and found the perfect worker through KaamSathi. The process was smooth and the service was excellent.",
    avatar: "/images/avatars/anita-gupta.png",
    rating: 5,
    verified: true,
  },
  {
    id: 4,
    name: "Deepak Verma",
    role: "Property Manager",
    company: "Real Estate",
    location: "Pune, Maharashtra",
    review: "As a property manager, I regularly use KaamSathi to find maintenance workers. The platform is reliable and the workers are professional.",
    avatar: "/images/avatars/deepak-verma.png",
    rating: 5,
    verified: true,
  },
  {
    id: 5,
    name: "Meera Joshi",
    role: "Homeowner",
    company: "Healthcare Professional",
    location: "Hyderabad, Telangana",
    review: "KaamSathi made it so easy to find a reliable electrician. The worker was punctual, professional, and did excellent work. Will use again!",
    avatar: "/images/avatars/meera-joshi.png",
    rating: 5,
    verified: true,
  },
  {
    id: 6,
    name: "Vikram Singh",
    role: "Business Owner",
    company: "Shop Owner",
    location: "Chennai, Tamil Nadu",
    review: "Found skilled workers for my shop renovation through KaamSathi. The platform is user-friendly and the workers delivered quality work.",
    avatar: "/images/avatars/vikram-singh.png",
    rating: 5,
    verified: true,
  },
]

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    )
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Get testimonials to display based on screen size
  const getVisibleTestimonials = () => {
    const testimonialsPerView = 3 // Show 3 testimonials on larger screens
    const startIndex = currentIndex
    const endIndex = Math.min(startIndex + testimonialsPerView, testimonials.length)
    
    let visibleTestimonials = testimonials.slice(startIndex, endIndex)
    
    // If we don't have enough testimonials, wrap around
    if (visibleTestimonials.length < testimonialsPerView) {
      const remaining = testimonialsPerView - visibleTestimonials.length
      visibleTestimonials = [...visibleTestimonials, ...testimonials.slice(0, remaining)]
    }
    
    return visibleTestimonials
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            What Our Users Say
          </h2>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Real experiences from people who found reliable workers through KaamSathi
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Testimonials Container */}
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {getVisibleTestimonials().map((testimonial) => (
                <div key={testimonial.id} className="w-full">
                  {/* Testimonial Card */}
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg p-4 sm:p-6 lg:p-8 text-center shadow-sm hover:shadow-md transition-all duration-300">
                    {/* Rating */}
                    <div className="flex justify-center mb-4 sm:mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Review Text */}
                    <blockquote className="text-sm sm:text-base lg:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                      "{testimonial.review}"
                    </blockquote>

                    {/* User Info */}
                    <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="text-left">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {testimonial.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          {testimonial.role} • {testimonial.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
            {Array.from({ length: Math.ceil(testimonials.length / 3) }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index * 3)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / 3) === index ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonials ${index * 3 + 1}-${Math.min((index + 1) * 3, testimonials.length)}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
