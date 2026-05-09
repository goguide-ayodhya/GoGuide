"use client";

import RideForm from "./rideForm";

export default function CabsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <RideForm />
    </main>
  );
}


// import Link from "next/dist/client/link";
// import React from "react";

// const page = () => {
//   return (
//     <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
//       <div className="text-center text-white px-6">
//         {/* Title */}
//         <h1 className="text-4xl md:text-6xl font-bold animate-pulse">
//           Coming Soon 🚀
//         </h1>

//         {/* Subtitle */}
//         <p className="mt-4 text-lg opacity-80">
//           We're working on something awesome...
//         </p>

//         {/* Animated Loader */}
//         <div className="mt-8 flex justify-center gap-2">
//           <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
//           <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
//           <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
//         </div>
//       </div>
//       <Link
//         href="/tourist/guides"
//         className="p-3 mt-8 rounded-full text-primary bg-white font-semibold hover:scale-105 transition-transform"
//       >
//         Explore Guides
//       </Link>
//     </div>
//   );
// };

// export default page;
