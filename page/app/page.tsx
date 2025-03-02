import { GlowPoints } from '@/components/glowPoints';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden">
			<GlowPoints />
				<div className="bg-black/40 backdrop-blur-sm w-full h-full flex flex-col items-center justify-center gap-8 z-10">
					<h1 className="font-bold font-geist-sans text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-500 top-4 left-4 hover:scale-105 text-4xl md:text-6xl lg:text-8xl">DoContrib</h1>
					<div className="text-white text-lg animate-bounce absolute bottom-4">
						<i className="animate-bounce fa fa-arrow-down">▼</i>
				</div>
			</div>
		</div>
    );
}
