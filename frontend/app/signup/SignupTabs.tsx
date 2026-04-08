"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserForm from "./UserForm";
import GuideForm from "./GuideForm";
import DriverForm from "./DriverForm";

export default function SignupTabs() {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 p-2 bg-white flex items-center justify-center py-4">
        <TabsTrigger className="p-2 py-4" value="user">
          User
        </TabsTrigger>
        <TabsTrigger className="p-2 py-4" value="guide">
          Guide
        </TabsTrigger>
        <TabsTrigger className="p-2 py-4" value="driver">
          Driver
        </TabsTrigger>
      </TabsList>

      <TabsContent value="user" className="mt-6">
        <UserForm />
      </TabsContent>

      <TabsContent value="guide" className="mt-6">
        <GuideForm />
      </TabsContent>

      <TabsContent value="driver" className="mt-6">
        <DriverForm />
      </TabsContent>
    </Tabs>
  );
}
