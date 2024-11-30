"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"

const LYRICS = [
  {
    text: "Kapag naaalala ko ang mga araw na magkasama tayong dalawa",
    startTime: 0,
  },
  {
    text: "Ngiti at luha sa aking mga mata ganun na pala tayo dati kasaya",
    startTime: 7000,
  },
  {
    text: "Yung tipong kapag tayo'y nagkatitigan",
    startTime: 14000,
  },
  {
    text: "Magngingitian para bang nahihibang",
    startTime: 18000,
  },
  {
    text: "Mag-iingay kahit sobrang tahimik ng kapaligiran",
    startTime: 21000,
  },
  {
    text: "Kahit may nagrereklamo na'y wala tayong pakialam",
    startTime: 26000,
  },
  {
    text: "Panahong nandun ka pa laging pumupunta",
    startTime: 29000,
  },
  {
    text: "'Di inaasahan may sorpresa ka laging dala",
    startTime: 34000,
  },
  {
    text: "Ang saya saya ayoko lang pahalata",
    startTime: 38000,
  },
  {
    text: "Kase okay na naman ako basta makasama ka",
    startTime: 41000,
  },
  {
    text: "Kaso lang wala na pero alam ko na masaya ka na",
    startTime: 45000,
  },
  {
    text: "Sa mundo ko wala nang makagagawa",
    startTime: 51000,
  },
  {
    text: "Makakatumbas ng 'yong napadama",
    startTime: 54000,
  },
  {
    text: "Kaya salamat sa pag-ibig mo",
    startTime: 57000,
  },
  {
    text: "Pag-ibig mo lagi kang nasa puso't isip ko isip ko",
    startTime: 60000,
  },
  {
    text: "At inaamin ko na namimiss kita na namimiss kita",
    startTime: 64000,
  },
  {
    text: "Sa'kin ikaw pa rin ang bibi ko ang bibi ko",
    startTime: 73000,
  },
  {
    text: "Kahit wala ka na sa piling ko sa piling ko",
    startTime: 75000,
  },
  {
    text: "Pangakong ipagdarasal pa rin kita ipagdadasal pa rin kita",
    startTime: 79000,
  }
]

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

export function Slideshow({ isPlaying, onClose, audioRef }: SlideshowProps) {
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

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
      setCurrentImageIndex(prev => (prev + 1) % 7)
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

  return (
    <AnimatePresence mode="wait">
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-b from-black to-neutral-900"
        >
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
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 group-hover:opacity-0 transition-opacity duration-300" />
                  
                  <Image
                    src={`/images/${currentImageIndex + 1}.jpg`}
                    alt={`Slideshow image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover rounded-2xl shadow-2xl"
                    priority
                    sizes="(max-width: 1280px) 90vw, 50vw"
                    quality={100}
                  />

                  <div className="absolute -inset-0.5 rounded-2xl blur opacity-50" />
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
                          className={`py-1.5 xl:py-2 text-lg xl:text-2xl transition-all duration-500 text-center xl:text-left ${
                            absoluteIndex === currentLyricIndex
                              ? 'text-white font-medium scale-105 xl:translate-x-4'
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
        </motion.div>
      )}
    </AnimatePresence>
  )
} 