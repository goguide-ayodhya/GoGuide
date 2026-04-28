// components/guide-profile-steps/Step2Services.tsx

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { SPECIALITIES, COMMON_LOCATIONS } from "@/lib/profile-utils";

interface Step2ServicesProps {
  specialities: string[];
  locations: string[];
  onSpecialitiesChange: (specialities: string[]) => void;
  onLocationsChange: (locations: string[]) => void;
  errors?: {
    specialities?: string;
    locations?: string;
  };
}

export function Step2Services({
  specialities,
  locations,
  onSpecialitiesChange,
  onLocationsChange,
  errors,
}: Step2ServicesProps) {
  const [currentSpeciality, setCurrentSpeciality] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");

  const addSpeciality = (speciality: string) => {
    if (speciality && !specialities.includes(speciality)) {
      onSpecialitiesChange([...specialities, speciality]);
      setCurrentSpeciality("");
    }
  };

  const removeSpeciality = (speciality: string) => {
    onSpecialitiesChange(specialities.filter((s) => s !== speciality));
  };

  const addLocation = (location: string) => {
    if (location && !locations.includes(location)) {
      onLocationsChange([...locations, location]);
      setCurrentLocation("");
      setCustomLocation("");
    }
  };

  const removeLocation = (location: string) => {
    onLocationsChange(locations.filter((l) => l !== location));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Services & Locations
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Choose your specialties and the locations you cover
        </p>
      </div>

      {/* Specialities */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-medium">Tour Specialities</Label>
          <p className="text-sm text-slate-500 mt-1">
            Select at least one speciality
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SPECIALITIES.map((speciality) => (
            <button
              key={speciality}
              type="button"
              onClick={() => {
                if (specialities.includes(speciality)) {
                  removeSpeciality(speciality);
                } else {
                  addSpeciality(speciality);
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                specialities.includes(speciality)
                  ? "bg-orange-100 border-orange-500 text-orange-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {speciality}
            </button>
          ))}
        </div>

        {errors?.specialities && (
          <p className="text-sm text-red-600">{errors.specialities}</p>
        )}

        {specialities.length > 0 && (
          <div className="pt-2 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-2">Selected:</p>
            <div className="flex flex-wrap gap-2">
              {specialities.map((speciality) => (
                <Badge
                  key={speciality}
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 flex items-center gap-1"
                >
                  {speciality}
                  <button
                    type="button"
                    onClick={() => removeSpeciality(speciality)}
                    className="hover:text-orange-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Locations */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-medium">Operating Locations</Label>
          <p className="text-sm text-slate-500 mt-1">
            Add locations you can conduct tours
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={currentLocation} onValueChange={setCurrentLocation}>
            <SelectTrigger className="flex-1 bg-slate-50 border-slate-200">
              <SelectValue placeholder="Select a location..." />
            </SelectTrigger>
            <SelectContent>
              {COMMON_LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={() => addLocation(currentLocation)}
            disabled={!currentLocation}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Custom Location */}
        <div className="flex gap-2">
          <Input
            placeholder="Or add a custom location..."
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            className="bg-slate-50 border-slate-200"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLocation(customLocation);
              }
            }}
          />
          <Button
            type="button"
            onClick={() => addLocation(customLocation)}
            disabled={!customLocation}
            variant="outline"
            className="border-slate-300"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {errors?.locations && (
          <p className="text-sm text-red-600">{errors.locations}</p>
        )}

        {locations.length > 0 && (
          <div className="pt-2 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-2">Locations ({locations.length}):</p>
            <div className="flex flex-wrap gap-2">
              {locations.map((location) => (
                <Badge
                  key={location}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  {location}
                  <button
                    type="button"
                    onClick={() => removeLocation(location)}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          ✓ You can update these anytime from your guide profile
        </p>
      </div>
    </div>
  );
}
