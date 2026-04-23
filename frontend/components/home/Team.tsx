import React from "react";
import assert from "assert";
import { assets } from "@/public/assets/assets";
import Image from "next/image";

const team = [
  {
    name: "Aditya Sahu",
    role: "Founder",
    image: assets.adityaSahu,
  },
  {
    name: "Rahul Srivastava",
    role: "Co-Founder",
    image: assets.rahulSrivastava,
  },
];

const TeamSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#e9e6f2]">
      <div className="max-w-6xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl lg:md:text-5xl font-semibold text-destructive">
          Leadership <b className="text-indigo-600">TEAM</b> with vision
        </h2>
        <p className="mt-3 text-base md:text-lg">
          People who take responsibility for strategy, delivery, and outcomes.
        </p>

        {/* Cards */}
        <div className="mt-12 flex grid grid-cols-1 sm:grid-cols-2 gap-8 gap-8 items-center justify-center">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 max-w-xl flex flex-col"
            >
              {/* Image */}
              <div className="w-full h-auto rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="mt-4 text-left">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {member.name}

                  {/* LinkedIn Icon */}
                  <span className="border rounded p-[2px] text-xs">in</span>
                </h3>

                <p className="text-sm text-gray-600 mt-1">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
