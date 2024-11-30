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
  const [hasInteracted, setHasInteracted] = useState(false)
  const keyX = useMotionValue(0)
  const keyY = useMotionValue(0)
  const lockRotation = useSpring(0, { stiffness: 300, damping: 20 })
  const unlockAudioRef = useRef<HTMLAudioElement | null>(null)
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const [audioInitialized, setAudioInitialized] = useState(false)
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [isDragging, setIsDragging] = useState(false)

  React.useEffect(() => {
    const updateKeyPosition = () => {
      keyX.set(150)
      keyY.set(50)
    }

    updateKeyPosition()

    window.addEventListener('resize', updateKeyPosition)
    
    const handleInteraction = () => setHasInteracted(true)
    document.addEventListener('click', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)

    return () => {
      window.removeEventListener('resize', updateKeyPosition)
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [keyX, keyY])

  const initializeAudio = React.useCallback(async () => {
    try {
      if (!audioInitialized && unlockAudioRef.current && bgMusicRef.current) {
        await unlockAudioRef.current.load()
        await bgMusicRef.current.load()
        
        unlockAudioRef.current.volume = 0.5
        bgMusicRef.current.volume = 0.5

        setAudioInitialized(true)
      }
    } catch (error) {
      console.log("Audio initialization failed:", error)
    }
  }, [audioInitialized])

  React.useEffect(() => {
    const handleInteraction = async () => {
      setHasInteracted(true)
      await initializeAudio()
    }

    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('touchstart', handleInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [initializeAudio])

  const playAudio = async (audioElement: HTMLAudioElement) => {
    try {
      if (audioElement.paused) {
        const playPromise = audioElement.play()
        if (playPromise !== undefined) {
          await playPromise
        }
      }
    } catch (error) {
      console.log("Audio playback failed:", error)
    }
  }

  const checkCollision = React.useCallback(() => {
    const keyPos = { x: keyX.get(), y: keyY.get() }
    const distance = Math.sqrt(keyPos.x ** 2 + keyPos.y ** 2)
    
    if (distance < COLLISION_THRESHOLD && !isUnlocked && hasInteracted) {
      setIsUnlocked(true)
      
      if (unlockAudioRef.current && bgMusicRef.current) {
        playAudio(unlockAudioRef.current)
          .then(() => playAudio(bgMusicRef.current!))
          .catch(error => console.log("Audio sequence failed:", error))
      }

      animate(lockRotation, 90, {
        type: "spring",
        stiffness: 100,
        damping: 10
      })

      setTimeout(() => {
        setShowSlideshow(true)
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }, 800)
    }
  }, [isUnlocked, keyX, keyY, lockRotation, hasInteracted])

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
    keyX.set(150)
    keyY.set(50)
    
    if (bgMusicRef.current) {
      bgMusicRef.current.pause()
      bgMusicRef.current.currentTime = 0
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-neutral-950 to-black">
      <audio 
        ref={unlockAudioRef} 
        src={AUDIO_PATHS.unlock} 
        preload="auto"
        playsInline
        muted={!hasInteracted}
      />
      <audio 
        ref={bgMusicRef} 
        src={AUDIO_PATHS.bgMusic} 
        preload="auto" 
        loop
        playsInline
        muted={!hasInteracted}
      />

      {!hasInteracted ? (
        <motion.div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center space-y-6 p-6"
            animate={{ 
              scale: [1, 1.02, 1],
              opacity: [0.8, 1, 0.8] 
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <div className="text-white/90 text-2xl md:text-3xl font-medium mb-4">
              Tap the Key to Begin
            </div>
            <div className="text-white/50 text-sm md:text-base max-w-md mx-auto">
              Tap the key first to enable audio, then drag it to the lock.
            </div>
            
            <motion.div
              className="mt-8 cursor-pointer"
              animate={{ 
                rotate: [0, 10, 0],
                y: [0, -8, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              onClick={() => setHasInteracted(true)}
            >
              <Key className="w-16 h-16 text-pink-500/70" />
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <Slideshow 
            isPlaying={showSlideshow} 
            onClose={() => {
              setShowSlideshow(false)
              resetLock()
            }} 
            audioRef={bgMusicRef}
          />

          <div className="relative w-[300px] h-[300px] flex items-center justify-center">
            <div className="absolute w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm" />
            
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

            <motion.div
              drag
              dragConstraints={{
                top: -150,
                left: -150,
                right: 150,
                bottom: 150,
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

          {!showSlideshow && (
            <Button
              onClick={resetLock}
              className="fixed bottom-8 bg-white/5 backdrop-blur-sm text-white/70 hover:bg-white/10 
                         hover:text-white transition-all duration-300 border border-white/10"
            >
              Reset Lock
            </Button>
          )}
        </>
      )}
    </div>
  )
}

