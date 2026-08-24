import CinematicNavbar   from "./components/cinematic/CinematicNavbar";
import HeroChapter       from "./components/cinematic/HeroChapter";
import ManifestoChapter  from "./components/cinematic/ManifestoChapter";
import PipelineChapter   from "./components/cinematic/PipelineChapter";
import ConnectorsChapter from "./components/cinematic/ConnectorsChapter";
import TransformChapter  from "./components/cinematic/TransformChapter";
import CLIChapter        from "./components/cinematic/CLIChapter";
import StatsChapter      from "./components/cinematic/StatsChapter";
import InstallChapter    from "./components/cinematic/InstallChapter";
import CinematicFooter   from "./components/cinematic/CinematicFooter";
import ScrollProgress    from "./components/cinematic/ScrollProgress";
import CursorGlow        from "./components/cinematic/CursorGlow";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <CinematicNavbar />
      <main>
        <HeroChapter />
        <ManifestoChapter />
        <PipelineChapter />
        <ConnectorsChapter />
        <TransformChapter />
        <CLIChapter />
        <StatsChapter />
        <InstallChapter />
      </main>
      <CinematicFooter />
    </>
  );
}
