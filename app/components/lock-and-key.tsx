"use client"

import * as React from "react"
import { motion, useMotionValue, useTransform, animate, useSpring } from "framer-motion"
import { Lock, Key, Heart, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import confetti from 'canvas-confetti'
import { useRef, useState } from "react"
import { Slideshow } from "./slideshow"
import { AUDIO_PATHS } from "../audio"

const LOCK_SIZE = 56
const KEY_SIZE = 56
const COLLISION_THRESHOLD = LOCK_SIZE / 2

export default function LockAndKey() {
  const [isUnlocked, setIsUnlocked] = React.useState(false)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const keyX = useMotionValue(0)
  const keyY = useMotionValue(0)
  const lockRotation = useSpring(0, { stiffness: 300, damping: 20 })
  const unlockAudioRef = useRef<HTMLAudioElement | null>(null)
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)

  const checkCollision = React.useCallback(() => {
    const keyPos = { x: keyX.get(), y: keyY.get() }
    const distance = Math.sqrt(keyPos.x ** 2 + keyPos.y ** 2)
    
    if (distance < COLLISION_THRESHOLD && !isUnlocked) {
      setIsUnlocked(true)
      
      if (unlockAudioRef.current) {
        unlockAudioRef.current.play()
      }
      
      if (bgMusicRef.current) {
        bgMusicRef.current.volume = 0.3
        bgMusicRef.current.play()
      }

      lockRotation.set(0)
      animate(lockRotation, [0, -10, 45], {
        duration: 0.4,
        times: [0, 0.3, 1],
        type: "spring",
        stiffness: 200,
        damping: 15
      })

      animate(keyX, [0, -5, 0], {
        duration: 0.3,
        times: [0, 0.5, 1]
      })

      setTimeout(() => {
        setShowSlideshow(true)
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.6 }
        })
      }, 500)
    }
  }, [isUnlocked, keyX, keyY, lockRotation])

  React.useEffect(() => {
    const unsubscribeX = keyX.onChange(checkCollision)
    const unsubscribeY = keyY.onChange(checkCollision)

    return () => {
      unsubscribeX()
      unsubscribeY()
    }
  }, [checkCollision, keyX, keyY])

  const resetLock = () => {
    setIsUnlocked(false)
    setShowSlideshow(false)
    lockRotation.set(0)
    keyX.set(100)
    keyY.set(100)
    
    if (bgMusicRef.current) {
      bgMusicRef.current.pause()
      bgMusicRef.current.currentTime = 0
    }
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-gradient-to-br from-violet-100 via-pink-100 to-purple-200">
      <audio ref={unlockAudioRef} src={AUDIO_PATHS.unlock} preload="auto" />
      <audio ref={bgMusicRef} src={AUDIO_PATHS.bgMusic} preload="auto" loop />

      <Slideshow 
        isPlaying={showSlideshow} 
        onClose={() => {
          setShowSlideshow(false)
          resetLock()
        }} 
        audioRef={bgMusicRef}
      />

      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className="h-3 w-3 text-pink-300/40" />
          </motion.div>
        ))}
      </div>

      <div className="relative h-64 w-64 rounded-full bg-white/20 backdrop-blur-lg shadow-lg flex items-center justify-center">
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ rotate: lockRotation }}
          animate={isUnlocked ? {
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 0.5,
            times: [0, 0.5, 1]
          }}
        >
          <motion.div
            animate={isUnlocked ? {
              filter: ["drop-shadow(0 0 0px #ec4899)", "drop-shadow(0 0 10px #ec4899)", "drop-shadow(0 0 5px #ec4899)"],
            } : {}}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Lock 
              className={`h-${LOCK_SIZE} w-${LOCK_SIZE} transition-colors duration-300 ${
                isUnlocked ? "text-pink-500" : "text-gray-700"
              }`} 
            />
          </motion.div>
        </motion.div>

        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  rotate: (i * 45),
                  x: 40,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              >
                <Sparkles className="h-4 w-4 text-pink-500" />
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          drag
          dragConstraints={{
            top: -300,
            left: -300,
            right: 300,
            bottom: 300,
          }}
          dragElastic={0.1}
          dragMomentum={false}
          style={{
            x: keyX,
            y: keyY,
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.95 }}
        >
          <Key
            className={`h-${KEY_SIZE} w-${KEY_SIZE} rotate-90 transition-all duration-300 ${
              isUnlocked ? "text-pink-500 drop-shadow-lg" : "text-gray-700"
            }`}
          />
        </motion.div>
      </div>

      {!showSlideshow && (
        <Button
          onClick={resetLock}
          className="absolute bottom-8 bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white/90 shadow-md transition-all duration-300"
        >
          Reset Lock
        </Button>
      )}
    </div>
  )
}

