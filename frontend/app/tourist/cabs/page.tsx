// "use client";

// import { Header } from "@/components/common/Header";
// import { Footer } from "@/components/common/Footer";
// import { CabCard } from "@/components/features/CabCard";
// import { Input } from "@/components/ui/input";
// import { useState, useEffect } from "react";
// import { Search } from "lucide-react";
// import { useDriver } from "@/contexts/DriverContext";
// import { poppins } from "@/lib/fonts";
// import RideForm from "./rideForm";

// import dynamic from "next/dynamic";

// const Map = dynamic(() => import("@/components/cabs/Map"), {
//   ssr: false,
// });

// export default function CabsPage() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const { drivers, loading, fetchDrivers } = useDriver();

//   useEffect(() => {
//     fetchDrivers();
//   }, [fetchDrivers]);

//   const filteredDrivers = drivers.filter(
//     (driver) =>
//       driver.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       driver.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   return (
//     <main
//       className={`${poppins.className} min-h-screen bg-slate-50 text-slate-900`}
//     >
//       <Header showBackButton />

//       <Map />

//       <div className="flex-grow px-4 py-8 sm:px-6 lg:px-8">
//         <div className="mx-auto grid max-w-7xl gap-8">
//           <section className="space-y-6">
//             <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-200/40">
//               <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//                 <div>
//                   <p className="text-sm uppercase tracking-[0.2em] text-orange-600">
//                     Drivers nearby
//                   </p>
//                   <h2 className="mt-2 text-2xl font-semibold text-slate-950">
//                     Available drivers ({filteredDrivers.length})
//                   </h2>
//                 </div>

//                 <div className="relative max-w-xl">
//                   <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
//                   <Input
//                     placeholder="Search cabs by type, driver, or vehicle..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full rounded-3xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-900 shadow-sm"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div>
//               <RideForm />
//             </div>

//             {loading ? (
//               <div className="rounded-2xl border border-slate-200 bg-white/95 p-10 text-center shadow-lg shadow-slate-200/30">
//                 <p className="text-base text-slate-600">Loading drivers...</p>
//               </div>
//             ) : filteredDrivers.length > 0 ? (
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
//                 {filteredDrivers.map((driver) => (
//                   <CabCard key={driver.id} driver={driver} />
//                 ))}
//               </div>
//             ) : (
//               <div className="rounded-2xl border border-dashed border-slate-300 bg-white/95 p-10 text-center shadow-lg shadow-slate-200/20">
//                 <p className="text-lg font-semibold text-slate-950 mb-2">
//                   No drivers found
//                 </p>
//                 <p className="text-sm text-slate-500">
//                   Try different keywords or adjust your search filters.
//                 </p>
//               </div>
//             )}
//           </section>
//         </div>
//       </div>

//       <Footer />
//     </main>
//   );
// }

import Link from "next/dist/client/link";
import React from "react";

const page = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
      <div className="text-center text-white px-6">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold animate-pulse">
          Coming Soon 🚀
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-lg opacity-80">
          We're working on something awesome...
        </p>

        {/* Animated Loader */}
        <div className="mt-8 flex justify-center gap-2">
          <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
          <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>
      <Link
        href="/tourist/guides"
        className="p-3 mt-8 rounded-full text-primary bg-white font-semibold hover:scale-105 transition-transform"
      >
        Explore Guides
      </Link>
    </div>
  );
};

export default page;
