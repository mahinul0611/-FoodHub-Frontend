"use client"; // Next.js এ হুক ব্যবহারের জন্য এটি দিতে হবে

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// ১. মূল লজিকটি আলাদা একটি চাইল্ড কম্পোনেন্টে রাখা হলো
const OrderConfirmContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL থেকে order_id বের করা হচ্ছে
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // যদি URL-এ order_id না থাকে, তাহলে ইউজারকে হোমপেজে পাঠিয়ে দেওয়া হবে
    if (!orderId) {
      router.replace('/');
    }
  }, [orderId, router]);

  // orderId না থাকলে পেজ রেন্ডার করার দরকার নেই (ফাঁকা স্ক্রিন দেখাবে মুহূর্তের জন্য)
  if (!orderId) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        
        {/* সাকসেস আইকন */}
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-4">
          Thank you for your order. Your delicious meal is being processed and will be on its way soon!
        </p>

        {/* ইউজারকে তার অর্ডার আইডি দেখিয়ে দেওয়া */}
        <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700 font-mono mb-8 break-all border border-gray-200">
          <span className="font-semibold">Order ID:</span> <br/>
          {orderId}
        </div>

        {/* বাটন গ্রুপ */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/dashboard/orders" 
            className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition duration-200"
          >
            View My Orders
          </Link>
          
          <Link 
            href="/" 
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition duration-200"
          >
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
};

// ২. মেইন পেজে চাইল্ড কম্পোনেন্টটিকে Suspense দিয়ে র‍্যাপ করে দেওয়া হলো
const OrderConfirmPage = () => {
  return (
    // fallback-এ আপনি চাইলে একটি লোডিং স্পিনারও দিতে পারেন
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderConfirmContent />
    </Suspense>
  );
};

export default OrderConfirmPage;