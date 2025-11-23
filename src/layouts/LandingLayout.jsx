// import React from 'react'
// import Header from '../components/Header';
// import Hero from '../components/Hero';
// import Features from '../components/Features';
// import HowItWorks from '../components/HowItWorks';
// import Testimonials from '../components/Testimonials';
// import CTA from '../components/CTA';

// function LandingPage() {
//   return (
//     <div className="min-h-screen bg-gray-900">
//       <Header />
//       <Hero />
//       <Features />
//       <HowItWorks />
//       <Testimonials />
//       <CTA />
//     </div>
//   )
// }

// export default LandingPage





import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;