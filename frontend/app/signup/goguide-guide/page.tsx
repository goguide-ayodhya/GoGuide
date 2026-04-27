"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Check, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins } from "@/lib/fonts";
import Image from "next/image";
import { assets } from "@/public/assets/assets";

type GuideFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  specialities: string[];
  locations: string[];
  price: string;
  duration: string;
  experience: string;
  languages: string[];
  profileImage: File | null;
};

const SPECIALITIES = [
  "Historical Tours",
  "Adventure Tours",
  "Cultural Tours",
  "Food Tours",
  "Nature Tours",
  "City Tours",
  "Photography Tours",
  "Wildlife Tours",
];

const COMMON_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Hindi",
  "Arabic",
  "Russian",
];

export default function GuideForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<GuideFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    specialities: [],
    locations: [],
    price: "",
    duration: "4 hours",
    experience: "",
    languages: [],
    profileImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("");
  const [currentSpeciality, setCurrentSpeciality] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");

  const passwordStrength = {
    hasLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, profileImage: file }));
  };

  const addLanguage = () => {
    if (currentLanguage && !formData.languages.includes(currentLanguage)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, currentLanguage],
      }));
      setCurrentLanguage("");
    }
  };

  const removeLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang !== language),
    }));
  };

  const addSpeciality = () => {
    if (currentSpeciality && !formData.specialities.includes(currentSpeciality)) {
      setFormData((prev) => ({
        ...prev,
        specialities: [...prev.specialities, currentSpeciality],
      }));
      setCurrentSpeciality("");
    }
  };

  const removeSpeciality = (speciality: string) => {
    setFormData((prev) => ({
      ...prev,
      specialities: prev.specialities.filter((spec) => spec !== speciality),
    }));
  };

  const addLocation = () => {
    if (currentLocation && !formData.locations.includes(currentLocation)) {
      setFormData((prev) => ({
        ...prev,
        locations: [...prev.locations, currentLocation],
      }));
      setCurrentLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.filter((loc) => loc !== location),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const user = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "GUIDE",
        specialities: formData.specialities,
        locations: formData.locations,
        price: formData.price,
        duration: formData.duration,
        experience: formData.experience,
        languages: formData.languages,
        profileImage: formData.profileImage,
      });
      
      // Redirect based on role
      if (user.role === "GUIDE") {
        router.push("/guide/dashboard");
      } else if (user.role === "DRIVER") {
        router.push("/driver/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md md:max-w-lg w-full">
        <div className="text-center">
          <Image
            src={assets.logo}
            alt="GoGuide - Ayodhya"
            width={96}
            height={96}
            className="mx-auto"
          />
          <p className="text-muted-foreground pt-2">Book ● Feel ● Remember</p>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-8 w-8 text-secondary" />
            <h1 className={`${poppins.className} text-secondary text-xl`}>
              {" "}
              Join as a Guide
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-muted"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-muted"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialities">Specialities</Label>
                <div className="flex gap-2">
                  <Input
                    id="specialities"
                    type="text"
                    placeholder="Enter a speciality (e.g., Historical Tours)"
                    value={currentSpeciality}
                    onChange={(e) => setCurrentSpeciality(e.target.value)}
                    className="bg-muted flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpeciality())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer bg-secondary text-white"
                    onClick={addSpeciality}
                  >
                    Add
                  </Button>
                </div>
                {formData.specialities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specialities.map((speciality) => (
                      <Badge key={speciality} variant="secondary" className="flex items-center gap-1">
                        {speciality}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSpeciality(speciality)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="500"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="bg-muted"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, duration: value }))
                  }
                >
                  <SelectTrigger className="bg-muted">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2 hours">2 hours</SelectItem>
                    <SelectItem value="4 hours">4 hours</SelectItem>
                    <SelectItem value="6 hours">6 hours</SelectItem>
                    <SelectItem value="8 hours">8 hours</SelectItem>
                    <SelectItem value="Full day">Full day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locations">Locations</Label>
              <div className="flex gap-2">
                <Input
                  id="locations"
                  type="text"
                  placeholder="Enter a location (e.g., Ram Mandir)"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="bg-muted flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer bg-secondary text-white"
                  onClick={addLocation}
                >
                  Add
                </Button>
              </div>
              {formData.locations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.locations.map((location) => (
                    <Badge key={location} variant="secondary" className="flex items-center gap-1">
                      {location}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeLocation(location)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                name="experience"
                type="number"
                placeholder="5"
                value={formData.experience}
                onChange={handleInputChange}
                className="bg-muted"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex gap-2">
                <Select
                  value={currentLanguage}
                  onValueChange={setCurrentLanguage}
                >
                  <SelectTrigger className="flex-1 bg-muted">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_LANGUAGES.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer bg-secondary text-white"
                  onClick={addLanguage}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.languages.map((language) => (
                  <Badge
                    key={language}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {language}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeLanguage(language)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Image (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label
                  htmlFor="profileImage"
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  {formData.profileImage
                    ? formData.profileImage.name
                    : "Choose file"}
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-muted"
                required
              />
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1 text-xs">
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordStrength.hasLength
                          ? "text-green-600"
                          : "text-gray-400",
                      )}
                    >
                      <Check className="h-3 w-3" />
                      8+ characters
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordStrength.hasUpperCase
                          ? "text-green-600"
                          : "text-gray-400",
                      )}
                    >
                      <Check className="h-3 w-3" />
                      Uppercase
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordStrength.hasLowerCase
                          ? "text-green-600"
                          : "text-gray-400",
                      )}
                    >
                      <Check className="h-3 w-3" />
                      Lowercase
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordStrength.hasNumber
                          ? "text-green-600"
                          : "text-gray-400",
                      )}
                    >
                      <Check className="h-3 w-3" />
                      Number
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="bg-muted"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Become a Guide"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
