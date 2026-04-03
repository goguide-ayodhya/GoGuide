// "use client";

// import { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Search, Star, MapPin } from "lucide-react";
// import Image from "next/image";
// import { useDriver } from "@/app/driver/contexts/DriverContext";
// import { assets } from "@/public/assets/assets";

// export default function DriversPage() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedSpeciality, setSelectedSpeciality] = useState<string>("all");
//   const { drivers } = useDriver();
//   //
//   // Get unique specialities
//   const specialities = [
//     "all",
//     ...new Set(drivers.map((g) => g.specialities?.[0] || "General")),
//   ];

//   // Filter drivers
//   const filtered = drivers.filter((driver) => {
//     const matchesSearch =
//       driver.name ||
//       "".toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (driver.specialities?.[0] || "")
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase());
//     const matchesSpeciality =
//       selectedSpeciality === "all" ||
//       driver.specialities?.[0] === selectedSpeciality;
//     return matchesSearch && matchesSpeciality;
//   });

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-foreground">Drivers Directory</h1>
//         <p className="text-muted-foreground mt-2">
//           Browse and collaborate with other professional drivers
//         </p>
//       </div>

//       {/* Filters */}
//       <Card className="bg-card border border-border">
//         <CardContent className="pt-6">
//           <div className="space-y-4">
//             {/* Search */}
//             <div className="relative">
//               <Search
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
//                 size={20}
//               />
//               <Input
//                 placeholder="Search drivers by name or speciality..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 bg-secondary border-border"
//               />
//             </div>

//             {/* Speciality Filter */}
//             <div>
//               <label className="text-sm font-medium text-foreground block mb-2">
//                 Filter by Speciality
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {specialities.map((speciality) => (
//                   <button
//                     key={speciality}
//                     onClick={() => setSelectedSpeciality(speciality)}
//                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                       selectedSpeciality === speciality
//                         ? "bg-primary text-primary-foreground"
//                         : "bg-secondary text-foreground hover:bg-secondary/80"
//                     }`}
//                   >
//                     {speciality.charAt(0).toUpperCase() + speciality.slice(1)}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Drivers Grid */}
//       <div>
//         {filtered.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filtered.map((driver) => (
//               <Card
//                 key={driver.id}
//                 className="bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors"
//               >
//                 <CardContent className="p-0">
//                   {/* Driver Image */}

//                   <div className="relative h-48 w-full overflow-hidden bg-secondary">
//                     {/* {driver.image ? ( */}
//                     <Image
//                       src={driver.image || assets.guideImage}
//                       alt={driver.name}
//                       fill
//                       className="object-cover w-f ull h-full"
//                     />
//                     {/* ) : (
//                       <div>No Image</div>
//                     )} */}
//                   </div>

//                   {/* Driver Info */}
//                   <div className="p-4 space-y-4">
//                     <div>
//                       <h3 className="text-lg font-bold text-foreground">
//                         {driver.name}
//                       </h3>
//                       <p className="text-sm text-primary font-medium">
//                         {driver.specialities?.[0]}
//                       </p>
//                     </div>

//                     {/* Rating */}
//                     <div className="flex items-center gap-2">
//                       <div className="flex items-center gap-1">
//                         {[...Array(5)].map((_, i) => (
//                           <Star
//                             key={i}
//                             size={16}
//                             className={
//                               i < Math.floor(driver.rating)
//                                 ? "fill-yellow-500 text-yellow-500"
//                                 : "text-black/40"
//                             }
//                           />
//                         ))}
//                       </div>
//                       <span className="text-sm font-semibold text-foreground">
//                         {driver.rating}
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         ({driver.totalReviews ?? 0} reviews)
//                       </span>
//                     </div>

//                     {/* Languages */}
//                     <div>
//                       <p className="text-xs text-muted-foreground mb-2">
//                         Languages
//                       </p>
//                       <div className="flex flex-wrap gap-1">
//                         {driver.languages.map((lang) => (
//                           <span
//                             key={lang}
//                             className="px-2 py-1 bg-secondary rounded text-xs text-foreground"
//                           >
//                             {lang}
//                           </span>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Details */}
//                     <div className="text-sm text-muted-foreground space-y-1">
//                       <p>
//                         📍 Experience: {driver.yearsOfExperience ?? 0}+ years
//                       </p>
//                       <p>💰 Rs.{driver.hourlyRate ?? 500}/hour</p>
//                     </div>

//                     {/* Actions */}
//                     <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
//                       View Profile
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <Card className="bg-card border border-border">
//             <CardContent className="py-12 text-center">
//               <p className="text-muted-foreground">
//                 No drivers found matching your criteria
//               </p>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {/* Results Summary */}
//       <p className="text-sm text-muted-foreground">
//         Showing {filtered.length} of {drivers.length} drivers
//       </p>
//     </div>
//   );
// }
