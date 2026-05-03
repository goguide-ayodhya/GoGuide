"use client";

import { Suspense } from "react";
import DriverSignupFlow from "@/app/signup/goguide-driver/DriverSignupFlow";

function DriverPage() {
    return <DriverSignupFlow />;
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DriverPage />
        </Suspense>
    );
}