"use client"

import { motion, AnimatePresence, useAnimation } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"

const LYRICS = [
  {
    text: "All those days watching from the windows",
    startTime: 2000,
  },
  {
    text: "All those years outside looking in",
    startTime: 7000,
  },
  {
    text: "All that time never even knowing",
    startTime: 12000,
  },
  {
    text: "Just how blind I've been",
    startTime: 17000,
  },
  {
    text: "Now I'm here, blinking in the starlight",
    startTime: 22000,
  },
  {
    text: "Now I'm here, suddenly I see",
    startTime: 27000,
  },
  {
    text: "Standing here, it's all so clear",
    startTime: 31000,
  },
  {
    text: "I'm where I'm meant to be",
    startTime: 36000,
  },
  {
    text: "And at last I see the light",
    startTime: 41000,
  },
  {
    text: "And it's like the fog has lifted",
    startTime: 45000,
  },
  {
    text: "And at last I see the light",
    startTime: 50000,
  },
  {
    text: "And it's like the sky is new",
    startTime: 55000,
  },
  {
    text: "And it's warm and real and bright",
    startTime: 60000,
  },
  {
    text: "And the world has somehow shifted",
    startTime: 64000,
  },
  {
    text: "All at once everything looks different",
    startTime: 72000,
  },
  {
    text: "Now that I see you",
    startTime: 78000,
  }
]

const TOTAL_IMAGES = 7;

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

interface SlideshowProps {
  isPlaying: boolean;
  onClose: () => void;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

// Add this animation utility at the top of the file
const floatingLanternAnimation = {
  initial: { y: 10, opacity: 0 },
  animate: { 
    y: [-20, 0, -20], 
    opacity: [0.4, 0.7, 0.4],
  },
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Update the Lantern interface
interface Lantern {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  delay: number;
}

// Add this new animation for random drifting
const driftingLanternAnimation = {
  initial: { opacity: 0, scale: 0 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 1,
      ease: "easeOut",
    }
  }
};

// Add this new animation for the pulsing glow
const pulsingGlowAnimation = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.7, 0.3],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function Slideshow({ isPlaying, onClose, audioRef }: SlideshowProps) {
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showLanterns, setShowLanterns] = useState(false);
  const [lanterns, setLanterns] = useState<Lantern[]>([]);

  // Get the current group of three lyrics
  const getCurrentLyricsGroup = () => {
    const groupIndex = Math.floor(currentLyricIndex / 3)
    const startIndex = groupIndex * 3
    return LYRICS.slice(startIndex, startIndex + 3)
  }

  // Handle lyrics timing
  useEffect(() => {
    if (!isPlaying) {
      setCurrentLyricIndex(0)
      setElapsedTime(0)
      return
    }

    const timer = setInterval(() => {
      if (audioRef?.current) {
        setElapsedTime(audioRef.current.currentTime * 1000)
      } else {
        setElapsedTime(prev => prev + 100)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [isPlaying, audioRef])

  // Handle image slideshow timing independently
  useEffect(() => {
    if (!isPlaying) {
      setCurrentImageIndex(0)
      return
    }

    const imageInterval = setInterval(() => {
      setTimeout(() => {
        setCurrentImageIndex(prev => (prev + 1) % 7)
      }, 100)
    }, 5000)

    return () => clearInterval(imageInterval)
  }, [isPlaying])

  useEffect(() => {
    // Find current lyric based on elapsed time
    const currentLyric = LYRICS.findIndex(
      (lyric, index) => {
        const nextLyric = LYRICS[index + 1]
        return elapsedTime >= lyric.startTime && 
               (!nextLyric || elapsedTime < nextLyric.startTime)
      }
    )
    if (currentLyric !== -1) {
      setCurrentLyricIndex(currentLyric)
    }

    // Check if audio has ended
    if (audioRef?.current?.ended) {
      onClose()
    }
  }, [elapsedTime, audioRef, onClose])

  // Add this function to create a lantern with random position and velocity
  const createLantern = (id: number): Lantern => ({
    id,
    x: Math.random() * (window.innerWidth - 50), // Account for lantern width
    y: Math.random() * (window.innerHeight - 50), // Account for lantern height
    velocityX: (Math.random() - 0.5) * 0.5, // Random velocity between -0.25 and 0.25
    velocityY: (Math.random() - 0.5) * 0.5,
    delay: Math.random() * 2
  });

  // Add this effect to handle lantern spawning
  useEffect(() => {
    if (elapsedTime >= 41000 && !showLanterns) {
      setShowLanterns(true);
      const newLanterns = Array.from({ length: 20 }, (_, i) => createLantern(i));
      setLanterns(newLanterns);
    }
  }, [elapsedTime, showLanterns]);

  // Add this effect to handle lantern movement
  useEffect(() => {
    if (!showLanterns) return;

    const animationFrame = requestAnimationFrame(function animate() {
      setLanterns(prevLanterns => 
        prevLanterns.map(lantern => {
          let newX = lantern.x + lantern.velocityX;
          let newY = lantern.y + lantern.velocityY;
          let newVelocityX = lantern.velocityX;
          let newVelocityY = lantern.velocityY;

          // Bounce off edges
          if (newX <= 0 || newX >= window.innerWidth - 50) {
            newVelocityX = -newVelocityX;
          }
          if (newY <= 0 || newY >= window.innerHeight - 50) {
            newVelocityY = -newVelocityY;
          }

          return {
            ...lantern,
            x: newX,
            y: newY,
            velocityX: newVelocityX,
            velocityY: newVelocityY
          };
        })
      );

      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [showLanterns]);

  return (
    <AnimatePresence mode="wait">
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-b from-black to-neutral-900"
        >
          {/* Floating lanterns effect */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-500/30 rounded-full blur-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial="initial"
                animate="animate"
                custom={i}
                variants={floatingLanternAnimation}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Warm ambient glow */}
          <div className="fixed inset-0 bg-gradient-to-t from-purple-900/10 via-orange-400/5 to-transparent mix-blend-soft-light pointer-events-none" />

          {/* Preload all images in hidden div */}
          <div className="hidden">
            {[...Array(TOTAL_IMAGES)].map((_, index) => (
              <Image
                key={index}
                src={`/images/${index + 1}.jpg`}
                alt={`Preload image ${index + 1}`}
                width={1}
                height={1}
                priority
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 z-50 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Main container */}
          <div className="h-full flex flex-col xl:flex-row">
            {/* Image and Duration section */}
            <div className="w-full xl:w-[50%] h-fit xl:h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center p-6 xl:p-12">
                <motion.div 
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full xl:w-[85%] aspect-square mx-auto group max-w-2xl"
                >
                  {/* Warm glow behind image */}
                  <div className="absolute -inset-4 bg-orange-300/10 blur-2xl rounded-full transform scale-105 group-hover:bg-orange-300/20 transition-all duration-700" />
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-orange-300/10 to-purple-900/20 group-hover:opacity-0 transition-opacity duration-300 rounded-2xl" />
                  
                  <div className="relative w-full h-full">
                    <Image
                      src={`/images/${currentImageIndex + 1}.jpg`}
                      alt={`Slideshow image ${currentImageIndex + 1}`}
                      fill
                      className="object-cover rounded-2xl shadow-2xl"
                      priority
                      sizes="(max-width: 1280px) 90vw, 50vw"
                      quality={100}
                    />
                  </div>

                  {/* Enhanced glow effect */}
                  <div className="absolute -inset-0.5 rounded-2xl blur opacity-50 bg-gradient-to-br from-orange-300/30 to-purple-600/30" />
                </motion.div>
              </div>

              {/* Duration Controls with max-width */}
              <div className="px-6 pb-6 xl:px-12 xl:pb-12 flex justify-center">
                <div className="w-full max-w-md xl:max-w-xl">
                  {/* Progress bar */}
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                      className="h-full bg-white/50"
                      style={{
                        width: audioRef?.current 
                          ? `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%`
                          : `${(elapsedTime / (LYRICS[LYRICS.length - 1].startTime + 3000)) * 100}%`
                      }}
                    />
                  </div>

                  {/* Time Display */}
                  <div className="mt-3 flex items-center justify-between text-sm font-medium">
                    <span className="text-white/60">{formatTime(elapsedTime)}</span>
                    <span className="text-white/60">
                      {audioRef?.current ? formatTime(audioRef.current.duration * 1000) : '--:--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lyrics section with max-width */}
            <div className="w-full xl:w-[50%] flex-1 xl:h-full flex flex-col p-6 xl:p-12">
              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={Math.floor(currentLyricIndex / 3)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg space-y-6 xl:space-y-8"
                  >
                    {getCurrentLyricsGroup().map((lyric, index) => {
                      const absoluteIndex = Math.floor(currentLyricIndex / 3) * 3 + index
                      return (
                        <motion.div
                          key={absoluteIndex}
                          className={`py-1.5 xl:py-2 text-lg xl:text-2xl transition-all duration-500 text-center xl:text-left 
                            ${absoluteIndex === currentLyricIndex
                              ? 'text-white font-medium scale-105 xl:translate-x-4 text-shadow-glow'
                              : 'text-white/30'
                            }`}
                          animate={
                            absoluteIndex === currentLyricIndex
                              ? { 
                                  color: '#ffffff',
                                  textShadow: '0 0 20px rgba(255,255,255,0.3)',
                                  transition: { duration: 0.5 }
                                }
                              : { 
                                  color: 'rgba(255, 255, 255, 0.3)',
                                  textShadow: '0 0 0px rgba(255,255,255,0)',
                                  transition: { duration: 0.5 }
                                }
                          }
                        >
                          {lyric.text}
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Add the lanterns container */}
          <AnimatePresence>
            {showLanterns && (
              <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {lanterns.map((lantern) => (
                  <motion.div
                    key={lantern.id}
                    className="absolute"
                    style={{ 
                      left: lantern.x,
                      top: lantern.y,
                    }}
                    initial="initial"
                    animate="animate"
                    variants={driftingLanternAnimation}
                    transition={{
                      delay: lantern.delay,
                    }}
                  >
                    <div className="relative">
                      {/* Outer pulsing glow */}
                      <motion.div
                        className="absolute -inset-4 bg-yellow-300/20 rounded-full blur-xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: Math.random() * 2, // Random delay for each lantern
                        }}
                      />
                      
                      {/* Lantern body */}
                      <div className="w-8 h-10 bg-orange-400/80 rounded-full relative">
                        {/* Inner pulsing glow */}
                        <motion.div
                          className="absolute inset-0 bg-yellow-300/40 rounded-full blur-md"
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 2, // Different delay for inner glow
                          }}
                        />
                        
                        {/* Lantern details */}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-orange-700/80 rounded" />
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-orange-700/80 rounded" />
                        
                        {/* Central light source */}
                        <motion.div
                          className="absolute inset-1 bg-yellow-200/60 rounded-full blur-sm"
                          animate={{
                            opacity: [0.4, 0.8, 0.4],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 2, // Different delay for center
                          }}
                        />
                      </div>
                      
                      {/* Ambient light effect */}
                      <motion.div
                        className="absolute -inset-8 bg-yellow-300/10 rounded-full blur-2xl"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: Math.random() * 2, // Different delay for ambient
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 