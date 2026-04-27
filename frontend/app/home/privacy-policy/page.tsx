import React from "react";
import PrivacyPolicy from "@/components/common/PrivacyPolicy";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

const page = () => {
  return (
    <div>
      <Header />
      <PrivacyPolicy />
      <Footer />
    </div>
  );
};

export default page;
