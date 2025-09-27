import ActiveDebate from "@/components/custom/ActiveDebates";
import Hero from "@/components/custom/Hero";

export default function Home() {
  return (
    <div className="">
      <Hero />
      <p className="text-center **:text-lg font-medium text-pretty text-gray-500 sm:max-w-md sm:text-xl/8 lg:max-w-none dark:text-gray-400 pb-12">
        Do you Dare to Stake Your Take?
      </p>
      <ActiveDebate />
    </div>
  );
}
