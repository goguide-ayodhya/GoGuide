import React from "react";
import Cookies from "@/components/common/Cookies";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

const page = () => {
  return (
    <div>
      <Header />
        <Cookies />
      <Footer />
    </div>
  );
};

export default page;
