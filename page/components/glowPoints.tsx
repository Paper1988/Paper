import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GlowPoint {
	id: number;
	size: number;
	color: string;
	blur: string;
}

export function GlowPoints() {
	const [glowPoints, setGlowPoints] = useState<GlowPoint[]>([]);

	useEffect(() => {
		const fixedColors = [
			"rgb(34, 211, 238)",
			"rgb(20, 184, 166)",
			"rgb(99, 102, 241)",
			"rgb(139, 92, 246)",
		];

		const points: GlowPoint[] = Array.from({ length: 5 }).map((_, index) => ({
			id: index,
			size: Math.random() * 40 + 20,
			color: fixedColors[index % fixedColors.length],
			blur: "blur-3xl",
		}));
		
		setGlowPoints(points);
	}, []);

	return (
		<div className="absolute inset-0">
			{glowPoints.map((point) => (
				<BreathingGlow key={point.id} {...point} />
			))}
		</div>
	);
}

function BreathingGlow({ size, color, blur }: GlowPoint) {
	const [position, setPosition] = useState({ x: Math.random() * 100, y: Math.random() * 100 });

	const handleAnimationComplete = () => {
		setPosition({ x: Math.random() * 100, y: Math.random() * 100 });
	};

	return (
		<motion.div
			className={`absolute rounded-full ${blur}`}
			style={{
				width: `${size}px`,
				height: `${size}px`,
				background: `radial-gradient(circle at center, ${color} 50%, transparent 100%)`,
				boxShadow: `0 0 ${size * 2}px ${size}px ${color}`,
			}}
			initial={{
				x: `${position.x}vw`,
				y: `${position.y}vh`,
				scale: 1,
				opacity: 1,
			}}
			animate={{
				scale: [1, 1.2, 0.8, 1],
				opacity: [1, 0.2, 1],
			}}
			transition={{
				scale: {
					duration: 10,
					repeat: Infinity,
					ease: "easeInOut",
				},
				opacity: {
					duration: 10,
					repeat: Infinity,
					ease: "easeInOut",
					onComplete: handleAnimationComplete,
				},
			}}
		/>
	);
}
