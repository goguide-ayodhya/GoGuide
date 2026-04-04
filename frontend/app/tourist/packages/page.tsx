// 'use client'

// import { Header } from '@/components/common/Header'
// import { Footer } from '@/components/common/Footer'
// import { PackageCard } from '@/components/features/PackageCard'
// import { Input } from '@/components/ui/input'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { useState } from 'react'
// import { Search } from 'lucide-react'

// type SortOption = 'popular' | 'price-low' | 'price-high' | 'duration'

// export default function PackagesPage() {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [sortBy, setSortBy] = useState<SortOption>('popular')

//   // const filteredPackages = packages.filter((pkg) =>
//   //   pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //   pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //   pkg.highlights.some((h) => h.toLowerCase().includes(searchTerm.toLowerCase()))
//   // )

//   // const sortedPackages = [...filteredPackages].sort((a, b) => {
//   //   switch (sortBy) {
//   //     case 'price-low':
//   //       return a.price - b.price
//   //     case 'price-high':
//   //       return b.price - a.price
//   //     case 'duration':
//   //       return a.duration - b.duration
//   //     default:
//   //       return 0
//   //   }
//   // })

//   return (
//     <main className="min-h-screen flex flex-col bg-background">
//       <Header title="Tour Packages" showBackButton />

//       <div className="flex-grow">
//         <div className="px-4 md:px-6 py-8">
//           <div className="mx-auto max-w-7xl">
//             {/* Search and Filter Section */}
//             <div className="mb-8 space-y-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//                 <Input
//                   placeholder="Search packages, highlights, or experiences..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 bg-background"
//                 />
//               </div>

//               <div className="flex flex-col md:flex-row gap-4">
//                 <div className="flex-1">
//                   <label className="block text-sm font-medium text-foreground mb-2">Sort by</label>
//                   <Select value={sortBy} onValueChange={(value: any) => setSortBy(value as SortOption)}>
//                     <SelectTrigger className="bg-background">
//                       <SelectValue placeholder="Popular" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="popular">Popular</SelectItem>
//                       <SelectItem value="price-low">Price: Low to High</SelectItem>
//                       <SelectItem value="price-high">Price: High to Low</SelectItem>
//                       <SelectItem value="duration">Duration</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </div>

//             {/* Results */}
//             {/* <div>
//               <h3 className="text-lg font-semibold text-foreground mb-4">
//                 Available Packages ({sortedPackages.length})
//               </h3>

//               {sortedPackages.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {sortedPackages.map((pkg) => (
//                     <PackageCard key={pkg.id} pkg={pkg} />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <p className="text-muted-foreground mb-2">No packages found matching your search</p>
//                   <p className="text-sm text-muted-foreground">Try adjusting your search terms</p>
//                 </div>
//               )}
//             </div> */}
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </main>
//   )
// }
