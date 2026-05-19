"use client";

import { Suspense } from "react";
import DriverSignupFlow from "@/app/signup/goguide-driver/DriverSignupFlow";
import TouristLoader from "@/components/common/TouristLoader";

function DriverPage() {
    return <DriverSignupFlow />;
}

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><TouristLoader /></div>}>
            <DriverPage />
        </Suspense>
    );
}