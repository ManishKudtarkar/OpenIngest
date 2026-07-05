import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProblemSolution from "./components/ProblemSolution";
import TrustedBy from "./components/TrustedBy";
import Features from "./components/Features";
import Architecture from "./components/Architecture";
import CodeExample from "./components/CodeExample";
import CLISection from "./components/CLISection";
import AirflowSection from "./components/AirflowSection";
import LoadStrategies from "./components/LoadStrategies";
import ConnectorsSection from "./components/ConnectorsSection";
import Stats from "./components/Stats";
import GettingStarted from "./components/GettingStarted";
import Roadmap from "./components/Roadmap";
import Docs from "./components/Docs";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <ProblemSolution />
        <Features />
        <Architecture />
        <CodeExample />
        <CLISection />
        <AirflowSection />
        <LoadStrategies />
        <ConnectorsSection />
        <Stats />
        <GettingStarted />
        <Roadmap />
        <Docs />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
