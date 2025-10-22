#!/usr/bin/env node

import { supabase } from '../lib/supabase'

// Define types for better type safety
interface Book {
  id: string
  title: string
  author: string
  genre: string
  cover_image_url?: string | null
}

interface DeliveryMethod {
  id: string
  book_id: string
  format: string
  title: string
  description: string | null
  slug: string
  is_active: boolean
  requires_email: boolean
  delivery_method: string
  created_at: string
  books: Book[] | null
}

async function testDeliveryMethods() {
  console.log('🔍 Testing database connection and delivery methods...\n')

  // Check if Supabase client is available
  if (!supabase) {
    console.error('❌ Supabase client not available')
    console.log('Please check your environment variables:')
    console.log(`  - NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set'}`)
    console.log(`  - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set'}`)
    process.exit(1)
  }

  try {
    // Test 1: Basic connection test
    console.log('1️⃣ Testing basic database connection...')
    const { data: testData, error: testError } = await supabase
      .from('book_delivery_methods')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Database connection failed:', testError.message)
      process.exit(1)
    }
    console.log('✅ Database connection successful!\n')

    // Test 2: Get all delivery methods
    console.log('2️⃣ Fetching all delivery methods...')
    const { data: deliveryMethods, error: deliveryError } = await supabase
      .from('book_delivery_methods')
      .select(`
        id,
        book_id,
        format,
        title,
        description,
        slug,
        is_active,
        requires_email,
        delivery_method,
        created_at,
        books (
          id,
          title,
          author,
          genre,
          cover_image_url
        )
      `)
      .order('created_at', { ascending: false })

    if (deliveryError) {
      console.error('❌ Error fetching delivery methods:', deliveryError.message)
      process.exit(1)
    }

    console.log(`✅ Found ${deliveryMethods?.length || 0} delivery methods\n`)

    // Test 3: Analyze delivery methods
    if (deliveryMethods && deliveryMethods.length > 0) {
      console.log('3️⃣ Analyzing delivery methods...')
      
      // Count by format
      const formatCounts = deliveryMethods.reduce((acc, method) => {
        acc[method.format] = (acc[method.format] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      console.log('📊 Format distribution:')
      Object.entries(formatCounts).forEach(([format, count]) => {
        console.log(`   ${format}: ${count}`)
      })

      // Count by delivery method
      const deliveryMethodCounts = deliveryMethods.reduce((acc, method) => {
        acc[method.delivery_method] = (acc[method.delivery_method] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      console.log('\n📊 Delivery method distribution:')
      Object.entries(deliveryMethodCounts).forEach(([method, count]) => {
        console.log(`   ${method}: ${count}`)
      })

      // Count active vs inactive
      const activeCount = deliveryMethods.filter(m => m.is_active).length
      const inactiveCount = deliveryMethods.length - activeCount
      console.log(`\n📊 Status: ${activeCount} active, ${inactiveCount} inactive`)

      // Show sample data
      console.log('\n📋 Sample delivery methods:')
      deliveryMethods.slice(0, 3).forEach((method, index) => {
        const book = method.books?.[0] // Get the first (and only) book from the array
        console.log(`\n   ${index + 1}. ${method.title}`)
        console.log(`      Format: ${method.format}`)
        console.log(`      Delivery: ${method.delivery_method}`)
        console.log(`      Active: ${method.is_active}`)
        console.log(`      Book: ${book?.title || 'No book data'}`)
        console.log(`      Author: ${book?.author || 'Unknown'}`)
        console.log(`      Genre: ${book?.genre || 'Unknown'}`)
      })

    } else {
      console.log('⚠️  No delivery methods found in database')
    }

    // Test 4: Check for books without delivery methods
    console.log('\n4️⃣ Checking books without delivery methods...')
    
    // Get all book IDs that have delivery methods
    const bookIdsWithDelivery = deliveryMethods?.map(m => m.book_id) || []
    
    let booksWithoutDelivery: Array<Partial<Book> & { status: string }> = []
    if (bookIdsWithDelivery.length > 0) {
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select(`
          id,
          title,
          author,
          genre,
          status
        `)
        .eq('status', 'active')
        .not('id', 'in', `(${bookIdsWithDelivery.join(',')})`)

      if (booksError) {
        console.error('❌ Error checking books:', booksError.message)
      } else {
        booksWithoutDelivery = booksData || []
      }
    } else {
      // If no delivery methods exist, get all active books
      const { data: allBooks, error: booksError } = await supabase
        .from('books')
        .select(`
          id,
          title,
          author,
          genre,
          status
        `)
        .eq('status', 'active')

      if (booksError) {
        console.error('❌ Error checking books:', booksError.message)
      } else {
        booksWithoutDelivery = allBooks || []
      }
    }

    console.log(`📚 Found ${booksWithoutDelivery.length} active books without delivery methods`)
    if (booksWithoutDelivery.length > 0) {
      console.log('Sample books without delivery methods:')
      booksWithoutDelivery.slice(0, 3).forEach((book, index) => {
        console.log(`   ${index + 1}. ${book.title} by ${book.author} (${book.genre})`)
      })
    }

    // Test 5: Check download statistics
    console.log('\n5️⃣ Checking download statistics...')
    const { data: downloadStats, error: downloadError } = await supabase
      .from('reader_deliveries')
      .select('delivery_method_id, delivered_at')
      .gte('delivered_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    if (downloadError) {
      console.error('❌ Error fetching download stats:', downloadError.message)
    } else {
      console.log(`📥 ${downloadStats?.length || 0} downloads in the last 30 days`)
    }

    console.log('\n✅ Database test completed successfully!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the test
testDeliveryMethods()
