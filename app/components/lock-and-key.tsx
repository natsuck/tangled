"use client"

import * as React from "react"
import { motion, useMotionValue, animate, useSpring } from "framer-motion"
import { Lock, Key } from 'lucide-react'
import { Button } from "@/components/ui/button"
import confetti from 'canvas-confetti'
import { useRef, useState } from "react"
import { Slideshow } from "./slideshow"
import { AUDIO_PATHS } from "../audio"

const LOCK_SIZE = 40
const KEY_SIZE = 40
const COLLISION_THRESHOLD = 50

export default function LockAndKey() {
  const [isUnlocked, setIsUnlocked] = React.useState(false)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const keyX = useMotionValue(0)
  const keyY = useMotionValue(0)
  const lockRotation = useSpring(0, { stiffness: 300, damping: 20 })
  const unlockAudioRef = useRef<HTMLAudioElement | null>(null)
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)

  // Set initial key position
  React.useEffect(() => {
    const updateKeyPosition = () => {
      // Position key 100px to the right of center
      keyX.set(100)
      keyY.set(0)
    }

    // Set initial position
    updateKeyPosition()

    // Update position on window resize
    window.addEventListener('resize', updateKeyPosition)

    return () => {
      window.removeEventListener('resize', updateKeyPosition)
    }
  }, [keyX, keyY])

  const checkCollision = React.useCallback(() => {
    const keyPos = { x: keyX.get(), y: keyY.get() }
    const distance = Math.sqrt(keyPos.x ** 2 + keyPos.y ** 2)
    
    if (distance < COLLISION_THRESHOLD && !isUnlocked) {
      setIsUnlocked(true)
      
      // Play unlock sound
      if (unlockAudioRef.current) {
        unlockAudioRef.current.play()
      }
      
      // Start background music
      if (bgMusicRef.current) {
        bgMusicRef.current.volume = 0.3
        bgMusicRef.current.play()
      }

      // Unlock animation
      animate(lockRotation, 90, {
        type: "spring",
        stiffness: 100,
        damping: 10
      })

      // Success effects
      setTimeout(() => {
        setShowSlideshow(true)
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }, 800)
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
    // Reset key to initial position
    keyX.set(100)
    keyY.set(0)
    
    if (bgMusicRef.current) {
      bgMusicRef.current.pause()
      bgMusicRef.current.currentTime = 0
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-neutral-950 to-black">
      {/* Audio elements */}
      <audio ref={unlockAudioRef} src={AUDIO_PATHS.unlock} preload="auto" />
      <audio ref={bgMusicRef} src={AUDIO_PATHS.bgMusic} preload="auto" loop />

      {/* Slideshow */}
      <Slideshow 
        isPlaying={showSlideshow} 
        onClose={() => {
          setShowSlideshow(false)
          resetLock()
        }} 
        audioRef={bgMusicRef}
      />

      {/* Lock container */}
      <div className="relative w-[300px] h-[300px] flex items-center justify-center">
        {/* Lock circle background */}
        <div className="absolute w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm" />
        
        {/* Lock */}
        <motion.div
          className="absolute"
          style={{ rotate: lockRotation }}
        >
          <Lock 
            className={`w-${LOCK_SIZE} h-${LOCK_SIZE} transition-colors duration-300 ${
              isUnlocked ? "text-pink-500" : "text-white/70"
            }`} 
          />
        </motion.div>

        {/* Key */}
        <motion.div
          drag
          dragConstraints={{
            top: -100,
            left: -100,
            right: 100,
            bottom: 100,
          }}
          dragElastic={0.1}
          dragMomentum={false}
          style={{
            x: keyX,
            y: keyY,
          }}
          className="absolute cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Key
            className={`w-${KEY_SIZE} h-${KEY_SIZE} rotate-90 transition-colors duration-300 ${
              isUnlocked ? "text-pink-500" : "text-white/70"
            }`}
          />
        </motion.div>
      </div>

      {/* Reset button */}
      {!showSlideshow && (
        <Button
          onClick={resetLock}
          className="fixed bottom-8 bg-white/5 backdrop-blur-sm text-white/70 hover:bg-white/10 
                     hover:text-white transition-all duration-300 border border-white/10"
        >
          Reset Lock
        </Button>
      )}
    </div>
  )
}

