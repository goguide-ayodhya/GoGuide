// "use client";

// import { Header } from "@/components/common/Header";
// import { Footer } from "@/components/common/Footer";
// import { CabCard } from "@/components/features/CabCard";
// import { Input } from "@/components/ui/input";
// // import { cabs } from "@/lib/mockData";
// import { useState } from "react";
// import { Search } from "lucide-react";

// export default function CabsPage() {
//   const [searchTerm, setSearchTerm] = useState("");

//   // const filteredCabs = cabs.filter(
//   //   (cab) =>
//   //     cab.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //     cab.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //     cab.currentLocation.toLowerCase().includes(searchTerm.toLowerCase()),
//   // );

//   return (
//     <main className="min-h-screen flex flex-col bg-background">
//       <Header title="Book a Cab" showBackButton />

//       <div className="flex-grow">
//         <div className="px-4 md:px-6 py-8">
//           <div className="mx-auto max-w-7xl">
//             {/* Booking Info Section */}
//             <div className="mb-8 bg-muted/50 p-6 rounded-lg border border-border">
//               <h2 className="text-xl font-semibold text-foreground mb-4">
//                 Plan Your Journey
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-foreground mb-2">
//                     Pickup Location
//                   </label>
//                   <Input
//                     placeholder="Enter pickup location"
//                     className="bg-background"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-foreground mb-2">
//                     Dropoff Location
//                   </label>
//                   <Input
//                     placeholder="Enter dropoff location"
//                     className="bg-background"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-foreground mb-2">
//                     Date & Time
//                   </label>
//                   <Input type="datetime-local" className="bg-background" />
//                 </div>
//               </div>
//             </div>

//             {/* Search and Filter */}
//             <div className="mb-8">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//                 <Input
//                   placeholder="Search cabs by type, driver, or location..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 bg-background"
//                 />
//               </div>
//             </div>

//             {/* Results */}
//             {/* <div>
//               <h3 className="text-lg font-semibold text-foreground mb-4">
//                 Available Cabs ({filteredCabs.length})
//               </h3>

//               {filteredCabs.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {filteredCabs.map((cab) => (
//                     <CabCard key={cab.id} cab={cab} />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <p className="text-muted-foreground mb-2">
//                     No cabs found matching your search
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     Try adjusting your search terms
//                   </p>
//                 </div>
//               )}
//             </div> */}
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </main>
//   );
// }
