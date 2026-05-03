'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Camera, Car, User, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const driverProfileSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  phoneNumber: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  vehicleMake: z.string().min(2, { message: 'Vehicle make is required.' }),
  vehicleModel: z.string().min(2, { message: 'Vehicle model is required.' }),
  vehicleYear: z.string().regex(/^\d{4}$/, { message: 'Must be a valid 4-digit year.' }),
  vehicleColor: z.string().min(2, { message: 'Vehicle color is required.' }),
  licensePlate: z.string().min(2, { message: 'License plate is required.' }),
  licenseNumber: z.string().min(5, { message: 'Driver license number is required.' }),
});

type DriverProfileValues = z.infer<typeof driverProfileSchema>;

export default function CompleteProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DriverProfileValues>({
    resolver: zodResolver(driverProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      licensePlate: '',
      licenseNumber: '',
    },
  });

  async function onSubmit(data: DriverProfileValues) {
    setIsLoading(true);
    // Simulate API call
    console.log('Submitting profile data:', data);
    setTimeout(() => {
      setIsLoading(false);
      // router.push('/driver/dashboard');
    }, 1500);
  }

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <Card className="border-none shadow-xl bg-background/60 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Complete your profile</CardTitle>
          <CardDescription className="text-lg">
            We need a few more details to get you on the road and earning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Car className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Vehicle Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleMake"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="Toyota, Honda, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Camry, Civic, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input placeholder="2020" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input placeholder="Silver, Black, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>License Plate Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-1234" className="uppercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* License Information */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Driving License</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver's License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="D12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Complete Profile'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
