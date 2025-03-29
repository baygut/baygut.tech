import ParallaxSection from "@/components/ParallaxSection";

export default function Home() {
  return (
    <main>
      <ParallaxSection speed={0.3}>
        <h1 className="text-4xl text-white">Welcome to My Parallax World</h1>
      </ParallaxSection>
      <ParallaxSection speed={0.7}>
        <h2 className="text-3xl text-white">Scroll Down for More</h2>
      </ParallaxSection>
    </main>
  );
}
